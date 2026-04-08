"""
Feature extraction from raw email text.

Security rationale: we derive explicit fields (URLs, mismatches, urgency cues)
instead of forwarding opaque blobs to downstream components. That reduces
untrusted-content blast radius in prompts and gives a stable audit trail.
"""

from __future__ import annotations

import email
import re
from email.header import decode_header, make_header
from email.policy import default as email_policy
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

import tldextract

from .schemas import ExtractedFeatures, LinkMismatch

URGENCY_KEYWORDS = (
    "urgent",
    "immediately",
    "verify your account",
    "account suspended",
    "unusual activity",
    "click here",
    "confirm your",
    "password expir",
    "security alert",
    "within 24 hours",
    "act now",
    "wire transfer",
    "gift card",
)

URL_RE = re.compile(
    r"https?://[^\s<>()\[\]\"']+",
    re.IGNORECASE,
)

A_TAG_RE = re.compile(
    r'<a\s+[^>]*href\s*=\s*["\']([^"\']+)["\'][^>]*>(.*?)</a>',
    re.IGNORECASE | re.DOTALL,
)

MD_LINK_RE = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")

DOMAIN_LIKE = re.compile(
    r"\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}\b",
    re.IGNORECASE,
)

BODY_SNIPPET_MAX = 4000


def _decode_mime_header(value: str | None) -> str | None:
    if not value:
        return None
    try:
        return str(make_header(decode_header(value)))
    except Exception:
        return value


def _get_text_body(msg: email.message.Message) -> str:
    """Prefer text/plain; walk multipart for first decodable text part."""
    if msg.is_multipart():
        for part in msg.walk():
            ctype = part.get_content_type()
            if ctype == "text/plain":
                try:
                    return part.get_content()
                except Exception:
                    continue
        for part in msg.walk():
            if part.get_content_type() == "text/html":
                try:
                    return part.get_content()
                except Exception:
                    continue
    try:
        return msg.get_content()
    except Exception:
        return ""


def _normalize_url_for_dedupe(url: str) -> str:
    parts = urlsplit(url.strip())
    if not parts.scheme or not parts.netloc:
        return url.strip()
    q = [
        (k, v)
        for k, v in parse_qsl(parts.query, keep_blank_values=True)
        if k.lower() not in {"utm_source", "utm_medium", "utm_campaign", "utm_content"}
    ]
    new_query = urlencode(q)
    return urlunsplit((parts.scheme.lower(), parts.netloc.lower(), parts.path, new_query, ""))


def _registrable_domain(host: str) -> str:
    host = host.lower().split(":")[0].strip(".")
    ext = tldextract.extract(host)
    tdu = ext.top_domain_under_public_suffix
    if tdu:
        return tdu
    return host


def _extract_urls(text: str) -> list[str]:
    found = URL_RE.findall(text or "")
    seen: set[str] = set()
    out: list[str] = []
    for u in found:
        key = _normalize_url_for_dedupe(u)
        if key not in seen:
            seen.add(key)
            out.append(u.strip())
    return out


def _urgency_hits(text: str) -> list[str]:
    lower = (text or "").lower()
    return [kw for kw in URGENCY_KEYWORDS if kw in lower]


def _link_mismatches_from_html_and_markdown(text: str) -> list[LinkMismatch]:
    mismatches: list[LinkMismatch] = []
    if not text:
        return mismatches

    for m in A_TAG_RE.finditer(text):
        href = m.group(1).strip()
        inner = re.sub(r"<[^>]+>", " ", m.group(2))
        inner = " ".join(inner.split())
        _maybe_add_mismatch(href, inner, mismatches)

    for m in MD_LINK_RE.finditer(text):
        inner = m.group(1).strip()
        href = m.group(2).strip()
        _maybe_add_mismatch(href, inner, mismatches)

    return mismatches


def _maybe_add_mismatch(href: str, anchor_text: str, out: list[LinkMismatch]) -> None:
    if not href or not anchor_text:
        return
    if not href.startswith(("http://", "https://")):
        return
    parts = urlsplit(href)
    host = (parts.hostname or "").lower()
    if not host:
        return
    href_reg = _registrable_domain(host)

    candidates = DOMAIN_LIKE.findall(anchor_text)
    for disp in candidates:
        disp_reg = _registrable_domain(disp)
        if disp_reg and disp_reg != href_reg:
            out.append(
                LinkMismatch(
                    anchor_text=anchor_text[:500],
                    href=href[:2000],
                    display_domain_guess=disp_reg,
                    href_host=href_reg,
                    note="Anchor text references a domain that differs from the link target host.",
                )
            )
            return


def extract_features(raw_email: str) -> ExtractedFeatures:
    notes: list[str] = []
    text = raw_email or ""
    sender: str | None = None
    subject: str | None = None
    body = text

    try:
        msg = email.message_from_string(text, policy=email_policy)
        sender = _decode_mime_header(msg.get("From"))
        subject = _decode_mime_header(msg.get("Subject"))
        body = _get_text_body(msg) or text
    except Exception:
        notes.append("RFC parse failed; used heuristic line extraction.")
        sender = _heuristic_header(text, r"(?i)^from:\s*(.+)$")
        subject = _heuristic_header(text, r"(?i)^subject:\s*(.+)$")
        body = _heuristic_body_after_headers(text)

    body = body or ""
    snippet = body[:BODY_SNIPPET_MAX]
    if len(body) > BODY_SNIPPET_MAX:
        notes.append(f"Body truncated for analysis ({BODY_SNIPPET_MAX} chars).")

    urls = _extract_urls(text)
    reg_domains: list[str] = []
    seen_dom: set[str] = set()
    for u in urls:
        try:
            h = urlsplit(u).hostname
            if h:
                rd = _registrable_domain(h)
                if rd not in seen_dom:
                    seen_dom.add(rd)
                    reg_domains.append(rd)
        except Exception:
            continue

    mismatches = _link_mismatches_from_html_and_markdown(body)
    mismatches += _link_mismatches_from_html_and_markdown(text)
    uniq: dict[tuple[str, str | None], LinkMismatch] = {}
    for lm in mismatches:
        key = (lm.href, lm.display_domain_guess)
        uniq[key] = lm
    mismatches = list(uniq.values())

    return ExtractedFeatures(
        sender=sender,
        subject=subject,
        body_char_count=len(body),
        body_snippet=snippet,
        urls=urls,
        unique_registered_domains=reg_domains,
        urgency_keyword_hits=list(
            dict.fromkeys(_urgency_hits(body) + _urgency_hits(subject or ""))
        ),
        link_mismatches=mismatches,
        parsing_notes=notes,
    )


def _heuristic_header(blob: str, pattern: str) -> str | None:
    for line in blob.splitlines()[:50]:
        m = re.match(pattern, line.strip())
        if m:
            return m.group(1).strip()
    return None


def _heuristic_body_after_headers(blob: str) -> str:
    lines = blob.splitlines()
    skip = 0
    for i, line in enumerate(lines):
        if re.match(r"(?i)^(from|to|subject|date|message-id|mime-version):\s*", line):
            skip = i + 1
        elif skip and line.strip() == "":
            return "\n".join(lines[skip:]).strip()
    return blob

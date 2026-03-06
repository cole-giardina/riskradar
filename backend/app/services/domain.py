"""Domain health - check if a domain has been breached."""
import httpx
from urllib.parse import quote
from app.config import settings

HIBP_BASE = "https://haveibeenpwned.com/api/v3"
XON_BASE = "https://api.xposedornot.com/v1"
USER_AGENT = "RiskRadar-SecurityScore/1.0"


def extract_domain(email_or_domain: str) -> str:
    """Extract domain from email (user@domain.com) or return as-is if already domain."""
    s = email_or_domain.strip().lower()
    if "@" in s:
        return s.split("@")[-1]
    return s


async def check_domain_hibp(domain: str) -> dict:
    """Check domain breaches via HIBP (requires API key)."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                f"{HIBP_BASE}/breacheddomain/{quote(domain)}",
                headers={
                    "hibp-api-key": settings.hibp_api_key,
                    "User-Agent": USER_AGENT,
                },
            )
            if resp.status_code == 404:
                return {"found": False, "breach_count": 0, "breaches": [], "message": "No breaches found for domain"}
            if resp.status_code != 200:
                return {"found": False, "breach_count": 0, "breaches": [], "message": f"API error: {resp.status_code}"}
            data = resp.json()
            breaches = data.get("Breaches", []) if isinstance(data, dict) else (data if isinstance(data, list) else [])
            return {
                "found": len(breaches) > 0,
                "breach_count": len(breaches),
                "breaches": [{"name": b.get("Name", "Unknown")} for b in breaches],
                "message": f"Domain found in {len(breaches)} breach(es)" if breaches else "No breaches found",
            }
    except httpx.RequestError as e:
        return {"found": False, "breach_count": 0, "breaches": [], "message": f"Request failed: {str(e)}"}


async def check_domain(domain_or_email: str) -> dict:
    """Check if domain has been breached. Requires HIBP API key."""
    domain = extract_domain(domain_or_email)
    if not settings.hibp_api_key:
        return {
            "found": False,
            "breach_count": 0,
            "breaches": [],
            "message": "Domain check requires HIBP API key. Add HIBP_API_KEY to .env",
        }
    return await check_domain_hibp(domain)

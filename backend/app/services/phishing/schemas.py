"""
Pydantic models for the phishing analysis pipeline.

Kept separate from the main RiskRadar SQLAlchemy models to avoid naming
collisions while preserving the original API contract.
"""

from typing import Literal

from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    raw_email: str = Field(
        ...,
        min_length=1,
        max_length=256_000,
        description="Full or partial RFC 822-style message, or unstructured text.",
    )


class LinkMismatch(BaseModel):
    anchor_text: str
    href: str
    display_domain_guess: str | None
    href_host: str
    note: str


class ExtractedFeatures(BaseModel):
    sender: str | None = None
    subject: str | None = None
    body_char_count: int = 0
    body_snippet: str = Field(default="")
    urls: list[str] = Field(default_factory=list)
    unique_registered_domains: list[str] = Field(default_factory=list)
    urgency_keyword_hits: list[str] = Field(default_factory=list)
    link_mismatches: list[LinkMismatch] = Field(default_factory=list)
    parsing_notes: list[str] = Field(default_factory=list)


Verdict = Literal["phishing", "suspicious", "safe"]


class DetectionResult(BaseModel):
    verdict: Verdict
    confidence: float = Field(..., ge=0.0, le=1.0)
    signals: list[str] = Field(default_factory=list)
    explanation: str


class AnalyzeResponse(BaseModel):
    features: ExtractedFeatures
    detection: DetectionResult

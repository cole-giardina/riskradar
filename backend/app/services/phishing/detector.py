"""
Offline rule-based phishing classifier.

No API keys required. Applies fixed heuristics over extracted features
to produce a verdict. Suitable for CI, offline evaluation, and as the
default embedded classifier in RiskRadar.
"""

from __future__ import annotations

from .schemas import DetectionResult, ExtractedFeatures


class OfflinePhishingDetector:
    """Rule-based classifier implementing the PhishingClassifier protocol."""

    def classify(self, features: ExtractedFeatures) -> DetectionResult:
        signals: list[str] = []
        if features.link_mismatches:
            signals.append("Anchor text references a domain that differs from the link host.")
            return DetectionResult(
                verdict="phishing",
                confidence=0.88,
                signals=signals,
                explanation="Link display/target mismatch is a strong deception signal.",
            )
        if features.urgency_keyword_hits and features.unique_registered_domains:
            signals.append("Urgency language combined with outbound links.")
            return DetectionResult(
                verdict="suspicious",
                confidence=0.62,
                signals=signals,
                explanation="Pressure cues and links warrant manual review.",
            )
        if features.unique_registered_domains:
            return DetectionResult(
                verdict="suspicious",
                confidence=0.45,
                signals=[
                    "Message contains external URLs; verify sender and destination.",
                ],
                explanation=(
                    "URLs present without stronger deception signals; "
                    "treat as low-confidence risk."
                ),
            )
        return DetectionResult(
            verdict="safe",
            confidence=0.72,
            signals=[
                "No strong structural or lexical phishing signals in extracted features.",
            ],
            explanation=(
                "No link mismatches or urgency+URL combinations detected "
                "in the extracted features."
            ),
        )

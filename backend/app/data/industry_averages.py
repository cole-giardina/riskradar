"""Industry average security scores for comparison."""

INDUSTRY_AVERAGES = {
    "overall": 58,
    "tech": 67,
    "finance": 62,
    "healthcare": 55,
    "education": 52,
    "general": 58,
}


def get_percentile(score: int, industry: str = "overall") -> int:
    """Estimate percentile (0-100) based on score. Higher score = higher percentile."""
    avg = INDUSTRY_AVERAGES.get(industry, INDUSTRY_AVERAGES["overall"])
    # Simple model: score 50 = 50th percentile, each 10 points ≈ 15 percentile
    diff = score - avg
    percentile = 50 + int(diff * 1.5)
    return max(1, min(99, percentile))

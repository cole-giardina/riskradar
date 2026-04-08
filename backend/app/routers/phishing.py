from fastapi import APIRouter, Request

from app.rate_limit import limiter
from app.services.phishing import (
    AnalyzeRequest,
    AnalyzeResponse,
    extract_features,
    OfflinePhishingDetector,
)

router = APIRouter()
_detector = OfflinePhishingDetector()


@router.post("/analyze", response_model=AnalyzeResponse)
@limiter.limit("5/minute")
async def analyze_email(
    request: Request,
    body: AnalyzeRequest,
):
    features = extract_features(body.raw_email)
    detection = _detector.classify(features)
    return AnalyzeResponse(features=features, detection=detection)

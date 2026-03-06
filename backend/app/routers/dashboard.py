from fastapi import APIRouter, Depends, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from pydantic import BaseModel

from app.database import get_db
from app.auth import require_user
from app.models import User, SecurityScore
from app.schemas import DashboardResponse, SecurityScoreResponse
from app.data.industry_averages import get_percentile

router = APIRouter()


@router.get("", response_model=DashboardResponse)
async def get_dashboard(
    user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SecurityScore)
        .where(SecurityScore.user_id == user.id)
        .order_by(desc(SecurityScore.created_at))
        .limit(30)
    )
    scores = result.scalars().all()

    current = scores[0] if scores else None
    score_history = [
        {"score": s.score, "date": s.created_at.isoformat()}
        for s in reversed(scores)
    ]

    percentile = get_percentile(current.score) if current else None
    return DashboardResponse(
        current_score=SecurityScoreResponse(
            id=current.id,
            score=current.score,
            breach_count=current.breach_count,
            password_strength=current.password_strength,
            risks=current.risks or [],
            recommendations=current.recommendations or [],
            created_at=current.created_at,
        )
        if current
        else None,
        score_history=score_history,
        risks=current.risks or [] if current else [],
        recommendations=current.recommendations or [] if current else [],
        percentile=percentile,
        industry_average=58,
    )


class CalculateScoreRequest(BaseModel):
    breach_count: int = 0
    password_strength: float | None = None
    quiz_score: int = 0
    risks: list[str] = []
    recommendations: list[str] = []


@router.post("/calculate", response_model=SecurityScoreResponse)
async def calculate_and_save_score(
    data: CalculateScoreRequest = Body(...),
    user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Calculate composite security score and save.
    Called by frontend after gathering breach, password, quiz data.
    """
    # Base score: 50. Adjust based on breach (-10 per breach), password (+0-25), quiz (+0-25)
    base = 50
    breach_penalty = min(30, data.breach_count * 10)
    password_bonus = (data.password_strength or 0) / 4  # 0-25
    quiz_bonus = data.quiz_score / 4  # 0-25

    score = int(base - breach_penalty + password_bonus + quiz_bonus)
    score = max(0, min(100, score))

    security_score = SecurityScore(
        user_id=user.id,
        score=score,
        breach_count=data.breach_count,
        password_strength=data.password_strength,
        risks=data.risks,
        recommendations=data.recommendations,
    )
    db.add(security_score)
    user.last_scan_at = security_score.created_at
    await db.flush()
    await db.refresh(security_score)

    return SecurityScoreResponse(
        id=security_score.id,
        score=security_score.score,
        breach_count=security_score.breach_count,
        password_strength=security_score.password_strength,
        risks=security_score.risks or [],
        recommendations=security_score.recommendations or [],
        created_at=security_score.created_at,
    )

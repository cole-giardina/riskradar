"""Public profile - shareable score report."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.database import get_db
from app.models import User, SecurityScore

router = APIRouter()


@router.get("/score/{username}")
async def get_public_score(username: str, db: AsyncSession = Depends(get_db)):

    result = await db.execute(
        select(User).where(
            User.public_username == username.lower(),
            User.public_profile_enabled == 1,
        )
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Profile not found")

    score_result = await db.execute(
        select(SecurityScore)
        .where(SecurityScore.user_id == user.id)
        .order_by(desc(SecurityScore.created_at))
        .limit(1)
    )
    score = score_result.scalar_one_or_none()
    if not score:
        raise HTTPException(status_code=404, detail="No score yet")

    return {
        "username": user.public_username,
        "display_name": user.display_name or user.public_username,
        "score": score.score,
        "breach_count": score.breach_count,
        "risks": score.risks or [],
        "recommendations": score.recommendations or [],
        "created_at": score.created_at.isoformat(),
    }

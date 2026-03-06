from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.database import get_db
from app.auth import require_user, get_pending_2fa_user, verify_totp, create_access_token
from app.models import User
from app.schemas import UserResponse, Token

router = APIRouter()


class Verify2FARequest(BaseModel):
    code: str


@router.post("/verify", response_model=Token)
async def verify_2fa(
    body: Verify2FARequest,
    user: User = Depends(get_pending_2fa_user),
    db: AsyncSession = Depends(get_db),
):
    if not user or not user.totp_secret:
        raise HTTPException(status_code=401, detail="Invalid or expired 2FA session")

    if not verify_totp(user.totp_secret, body.code):
        raise HTTPException(status_code=401, detail="Invalid verification code")

    token = create_access_token({"sub": str(user.id)})
    return Token(
        access_token=token,
        user=UserResponse(
            id=user.id,
            email=user.email,
            display_name=user.display_name,
            created_at=user.created_at,
        ),
    )

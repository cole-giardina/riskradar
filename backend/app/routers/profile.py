"""Profile settings: 2FA setup, public profile, reminders."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
import qrcode
import io
import base64

from app.database import get_db
from app.auth import require_user, generate_totp_secret, get_totp_uri, verify_totp
from app.models import User

router = APIRouter()


class Setup2FARequest(BaseModel):
    pass


class VerifySetup2FARequest(BaseModel):
    code: str


class Disable2FARequest(BaseModel):
    code: str


class PublicProfileRequest(BaseModel):
    username: str | None = None
    enabled: bool


@router.post("/2fa/setup")
async def setup_2fa(
    user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate new TOTP secret. Call verify to enable."""
    secret = generate_totp_secret()
    user.totp_secret = secret
    user.totp_enabled = 0  # Not enabled until verified
    await db.flush()
    uri = get_totp_uri(secret, user.email)
    img = qrcode.make(uri)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    qr_b64 = base64.b64encode(buf.getvalue()).decode()
    return {"secret": secret, "qr_code": f"data:image/png;base64,{qr_b64}"}


@router.post("/2fa/verify-setup")
async def verify_setup_2fa(
    body: VerifySetup2FARequest,
    user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db),
):
    if not user.totp_secret:
        raise HTTPException(status_code=400, detail="Run setup first")
    if not verify_totp(user.totp_secret, body.code):
        raise HTTPException(status_code=400, detail="Invalid code")
    user.totp_enabled = 1
    await db.flush()
    return {"enabled": True}


@router.post("/2fa/disable")
async def disable_2fa(
    body: Disable2FARequest,
    user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db),
):
    if not user.totp_secret:
        return {"enabled": False}
    if not verify_totp(user.totp_secret, body.code):
        raise HTTPException(status_code=400, detail="Invalid code")
    user.totp_secret = None
    user.totp_enabled = 0
    await db.flush()
    return {"enabled": False}


@router.put("/public")
async def update_public_profile(
    body: PublicProfileRequest,
    user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db),
):
    """Set public username and enable/disable public profile."""
    from sqlalchemy import select

    if body.enabled and body.username:
        # Check username available
        result = await db.execute(
            select(User).where(
                User.public_username == body.username.lower(),
                User.id != user.id,
            )
        )
        if result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Username taken")
        user.public_username = body.username.lower().replace(" ", "_")[:50]
    user.public_profile_enabled = 1 if body.enabled else 0
    if not body.enabled:
        user.public_username = None
    await db.flush()
    return {"username": user.public_username, "enabled": bool(user.public_profile_enabled)}

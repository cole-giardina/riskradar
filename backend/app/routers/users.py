from fastapi import APIRouter, Depends

from app.auth import require_user
from app.models import User
from app.schemas import UserResponse

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_me(user: User = Depends(require_user)):
    return UserResponse(
        id=user.id,
        email=user.email,
        display_name=user.display_name,
        created_at=user.created_at,
        totp_enabled=bool(user.totp_enabled),
        public_username=user.public_username,
        public_profile_enabled=bool(user.public_profile_enabled),
        last_scan_at=user.last_scan_at,
    )

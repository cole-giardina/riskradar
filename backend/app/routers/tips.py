import random
from fastapi import APIRouter, Depends

from app.auth import get_current_user
from app.models import User
from app.data.tips import SECURITY_TIPS

router = APIRouter()


@router.get("")
async def get_tips(user: User | None = Depends(get_current_user)):
    """Return 5 random security tips. Auth optional."""
    tips = random.sample(SECURITY_TIPS, min(5, len(SECURITY_TIPS)))
    return {"tips": tips}

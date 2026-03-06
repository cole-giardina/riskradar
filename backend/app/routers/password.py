from fastapi import APIRouter, Depends

from app.auth import require_user
from app.models import User
from app.schemas import PasswordCheckRequest, PasswordStrengthResult, PasswordReuseRequest, PasswordReuseResult
from app.services.password import analyze_password, check_pwned_password, check_password_reuse

router = APIRouter()


@router.post("/check", response_model=PasswordStrengthResult)
async def check_password_strength(
    request: PasswordCheckRequest,
    user: User = Depends(require_user),
):
    analysis = analyze_password(request.password)
    is_pwned, pwned_count = await check_pwned_password(request.password)

    return PasswordStrengthResult(
        entropy=analysis["entropy"],
        crack_time_display=analysis["crack_time_display"],
        crack_time_seconds=analysis["crack_time_seconds"],
        strength_score=analysis["strength_score"],
        feedback=analysis["feedback"],
        is_pwned=is_pwned,
        pwned_count=pwned_count,
    )


@router.post("/check-reuse", response_model=PasswordReuseResult)
async def check_password_reuse_endpoint(
    request: PasswordReuseRequest,
    user: User = Depends(require_user),
):
    result = await check_password_reuse(request.passwords)
    return PasswordReuseResult(**result)

from fastapi import APIRouter, Depends, Request

from app.auth import require_user
from app.models import User
from app.rate_limit import limiter
from app.schemas import BreachCheckRequest, BreachResult
from app.services.breach import check_breach

router = APIRouter()


@router.post("/check", response_model=BreachResult)
@limiter.limit("5/minute")  # Rate limit breach checks
async def check_email_breach(
    request: Request,
    body: BreachCheckRequest,
    user: User = Depends(require_user),
):
    result = await check_breach(body.email.strip())
    return BreachResult(**result)

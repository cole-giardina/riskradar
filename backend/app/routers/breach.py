from fastapi import APIRouter, Request

from app.rate_limit import limiter
from app.schemas import BreachCheckRequest, BreachResult
from app.services.breach import check_breach

router = APIRouter()


@router.post("/check", response_model=BreachResult)
@limiter.limit("5/minute")
async def check_email_breach(
    request: Request,
    body: BreachCheckRequest,
):
    result = await check_breach(body.email.strip())
    return BreachResult(**result)

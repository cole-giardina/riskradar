from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel

from app.auth import require_user
from app.models import User
from app.rate_limit import limiter
from app.services.paste import check_pastes

router = APIRouter()


class PasteCheckRequest(BaseModel):
    email: str


@router.post("/check")
@limiter.limit("5/minute")
async def check_email_pastes(
    request: Request,
    body: PasteCheckRequest,
    user: User = Depends(require_user),
):
    result = await check_pastes(body.email.strip())
    return result

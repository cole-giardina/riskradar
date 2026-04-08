from fastapi import APIRouter, Request
from pydantic import BaseModel

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
):
    result = await check_pastes(body.email.strip())
    return result

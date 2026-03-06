from fastapi import APIRouter, Depends, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from pydantic import BaseModel

from app.auth import require_user
from app.models import User
from app.services.paste import check_pastes

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


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

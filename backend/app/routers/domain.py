from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.auth import require_user
from app.models import User
from app.services.domain import check_domain

router = APIRouter()


class DomainCheckRequest(BaseModel):
    domain: str  # Can be domain.com or user@domain.com


@router.post("/check")
async def check_domain_breaches(
    body: DomainCheckRequest,
    user: User = Depends(require_user),
):
    result = await check_domain(body.domain.strip())
    return result

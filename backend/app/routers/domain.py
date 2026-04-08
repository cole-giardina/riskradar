from fastapi import APIRouter
from pydantic import BaseModel

from app.services.domain import check_domain

router = APIRouter()


class DomainCheckRequest(BaseModel):
    domain: str


@router.post("/check")
async def check_domain_breaches(body: DomainCheckRequest):
    result = await check_domain(body.domain.strip())
    return result

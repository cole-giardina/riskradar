from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from app.database import get_db
from app.auth import require_user
from app.models import User, UserReminder

router = APIRouter()


class CreateReminderRequest(BaseModel):
    reminder_type: str  # breach_check, password_rotate
    days_from_now: int = 7


@router.get("")
async def get_reminders(
    user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(UserReminder).where(UserReminder.user_id == user.id, UserReminder.enabled == 1)
    )
    reminders = result.scalars().all()
    return {
        "reminders": [
            {
                "id": r.id,
                "type": r.reminder_type,
                "due_date": r.due_date.isoformat(),
                "enabled": bool(r.enabled),
            }
            for r in reminders
        ],
    }


@router.post("")
async def create_reminder(
    body: CreateReminderRequest,
    user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db),
):
    due = datetime.utcnow() + timedelta(days=body.days_from_now)
    r = UserReminder(
        user_id=user.id,
        reminder_type=body.reminder_type,
        due_date=due,
    )
    db.add(r)
    await db.flush()
    return {"id": r.id, "type": r.reminder_type, "due_date": r.due_date.isoformat()}


@router.delete("/{reminder_id}")
async def delete_reminder(
    reminder_id: int,
    user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db),
):
    from sqlalchemy import delete
    result = await db.execute(
        delete(UserReminder).where(
            UserReminder.id == reminder_id,
            UserReminder.user_id == user.id,
        )
    )
    return {"deleted": result.rowcount > 0}

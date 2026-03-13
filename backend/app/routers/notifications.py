"""Notification endpoints."""
from fastapi import APIRouter, HTTPException

router = APIRouter()


@router.post("/send-reminder")
async def send_reminder():
    """Manually trigger rent reminder to a tenant."""
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.get("/history")
async def notification_history():
    """View sent notification history."""
    return {"data": [], "meta": {"total": 0, "page": 1}}


@router.patch("/preferences")
async def update_preferences():
    """Update notification preferences."""
    raise HTTPException(status_code=501, detail="Not implemented yet")

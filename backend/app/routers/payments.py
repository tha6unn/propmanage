"""Payment tracking endpoints."""
from fastapi import APIRouter, HTTPException
from app.models.schemas import PaymentLog

router = APIRouter()


@router.get("/")
async def list_payments(tenancy_id: str = None, status: str = None):
    """List rent payments, filterable by tenancy and status."""
    return {"data": [], "meta": {"total": 0, "page": 1}}


@router.post("/log", status_code=201)
async def log_payment(request: PaymentLog):
    """Log a rent payment received."""
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.get("/summary")
async def payment_summary():
    """Get portfolio payment summary (collected, outstanding, overdue)."""
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.get("/{payment_id}")
async def get_payment(payment_id: str):
    """Get payment details."""
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.patch("/{payment_id}")
async def update_payment(payment_id: str):
    """Update payment status."""
    raise HTTPException(status_code=501, detail="Not implemented yet")

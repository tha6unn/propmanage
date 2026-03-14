"""Notification endpoints."""
from fastapi import APIRouter, Depends, Query
from app.middleware.auth import get_current_user
from app.services.supabase import get_supabase_admin
from app.utils.pagination import paginate_params, paginated_response

router = APIRouter()


@router.post("/send-reminder")
async def send_reminder(
    tenancy_id: str = None,
    user: dict = Depends(get_current_user),
):
    """Manually trigger rent reminder to a tenant."""
    from fastapi import HTTPException

    if not tenancy_id:
        raise HTTPException(status_code=400, detail="tenancy_id is required")

    try:
        admin = get_supabase_admin()

        # Get tenancy with property info
        tenancy = (
            admin.table("tenancies")
            .select("*, properties(name, owner_id)")
            .eq("id", tenancy_id)
            .single()
            .execute()
        )

        if not tenancy.data:
            raise HTTPException(status_code=404, detail="Tenancy not found")
        if tenancy.data.get("properties", {}).get("owner_id") != user["id"]:
            raise HTTPException(status_code=403, detail="Access denied")

        email = tenancy.data.get("tenant_invite_email")
        if not email:
            raise HTTPException(status_code=400, detail="No tenant email for this tenancy")

        # Find overdue/pending payments
        from datetime import date
        today = date.today()
        current_month = today.replace(day=1).isoformat()

        pending = (
            admin.table("rent_payments")
            .select("*")
            .eq("tenancy_id", tenancy_id)
            .in_("status", ["pending", "overdue"])
            .lte("payment_month", current_month)
            .order("payment_month", desc=False)
            .limit(1)
            .execute()
        )

        if not pending.data:
            return {"message": "No pending/overdue payments found", "sent": False}

        payment = pending.data[0]
        payment_month = payment.get("payment_month", current_month)
        amount_due = float(payment.get("amount_due", 0)) - float(payment.get("amount_paid", 0))

        from app.services.email_service import send_rent_reminder_email
        success = send_rent_reminder_email(
            to_email=email,
            tenant_name=email.split("@")[0],
            property_name=tenancy.data.get("properties", {}).get("name", "Property"),
            amount_due=amount_due,
            currency=tenancy.data.get("currency", "INR"),
            payment_month=payment_month,
            days_overdue=(today - date.fromisoformat(payment_month)).days if payment.get("status") == "overdue" else 0,
        )

        return {
            "message": "Rent reminder sent" if success else "Reminder logged (email pending)",
            "tenancy_id": tenancy_id,
            "email": email,
            "sent": success,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history")
async def notification_history(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    user: dict = Depends(get_current_user),
):
    """View sent notification history."""
    try:
        admin = get_supabase_admin()
        offset, limit = paginate_params(page, per_page)

        response = (
            admin.table("notification_log")
            .select("*", count="exact")
            .eq("recipient_id", user["id"])
            .order("created_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )

        total = response.count if response.count is not None else len(response.data)
        return paginated_response(response.data or [], total, page, per_page)

    except Exception:
        return paginated_response([], 0, page, per_page)


@router.patch("/preferences")
async def update_preferences(
    user: dict = Depends(get_current_user),
):
    """Update notification preferences. (Coming in Sprint 4)"""
    return {"message": "Notification preferences update coming soon."}

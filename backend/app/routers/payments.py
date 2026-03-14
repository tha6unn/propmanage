"""Payment tracking endpoints."""
from fastapi import APIRouter, HTTPException, Depends, Query
from app.models.schemas import PaymentLog
from app.services.supabase import get_supabase_admin
from app.middleware.auth import get_current_user
from app.utils.pagination import paginate_params, paginated_response

router = APIRouter()


@router.get("/")
async def list_payments(
    tenancy_id: str = Query(None),
    status: str = Query(None),
    property_id: str = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    user: dict = Depends(get_current_user),
):
    """List rent payments, filterable by tenancy, property, and status."""
    try:
        admin = get_supabase_admin()
        offset, limit = paginate_params(page, per_page)

        query = (
            admin.table("rent_payments")
            .select("*, tenancies(unit_identifier, tenant_invite_email, properties(name))", count="exact")
            .eq("owner_id", user["id"])
        )

        if tenancy_id:
            query = query.eq("tenancy_id", tenancy_id)
        if status:
            query = query.eq("status", status)
        if property_id:
            query = query.eq("property_id", property_id)

        query = query.order("payment_month", desc=True).range(offset, offset + limit - 1)
        response = query.execute()

        total = response.count if response.count is not None else len(response.data)
        return paginated_response(response.data or [], total, page, per_page)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/log", status_code=201)
async def log_payment(
    request: PaymentLog,
    user: dict = Depends(get_current_user),
):
    """Log a rent payment received. Updates existing rent_payment row."""
    try:
        admin = get_supabase_admin()

        # Find the matching rent entry
        month_str = str(request.payment_month.replace(day=1))

        existing = (
            admin.table("rent_payments")
            .select("*")
            .eq("tenancy_id", request.tenancy_id)
            .eq("payment_month", month_str)
            .eq("owner_id", user["id"])
            .maybe_single()
            .execute()
        )

        if not existing.data:
            raise HTTPException(
                status_code=404,
                detail="No rent entry found for this tenancy and month"
            )

        payment = existing.data
        new_amount_paid = float(payment.get("amount_paid", 0)) + float(request.amount_paid)
        amount_due = float(payment["amount_due"])

        # Determine new status
        if new_amount_paid >= amount_due:
            new_status = "paid"
        elif new_amount_paid > 0:
            new_status = "partial"
        else:
            new_status = payment["status"]

        updates = {
            "amount_paid": new_amount_paid,
            "status": new_status,
            "payment_date": str(request.payment_month),
            "payment_method": request.payment_method.value if request.payment_method else None,
            "transaction_reference": request.transaction_reference,
            "notes": request.notes,
        }

        response = (
            admin.table("rent_payments")
            .update(updates)
            .eq("id", payment["id"])
            .execute()
        )

        # Send confirmation email to tenant
        try:
            tenancy = (
                admin.table("tenancies")
                .select("tenant_invite_email, properties(name), currency")
                .eq("id", request.tenancy_id)
                .maybe_single()
                .execute()
            )
            if tenancy.data and tenancy.data.get("tenant_invite_email"):
                from app.services.email_service import send_payment_confirmation_email
                send_payment_confirmation_email(
                    to_email=tenancy.data["tenant_invite_email"],
                    tenant_name=tenancy.data["tenant_invite_email"].split("@")[0],
                    property_name=tenancy.data.get("properties", {}).get("name", "Property"),
                    amount=float(request.amount_paid),
                    currency=tenancy.data.get("currency", "INR"),
                    payment_month=str(request.payment_month),
                    payment_method=request.payment_method.value if request.payment_method else None,
                )
        except Exception:
            pass  # Don't fail the payment log if notification fails

        return {"data": response.data[0] if response.data else None}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/summary")
async def payment_summary(
    user: dict = Depends(get_current_user),
):
    """Get portfolio payment summary (collected, outstanding, overdue)."""
    try:
        admin = get_supabase_admin()

        # Get all payments for the owner
        response = (
            admin.table("rent_payments")
            .select("amount_due, amount_paid, status")
            .eq("owner_id", user["id"])
            .execute()
        )

        payments = response.data or []

        total_due = sum(float(p["amount_due"]) for p in payments)
        total_paid = sum(float(p.get("amount_paid", 0)) for p in payments)
        overdue_count = sum(1 for p in payments if p["status"] == "overdue")
        overdue_amount = sum(
            float(p["amount_due"]) - float(p.get("amount_paid", 0))
            for p in payments
            if p["status"] == "overdue"
        )
        pending_count = sum(1 for p in payments if p["status"] == "pending")

        return {
            "data": {
                "total_due": total_due,
                "total_collected": total_paid,
                "total_outstanding": total_due - total_paid,
                "overdue_count": overdue_count,
                "overdue_amount": overdue_amount,
                "pending_count": pending_count,
                "total_entries": len(payments),
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{payment_id}")
async def get_payment(
    payment_id: str,
    user: dict = Depends(get_current_user),
):
    """Get payment details."""
    try:
        admin = get_supabase_admin()
        response = (
            admin.table("rent_payments")
            .select("*, tenancies(unit_identifier, tenant_invite_email, properties(name))")
            .eq("id", payment_id)
            .eq("owner_id", user["id"])
            .single()
            .execute()
        )

        if not response.data:
            raise HTTPException(status_code=404, detail="Payment not found")

        return {"data": response.data}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{payment_id}")
async def update_payment(
    payment_id: str,
    status: str = None,
    notes: str = None,
    user: dict = Depends(get_current_user),
):
    """Update payment status (e.g., mark as waived)."""
    try:
        admin = get_supabase_admin()

        existing = (
            admin.table("rent_payments")
            .select("id")
            .eq("id", payment_id)
            .eq("owner_id", user["id"])
            .maybe_single()
            .execute()
        )
        if not existing.data:
            raise HTTPException(status_code=404, detail="Payment not found")

        updates = {}
        if status is not None:
            updates["status"] = status
        if notes is not None:
            updates["notes"] = notes

        if not updates:
            raise HTTPException(status_code=400, detail="No fields to update")

        response = (
            admin.table("rent_payments")
            .update(updates)
            .eq("id", payment_id)
            .execute()
        )

        return {"data": response.data[0] if response.data else None}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

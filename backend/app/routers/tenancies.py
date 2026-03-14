"""Tenancy management endpoints."""
from datetime import date, timedelta
from dateutil.relativedelta import relativedelta
from fastapi import APIRouter, HTTPException, Depends, Query
from app.models.schemas import TenancyCreate
from app.services.supabase import get_supabase_admin
from app.middleware.auth import get_current_user
from app.utils.pagination import paginate_params, paginated_response

router = APIRouter()


@router.get("/")
async def list_tenancies(
    property_id: str = Query(None),
    status: str = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    user: dict = Depends(get_current_user),
):
    """List all tenancies, filterable by property and status."""
    try:
        admin = get_supabase_admin()
        offset, limit = paginate_params(page, per_page)

        # Get owner's property IDs
        props = (
            admin.table("properties")
            .select("id")
            .eq("owner_id", user["id"])
            .execute()
        )
        property_ids = [p["id"] for p in (props.data or [])]

        if not property_ids:
            return paginated_response([], 0, page, per_page)

        query = (
            admin.table("tenancies")
            .select("*, properties(name, city)", count="exact")
            .in_("property_id", property_ids)
        )

        if property_id:
            query = query.eq("property_id", property_id)
        if status:
            query = query.eq("status", status)

        query = query.order("created_at", desc=True).range(offset, offset + limit - 1)
        response = query.execute()

        total = response.count if response.count is not None else len(response.data)
        return paginated_response(response.data or [], total, page, per_page)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", status_code=201)
async def create_tenancy(
    request: TenancyCreate,
    user: dict = Depends(get_current_user),
):
    """Create a new tenancy for a property. Auto-generates 12 monthly rent entries."""
    try:
        admin = get_supabase_admin()

        # Verify property ownership
        prop = (
            admin.table("properties")
            .select("id")
            .eq("id", request.property_id)
            .eq("owner_id", user["id"])
            .maybe_single()
            .execute()
        )
        if not prop.data:
            raise HTTPException(status_code=404, detail="Property not found or not owned by you")

        tenancy_data = {
            "property_id": request.property_id,
            "tenant_invite_email": request.tenant_invite_email,
            "tenant_invite_phone": request.tenant_invite_phone,
            "unit_identifier": request.unit_identifier,
            "monthly_rent": float(request.monthly_rent),
            "security_deposit": float(request.security_deposit),
            "rent_due_day": request.rent_due_day,
            "agreement_start_date": str(request.agreement_start_date) if request.agreement_start_date else None,
            "agreement_end_date": str(request.agreement_end_date) if request.agreement_end_date else None,
            "currency": request.currency,
            "notice_period_days": request.notice_period_days,
            "status": "active" if not request.tenant_invite_email else "invited",
        }

        tenancy_response = admin.table("tenancies").insert(tenancy_data).execute()

        if not tenancy_response.data:
            raise HTTPException(status_code=500, detail="Failed to create tenancy")

        tenancy = tenancy_response.data[0]

        # Auto-generate 12 monthly rent entries
        start = request.agreement_start_date or date.today()
        rent_entries = []
        for i in range(12):
            payment_month = start + relativedelta(months=i)
            # Set to the first of the month for the payment_month field
            month_date = payment_month.replace(day=1)

            rent_entries.append({
                "tenancy_id": tenancy["id"],
                "property_id": request.property_id,
                "owner_id": user["id"],
                "payment_month": str(month_date),
                "amount_due": float(request.monthly_rent),
                "status": "pending",
            })

        if rent_entries:
            admin.table("rent_payments").insert(rent_entries).execute()

        # Update property status to occupied
        admin.table("properties").update({"status": "occupied"}).eq("id", request.property_id).execute()

        # Auto-send invite email if tenant email exists
        invite_sent = False
        if request.tenant_invite_email:
            try:
                from app.services.invite_service import send_tenant_invite
                invite_sent = send_tenant_invite(tenancy["id"], user["id"])
            except Exception as e:
                import logging
                logging.getLogger(__name__).warning(f"Failed to send invite email: {e}")

        return {"data": tenancy, "rent_entries_created": len(rent_entries), "invite_sent": invite_sent}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{tenancy_id}")
async def get_tenancy(
    tenancy_id: str,
    user: dict = Depends(get_current_user),
):
    """Get tenancy details."""
    try:
        admin = get_supabase_admin()

        response = (
            admin.table("tenancies")
            .select("*, properties(name, city, owner_id)")
            .eq("id", tenancy_id)
            .single()
            .execute()
        )

        if not response.data:
            raise HTTPException(status_code=404, detail="Tenancy not found")

        # Verify ownership
        if response.data.get("properties", {}).get("owner_id") != user["id"]:
            raise HTTPException(status_code=403, detail="Access denied")

        return {"data": response.data}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{tenancy_id}")
async def update_tenancy(
    tenancy_id: str,
    status: str = None,
    monthly_rent: float = None,
    unit_identifier: str = None,
    agreement_end_date: str = None,
    user: dict = Depends(get_current_user),
):
    """Update tenancy."""
    try:
        admin = get_supabase_admin()

        # Verify ownership via property
        tenancy = (
            admin.table("tenancies")
            .select("id, property_id, properties(owner_id)")
            .eq("id", tenancy_id)
            .single()
            .execute()
        )

        if not tenancy.data:
            raise HTTPException(status_code=404, detail="Tenancy not found")

        if tenancy.data.get("properties", {}).get("owner_id") != user["id"]:
            raise HTTPException(status_code=403, detail="Access denied")

        updates = {}
        if status is not None:
            updates["status"] = status
        if monthly_rent is not None:
            updates["monthly_rent"] = monthly_rent
        if unit_identifier is not None:
            updates["unit_identifier"] = unit_identifier
        if agreement_end_date is not None:
            updates["agreement_end_date"] = agreement_end_date

        if not updates:
            raise HTTPException(status_code=400, detail="No fields to update")

        response = admin.table("tenancies").update(updates).eq("id", tenancy_id).execute()
        return {"data": response.data[0] if response.data else None}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{tenancy_id}/invite")
async def invite_tenant(
    tenancy_id: str,
    user: dict = Depends(get_current_user),
):
    """Send invite to tenant via email."""
    try:
        from app.services.invite_service import send_tenant_invite

        admin = get_supabase_admin()

        # Verify ownership via property
        tenancy = (
            admin.table("tenancies")
            .select("id, tenant_invite_email, property_id, properties(owner_id)")
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
            raise HTTPException(status_code=400, detail="No tenant email set for this tenancy")

        success = send_tenant_invite(tenancy_id, user["id"])

        return {
            "message": "Invitation email sent" if success else "Invitation logged (email delivery pending — check SendGrid config)",
            "tenancy_id": tenancy_id,
            "email": email,
            "sent": success,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

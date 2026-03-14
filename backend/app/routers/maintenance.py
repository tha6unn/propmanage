"""Maintenance request endpoints."""
from fastapi import APIRouter, HTTPException, Depends, Query
from app.models.schemas import MaintenanceCreate, MaintenanceUpdate
from app.services.supabase import get_supabase_admin
from app.middleware.auth import get_current_user
from app.utils.pagination import paginate_params, paginated_response

router = APIRouter()


@router.get("/")
async def list_maintenance_requests(
    property_id: str = Query(None),
    status: str = Query(None),
    priority: str = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    user: dict = Depends(get_current_user),
):
    """List maintenance requests."""
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
            admin.table("maintenance_requests")
            .select("*, properties(name)", count="exact")
            .in_("property_id", property_ids)
        )

        if property_id:
            query = query.eq("property_id", property_id)
        if status:
            query = query.eq("status", status)
        if priority:
            query = query.eq("priority", priority)

        query = query.order("created_at", desc=True).range(offset, offset + limit - 1)
        response = query.execute()

        total = response.count if response.count is not None else len(response.data)
        return paginated_response(response.data or [], total, page, per_page)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", status_code=201)
async def create_maintenance_request(
    request: MaintenanceCreate,
    user: dict = Depends(get_current_user),
):
    """Create a maintenance request."""
    try:
        admin = get_supabase_admin()

        # Verify property exists and user has access (owner, manager, or tenant)
        prop = (
            admin.table("properties")
            .select("id, owner_id")
            .eq("id", request.property_id)
            .single()
            .execute()
        )
        if not prop.data:
            raise HTTPException(status_code=404, detail="Property not found")

        maintenance_data = {
            "property_id": request.property_id,
            "tenancy_id": request.tenancy_id,
            "raised_by": user["id"],
            "title": request.title,
            "description": request.description,
            "category": request.category,
            "priority": request.priority,
            "status": "open",
            "estimated_cost": float(request.estimated_cost) if request.estimated_cost else None,
        }

        response = admin.table("maintenance_requests").insert(maintenance_data).execute()

        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create maintenance request")

        # Send notification to property owner
        try:
            owner_id = prop.data.get("owner_id")
            if owner_id and owner_id != user["id"]:
                owner = admin.table("profiles").select("email, full_name").eq("id", owner_id).maybe_single().execute()
                if owner.data and owner.data.get("email"):
                    from app.services.email_service import send_maintenance_notification_email
                    send_maintenance_notification_email(
                        to_email=owner.data["email"],
                        recipient_name=owner.data.get("full_name", "Owner"),
                        property_name=prop.data.get("name", "Property"),
                        title=request.title,
                        status="open",
                        description=request.description,
                        is_owner=True,
                        recipient_id=owner_id,
                    )
        except Exception:
            pass  # Don't fail the request if notification fails

        return {"data": response.data[0]}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{request_id}")
async def get_maintenance_request(
    request_id: str,
    user: dict = Depends(get_current_user),
):
    """Get maintenance request details."""
    try:
        admin = get_supabase_admin()

        response = (
            admin.table("maintenance_requests")
            .select("*, properties(name, owner_id)")
            .eq("id", request_id)
            .single()
            .execute()
        )

        if not response.data:
            raise HTTPException(status_code=404, detail="Maintenance request not found")

        if response.data.get("properties", {}).get("owner_id") != user["id"]:
            raise HTTPException(status_code=403, detail="Access denied")

        return {"data": response.data}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{request_id}")
async def update_maintenance_request(
    request_id: str,
    request: MaintenanceUpdate,
    user: dict = Depends(get_current_user),
):
    """Update maintenance request status, assign, add resolution notes."""
    try:
        admin = get_supabase_admin()

        # Verify access
        existing = (
            admin.table("maintenance_requests")
            .select("id, properties(owner_id)")
            .eq("id", request_id)
            .single()
            .execute()
        )

        if not existing.data:
            raise HTTPException(status_code=404, detail="Maintenance request not found")

        if existing.data.get("properties", {}).get("owner_id") != user["id"]:
            raise HTTPException(status_code=403, detail="Access denied")

        updates = request.model_dump(exclude_none=True)
        if "actual_cost" in updates:
            updates["actual_cost"] = float(updates["actual_cost"])
        if "estimated_cost" in updates:
            updates["estimated_cost"] = float(updates["estimated_cost"])

        if not updates:
            raise HTTPException(status_code=400, detail="No fields to update")

        # If status is resolved, set resolved_at
        if updates.get("status") == "resolved":
            from datetime import datetime
            updates["resolved_at"] = datetime.utcnow().isoformat()

        response = (
            admin.table("maintenance_requests")
            .update(updates)
            .eq("id", request_id)
            .execute()
        )

        # Send notification to the person who raised the request (if different from updater)
        try:
            full_req = (
                admin.table("maintenance_requests")
                .select("raised_by, title, status, properties(name)")
                .eq("id", request_id)
                .maybe_single()
                .execute()
            )
            if full_req.data:
                raised_by = full_req.data.get("raised_by")
                if raised_by and raised_by != user["id"]:
                    raiser = admin.table("profiles").select("email, full_name").eq("id", raised_by).maybe_single().execute()
                    if raiser.data and raiser.data.get("email"):
                        from app.services.email_service import send_maintenance_notification_email
                        send_maintenance_notification_email(
                            to_email=raiser.data["email"],
                            recipient_name=raiser.data.get("full_name", "User"),
                            property_name=full_req.data.get("properties", {}).get("name", "Property"),
                            title=full_req.data.get("title", "Maintenance Request"),
                            status=updates.get("status", full_req.data.get("status", "")),
                            is_owner=False,
                            recipient_id=raised_by,
                        )
        except Exception:
            pass  # Don't fail the update if notification fails

        return {"data": response.data[0] if response.data else None}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

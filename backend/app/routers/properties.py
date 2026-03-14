"""Property management endpoints."""
from fastapi import APIRouter, HTTPException, Depends, Query
from app.models.schemas import PropertyCreate, PropertyUpdate, PropertyResponse
from app.services.supabase import get_supabase_admin
from app.middleware.auth import get_current_user
from app.utils.pagination import paginate_params, paginated_response

router = APIRouter()


@router.get("/")
async def list_properties(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status: str = Query(None),
    search: str = Query(None),
    user: dict = Depends(get_current_user),
):
    """List all owner's properties."""
    try:
        admin = get_supabase_admin()
        offset, limit = paginate_params(page, per_page)

        # Build query
        query = (
            admin.table("properties")
            .select("*", count="exact")
            .eq("owner_id", user["id"])
        )

        if status:
            query = query.eq("status", status)

        if search:
            query = query.ilike("name", f"%{search}%")

        query = query.order("created_at", desc=True).range(offset, offset + limit - 1)
        response = query.execute()

        total = response.count if response.count is not None else len(response.data)
        return paginated_response(response.data or [], total, page, per_page)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", status_code=201)
async def create_property(
    request: PropertyCreate,
    user: dict = Depends(get_current_user),
):
    """Create a new property."""
    try:
        admin = get_supabase_admin()

        property_data = {
            "owner_id": user["id"],
            "name": request.name,
            "address_line1": request.address_line1,
            "address_line2": request.address_line2,
            "city": request.city,
            "state_province": request.state_province,
            "country": request.country,
            "postal_code": request.postal_code,
            "property_type": request.property_type.value if request.property_type else None,
            "status": request.status.value,
            "total_units": request.total_units,
            "year_built": request.year_built,
            "area_sqft": float(request.area_sqft) if request.area_sqft else None,
            "notes": request.notes,
        }

        response = admin.table("properties").insert(property_data).execute()

        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create property")

        return {"data": response.data[0]}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{property_id}")
async def get_property(
    property_id: str,
    user: dict = Depends(get_current_user),
):
    """Get property details."""
    try:
        admin = get_supabase_admin()
        response = (
            admin.table("properties")
            .select("*")
            .eq("id", property_id)
            .eq("owner_id", user["id"])
            .single()
            .execute()
        )

        if not response.data:
            raise HTTPException(status_code=404, detail="Property not found")

        return {"data": response.data}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{property_id}")
async def update_property(
    property_id: str,
    request: PropertyUpdate,
    user: dict = Depends(get_current_user),
):
    """Update property."""
    try:
        admin = get_supabase_admin()

        # Verify ownership
        existing = (
            admin.table("properties")
            .select("id")
            .eq("id", property_id)
            .eq("owner_id", user["id"])
            .maybe_single()
            .execute()
        )
        if not existing.data:
            raise HTTPException(status_code=404, detail="Property not found")

        updates = request.model_dump(exclude_none=True)
        # Convert enums to strings
        if "property_type" in updates and updates["property_type"]:
            updates["property_type"] = updates["property_type"].value
        if "status" in updates and updates["status"]:
            updates["status"] = updates["status"].value

        if not updates:
            raise HTTPException(status_code=400, detail="No fields to update")

        response = (
            admin.table("properties")
            .update(updates)
            .eq("id", property_id)
            .execute()
        )

        return {"data": response.data[0] if response.data else None}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{property_id}")
async def archive_property(
    property_id: str,
    user: dict = Depends(get_current_user),
):
    """Archive (soft delete) property by setting status to 'vacant' and removing from active list."""
    try:
        admin = get_supabase_admin()

        existing = (
            admin.table("properties")
            .select("id")
            .eq("id", property_id)
            .eq("owner_id", user["id"])
            .maybe_single()
            .execute()
        )
        if not existing.data:
            raise HTTPException(status_code=404, detail="Property not found")

        # Soft delete: update metadata with archived flag
        response = (
            admin.table("properties")
            .update({"metadata": {"archived": True, "status_before_archive": "active"}})
            .eq("id", property_id)
            .execute()
        )

        return {"message": "Property archived"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{property_id}/summary")
async def property_summary(
    property_id: str,
    user: dict = Depends(get_current_user),
):
    """Get occupancy, income, overdue summary for one property."""
    try:
        admin = get_supabase_admin()

        # Verify ownership
        prop = (
            admin.table("properties")
            .select("id, name, status, total_units")
            .eq("id", property_id)
            .eq("owner_id", user["id"])
            .single()
            .execute()
        )
        if not prop.data:
            raise HTTPException(status_code=404, detail="Property not found")

        # Get active tenancies
        tenancies = (
            admin.table("tenancies")
            .select("id, monthly_rent, status")
            .eq("property_id", property_id)
            .in_("status", ["active", "invited"])
            .execute()
        )

        active_tenancies = [t for t in (tenancies.data or []) if t["status"] == "active"]
        total_monthly_rent = sum(float(t["monthly_rent"]) for t in active_tenancies)

        # Get overdue payments
        overdue = (
            admin.table("rent_payments")
            .select("id", count="exact")
            .eq("property_id", property_id)
            .eq("status", "overdue")
            .execute()
        )

        return {
            "data": {
                "property": prop.data,
                "active_tenancies": len(active_tenancies),
                "total_tenancies": len(tenancies.data or []),
                "monthly_income": total_monthly_rent,
                "overdue_payments": overdue.count or 0,
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{property_id}/access")
async def grant_access(
    property_id: str,
    user_id: str = None,
    access_level: str = "viewer",
    user: dict = Depends(get_current_user),
):
    """Grant manager/viewer access to a property."""
    try:
        if not user_id:
            raise HTTPException(status_code=400, detail="user_id is required")

        admin = get_supabase_admin()

        # Verify ownership
        existing = (
            admin.table("properties")
            .select("id")
            .eq("id", property_id)
            .eq("owner_id", user["id"])
            .maybe_single()
            .execute()
        )
        if not existing.data:
            raise HTTPException(status_code=404, detail="Property not found")

        response = admin.table("property_access").upsert({
            "property_id": property_id,
            "user_id": user_id,
            "access_level": access_level,
            "granted_by": user["id"],
        }).execute()

        return {"data": response.data[0] if response.data else None, "message": "Access granted"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

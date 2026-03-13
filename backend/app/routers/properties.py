"""Property management endpoints."""
from fastapi import APIRouter, HTTPException
from app.models.schemas import PropertyCreate, PropertyUpdate, PropertyResponse

router = APIRouter()


@router.get("/")
async def list_properties():
    """List all owner's properties."""
    # TODO: Implement with Supabase + auth
    return {"data": [], "meta": {"total": 0, "page": 1}}


@router.post("/", response_model=PropertyResponse, status_code=201)
async def create_property(request: PropertyCreate):
    """Create a new property."""
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.get("/{property_id}")
async def get_property(property_id: str):
    """Get property details."""
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.patch("/{property_id}")
async def update_property(property_id: str, request: PropertyUpdate):
    """Update property."""
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.delete("/{property_id}")
async def archive_property(property_id: str):
    """Archive (soft delete) property."""
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.get("/{property_id}/summary")
async def property_summary(property_id: str):
    """Get occupancy, income, overdue summary for one property."""
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.post("/{property_id}/access")
async def grant_access(property_id: str):
    """Grant manager access to a property."""
    raise HTTPException(status_code=501, detail="Not implemented yet")

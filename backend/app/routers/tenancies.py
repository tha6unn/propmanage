"""Tenancy management endpoints."""
from fastapi import APIRouter, HTTPException
from app.models.schemas import TenancyCreate

router = APIRouter()


@router.get("/")
async def list_tenancies(property_id: str = None, status: str = None):
    """List all tenancies, filterable by property and status."""
    return {"data": [], "meta": {"total": 0, "page": 1}}


@router.post("/", status_code=201)
async def create_tenancy(request: TenancyCreate):
    """Create a new tenancy for a property."""
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.get("/{tenancy_id}")
async def get_tenancy(tenancy_id: str):
    """Get tenancy details."""
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.patch("/{tenancy_id}")
async def update_tenancy(tenancy_id: str):
    """Update tenancy."""
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.post("/{tenancy_id}/invite")
async def invite_tenant(tenancy_id: str):
    """Send invite to tenant via email/WhatsApp."""
    raise HTTPException(status_code=501, detail="Not implemented yet")

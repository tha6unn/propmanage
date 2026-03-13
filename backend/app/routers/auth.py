"""Authentication endpoints."""
from fastapi import APIRouter, HTTPException
from app.models.schemas import RegisterRequest, LoginRequest, TokenResponse, ProfileResponse

router = APIRouter()


@router.post("/register", response_model=TokenResponse)
async def register(request: RegisterRequest):
    """Register a new owner account."""
    # TODO: Implement with Supabase Auth
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    """Login with email and password."""
    # TODO: Implement with Supabase Auth
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.post("/refresh")
async def refresh_token():
    """Refresh access token."""
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.post("/logout")
async def logout():
    """Invalidate refresh token."""
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.get("/me", response_model=ProfileResponse)
async def get_profile():
    """Get current user profile."""
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.patch("/me")
async def update_profile():
    """Update user profile."""
    raise HTTPException(status_code=501, detail="Not implemented yet")

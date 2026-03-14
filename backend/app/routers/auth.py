"""Authentication endpoints."""
from fastapi import APIRouter, HTTPException, Depends
from app.models.schemas import RegisterRequest, LoginRequest, TokenResponse, ProfileResponse, InviteAcceptRequest
from app.services.supabase import get_supabase_client, get_supabase_admin
from app.middleware.auth import get_current_user

router = APIRouter()


@router.post("/register", response_model=TokenResponse)
async def register(request: RegisterRequest):
    """Register a new owner account."""
    try:
        admin = get_supabase_admin()

        # Create auth user
        auth_response = admin.auth.sign_up({
            "email": request.email,
            "password": request.password,
            "options": {
                "data": {
                    "full_name": request.full_name,
                }
            }
        })

        if not auth_response.user:
            raise HTTPException(status_code=400, detail="Registration failed")

        user = auth_response.user

        # Create profile row
        admin.table("profiles").upsert({
            "id": user.id,
            "email": request.email,
            "full_name": request.full_name,
            "phone": request.phone,
            "preferred_language": request.preferred_language,
            "role": "owner",
        }).execute()

        # If email confirmation is required, session may be None
        if not auth_response.session:
            return TokenResponse(
                access_token="",
                refresh_token="",
                token_type="bearer",
                user_id=user.id,
            )

        return TokenResponse(
            access_token=auth_response.session.access_token,
            refresh_token=auth_response.session.refresh_token,
            token_type="bearer",
            user_id=user.id,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    """Login with email and password."""
    try:
        client = get_supabase_client()
        auth_response = client.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password,
        })

        if not auth_response.session:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        return TokenResponse(
            access_token=auth_response.session.access_token,
            refresh_token=auth_response.session.refresh_token,
            token_type="bearer",
            user_id=auth_response.user.id,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Login failed: {str(e)}")


@router.post("/refresh")
async def refresh_token(refresh_token: str):
    """Refresh access token."""
    try:
        client = get_supabase_client()
        response = client.auth.refresh_session(refresh_token)

        if not response.session:
            raise HTTPException(status_code=401, detail="Invalid refresh token")

        return {
            "access_token": response.session.access_token,
            "refresh_token": response.session.refresh_token,
            "token_type": "bearer",
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.post("/logout")
async def logout(user: dict = Depends(get_current_user)):
    """Invalidate session."""
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=ProfileResponse)
async def get_profile(user: dict = Depends(get_current_user)):
    """Get current user profile."""
    try:
        admin = get_supabase_admin()
        response = (
            admin.table("profiles")
            .select("*")
            .eq("id", user["id"])
            .single()
            .execute()
        )

        if not response.data:
            raise HTTPException(status_code=404, detail="Profile not found")

        profile = response.data
        return ProfileResponse(
            id=profile["id"],
            full_name=profile["full_name"],
            email=profile["email"],
            phone=profile.get("phone"),
            avatar_url=profile.get("avatar_url"),
            role=profile.get("role", "owner"),
            preferred_language=profile.get("preferred_language", "en"),
            timezone=profile.get("timezone", "Asia/Kolkata"),
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/me")
async def update_profile(
    full_name: str = None,
    phone: str = None,
    preferred_language: str = None,
    timezone: str = None,
    user: dict = Depends(get_current_user),
):
    """Update user profile."""
    try:
        updates = {}
        if full_name is not None:
            updates["full_name"] = full_name
        if phone is not None:
            updates["phone"] = phone
        if preferred_language is not None:
            updates["preferred_language"] = preferred_language
        if timezone is not None:
            updates["timezone"] = timezone

        if not updates:
            raise HTTPException(status_code=400, detail="No fields to update")

        admin = get_supabase_admin()
        response = (
            admin.table("profiles")
            .update(updates)
            .eq("id", user["id"])
            .execute()
        )

        return {"message": "Profile updated", "data": response.data}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Invite Acceptance Endpoints ─────────────────────────

@router.get("/invite/details")
async def get_invite_details_endpoint(token: str):
    """Get invite details for the acceptance page (no auth required)."""
    from app.services.invite_service import get_invite_details

    details = get_invite_details(token)
    if not details:
        raise HTTPException(status_code=400, detail="Invalid or expired invitation link")

    return {"data": details}


@router.post("/invite/accept")
async def accept_invite(request: InviteAcceptRequest):
    """Accept a tenant invite: creates account, links tenancy (no auth required)."""
    from app.services.invite_service import accept_tenant_invite

    result = accept_tenant_invite(
        token=request.token,
        full_name=request.full_name,
        password=request.password,
        phone=request.phone,
    )

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result.get("error", "Failed to accept invite"))

    return {"data": result}


@router.post("/invite/accept-manager")
async def accept_manager_invite_endpoint(request: InviteAcceptRequest):
    """Accept a manager invite: creates account, grants property access (no auth required)."""
    from app.services.invite_service import accept_manager_invite

    result = accept_manager_invite(
        token=request.token,
        full_name=request.full_name,
        password=request.password,
        phone=request.phone,
    )

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result.get("error", "Failed to accept invite"))

    return {"data": result}

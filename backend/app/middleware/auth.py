"""JWT authentication middleware for FastAPI."""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.services.supabase import get_supabase_admin

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """Verify JWT and return current user.

    Extracts Bearer token from Authorization header,
    verifies it with Supabase Auth, and returns user info.

    Returns:
        dict with keys: id, email, role
    """
    token = credentials.credentials

    try:
        admin = get_supabase_admin()
        user_response = admin.auth.get_user(token)
        user = user_response.user

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
            )

        # Fetch role from profiles table
        profile = (
            admin.table("profiles")
            .select("role, full_name")
            .eq("id", user.id)
            .maybe_single()
            .execute()
        )

        role = "owner"
        if profile.data:
            role = profile.data.get("role", "owner")

        return {
            "id": user.id,
            "email": user.email,
            "role": role,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}",
        )

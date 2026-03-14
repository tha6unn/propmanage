"""Invite service for tenant and manager invitation flows."""
import logging
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from app.config import settings
from app.services.supabase import get_supabase_admin
from app.services.email_service import send_tenant_invite_email, send_manager_invite_email, send_welcome_email

logger = logging.getLogger(__name__)

INVITE_TOKEN_EXPIRY_DAYS = 7


def generate_invite_token(
    tenancy_id: str | None = None,
    email: str = "",
    role: str = "tenant",
    property_ids: list[str] | None = None,
    invited_by: str = "",
) -> str:
    """Generate a JWT invite token with 7-day expiry."""
    payload = {
        "email": email,
        "role": role,
        "invited_by": invited_by,
        "exp": datetime.now(timezone.utc) + timedelta(days=INVITE_TOKEN_EXPIRY_DAYS),
        "iat": datetime.now(timezone.utc),
        "type": "invite",
    }
    if tenancy_id:
        payload["tenancy_id"] = tenancy_id
    if property_ids:
        payload["property_ids"] = property_ids

    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")


def verify_invite_token(token: str) -> dict | None:
    """Verify and decode an invite token. Returns payload or None if invalid."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        if payload.get("type") != "invite":
            return None
        return payload
    except JWTError as e:
        logger.warning(f"Invalid invite token: {e}")
        return None


def get_invite_details(token: str) -> dict | None:
    """Get human-readable invite details from a token for the acceptance page."""
    payload = verify_invite_token(token)
    if not payload:
        return None

    admin = get_supabase_admin()
    details = {
        "email": payload.get("email"),
        "role": payload.get("role"),
        "valid": True,
    }

    # Get inviter info
    inviter_id = payload.get("invited_by")
    if inviter_id:
        inviter = admin.table("profiles").select("full_name, email").eq("id", inviter_id).maybe_single().execute()
        if inviter.data:
            details["invited_by_name"] = inviter.data.get("full_name", inviter.data.get("email"))

    # Get tenancy + property info for tenant invites
    tenancy_id = payload.get("tenancy_id")
    if tenancy_id:
        tenancy = (
            admin.table("tenancies")
            .select("*, properties(name, city, country)")
            .eq("id", tenancy_id)
            .maybe_single()
            .execute()
        )
        if tenancy.data:
            prop = tenancy.data.get("properties", {})
            details["property_name"] = prop.get("name", "")
            details["property_location"] = f"{prop.get('city', '')}, {prop.get('country', '')}"
            details["unit"] = tenancy.data.get("unit_identifier")
            details["monthly_rent"] = float(tenancy.data.get("monthly_rent", 0))
            details["currency"] = tenancy.data.get("currency", "INR")
            details["agreement_start"] = tenancy.data.get("agreement_start_date")
            details["agreement_end"] = tenancy.data.get("agreement_end_date")

    # Get property names for manager invites
    property_ids = payload.get("property_ids")
    if property_ids:
        props = admin.table("properties").select("name").in_("id", property_ids).execute()
        details["property_names"] = [p["name"] for p in (props.data or [])]

    return details


def accept_tenant_invite(token: str, full_name: str, password: str, phone: str | None = None) -> dict:
    """Accept a tenant invite: create auth user, profile, link tenancy.

    Returns:
        dict with keys: success, user_id, access_token, refresh_token, error
    """
    payload = verify_invite_token(token)
    if not payload:
        return {"success": False, "error": "Invalid or expired invitation link."}

    email = payload.get("email")
    tenancy_id = payload.get("tenancy_id")
    invited_by = payload.get("invited_by")
    role = payload.get("role", "tenant")

    if not email:
        return {"success": False, "error": "No email in invite token."}

    admin = get_supabase_admin()

    try:
        # Check if user already exists
        existing_profile = admin.table("profiles").select("id").eq("email", email).maybe_single().execute()
        if existing_profile.data:
            # User exists — just link tenancy if not already linked
            user_id = existing_profile.data["id"]
            if tenancy_id:
                admin.table("tenancies").update({
                    "tenant_profile_id": user_id,
                    "status": "active",
                }).eq("id", tenancy_id).execute()

            return {
                "success": True,
                "user_id": user_id,
                "message": "Account already exists. Tenancy linked. Please log in.",
                "existing_user": True,
            }

        # Create new auth user
        auth_response = admin.auth.sign_up({
            "email": email,
            "password": password,
            "options": {
                "data": {"full_name": full_name},
                "email_redirect_to": f"{settings.FRONTEND_URL}/login",
            }
        })

        if not auth_response.user:
            return {"success": False, "error": "Failed to create account."}

        user_id = auth_response.user.id

        # Create profile with correct role
        admin.table("profiles").upsert({
            "id": user_id,
            "email": email,
            "full_name": full_name,
            "phone": phone,
            "role": role,
        }).execute()

        # Link tenancy
        if tenancy_id:
            admin.table("tenancies").update({
                "tenant_profile_id": user_id,
                "status": "active",
            }).eq("id", tenancy_id).execute()

        # Send welcome email
        send_welcome_email(email, full_name, role, recipient_id=user_id)

        result = {
            "success": True,
            "user_id": user_id,
            "existing_user": False,
        }

        # Include tokens if session available
        if auth_response.session:
            result["access_token"] = auth_response.session.access_token
            result["refresh_token"] = auth_response.session.refresh_token

        return result

    except Exception as e:
        logger.error(f"Failed to accept invite: {e}")
        return {"success": False, "error": str(e)}


def accept_manager_invite(token: str, full_name: str, password: str, phone: str | None = None) -> dict:
    """Accept a manager invite: create auth user, profile, property_access.

    Returns:
        dict with keys: success, user_id, access_token, refresh_token, error
    """
    payload = verify_invite_token(token)
    if not payload:
        return {"success": False, "error": "Invalid or expired invitation link."}

    email = payload.get("email")
    property_ids = payload.get("property_ids", [])
    invited_by = payload.get("invited_by")
    role = "manager"

    if not email:
        return {"success": False, "error": "No email in invite token."}

    admin = get_supabase_admin()

    try:
        # Check if user already exists
        existing_profile = admin.table("profiles").select("id").eq("email", email).maybe_single().execute()
        if existing_profile.data:
            user_id = existing_profile.data["id"]
            # Grant property access
            for pid in property_ids:
                admin.table("property_access").upsert({
                    "property_id": pid,
                    "user_id": user_id,
                    "access_level": "manager",
                    "granted_by": invited_by,
                }).execute()
            return {
                "success": True,
                "user_id": user_id,
                "message": "Account already exists. Access granted. Please log in.",
                "existing_user": True,
            }

        # Create new auth user
        auth_response = admin.auth.sign_up({
            "email": email,
            "password": password,
            "options": {
                "data": {"full_name": full_name},
                "email_redirect_to": f"{settings.FRONTEND_URL}/login",
            }
        })

        if not auth_response.user:
            return {"success": False, "error": "Failed to create account."}

        user_id = auth_response.user.id

        # Create profile
        admin.table("profiles").upsert({
            "id": user_id,
            "email": email,
            "full_name": full_name,
            "phone": phone,
            "role": role,
        }).execute()

        # Grant property access
        for pid in property_ids:
            admin.table("property_access").upsert({
                "property_id": pid,
                "user_id": user_id,
                "access_level": "manager",
                "granted_by": invited_by,
            }).execute()

        send_welcome_email(email, full_name, role, recipient_id=user_id)

        result = {
            "success": True,
            "user_id": user_id,
            "existing_user": False,
        }
        if auth_response.session:
            result["access_token"] = auth_response.session.access_token
            result["refresh_token"] = auth_response.session.refresh_token

        return result

    except Exception as e:
        logger.error(f"Failed to accept manager invite: {e}")
        return {"success": False, "error": str(e)}


def send_tenant_invite(tenancy_id: str, owner_id: str) -> bool:
    """Convenience function: generate token + send invite email for a tenancy."""
    admin = get_supabase_admin()

    # Get tenancy with property info
    tenancy = (
        admin.table("tenancies")
        .select("*, properties(name)")
        .eq("id", tenancy_id)
        .single()
        .execute()
    )
    if not tenancy.data:
        return False

    email = tenancy.data.get("tenant_invite_email")
    if not email:
        return False

    # Get owner name
    owner = admin.table("profiles").select("full_name").eq("id", owner_id).maybe_single().execute()
    owner_name = owner.data.get("full_name", "Property Owner") if owner.data else "Property Owner"

    property_name = tenancy.data.get("properties", {}).get("name", "Property")

    # Generate invite token
    token = generate_invite_token(
        tenancy_id=tenancy_id,
        email=email,
        role="tenant",
        invited_by=owner_id,
    )

    invite_link = f"{settings.FRONTEND_URL}/invite?token={token}"

    return send_tenant_invite_email(
        to_email=email,
        tenant_name=None,
        property_name=property_name,
        unit=tenancy.data.get("unit_identifier"),
        monthly_rent=float(tenancy.data.get("monthly_rent", 0)),
        currency=tenancy.data.get("currency", "INR"),
        invite_link=invite_link,
        owner_name=owner_name,
    )

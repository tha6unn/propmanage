"""Supabase client service."""
from functools import lru_cache
from supabase import create_client, Client
from app.config import settings


def get_supabase_client() -> Client:
    """Get Supabase client with anon key (for user-scoped operations)."""
    if not settings.SUPABASE_ANON_KEY:
        raise RuntimeError(
            "SUPABASE_ANON_KEY is not set. "
            "Create backend/.env with your Supabase credentials."
        )
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)


def get_supabase_admin() -> Client:
    """Get Supabase client with service role key (for admin operations).
    Falls back to anon key if service role key is not set.
    """
    key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY
    if not key:
        raise RuntimeError(
            "Neither SUPABASE_SERVICE_ROLE_KEY nor SUPABASE_ANON_KEY is set. "
            "Create backend/.env with your Supabase credentials."
        )
    return create_client(settings.SUPABASE_URL, key)

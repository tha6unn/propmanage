"""Configuration for PropManage backend."""
import os
from dataclasses import dataclass
from dotenv import load_dotenv

# Load .env file from backend root
load_dotenv()


@dataclass
class Settings:
    """Application settings loaded from environment variables."""

    # App
    APP_ENV: str = os.getenv("APP_ENV", "development")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "")
    DEBUG: bool = os.getenv("APP_ENV", "development") == "development"

    # Supabase
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://pgxjtogwnbvbrgxalpir.supabase.co")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

    # JWT
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

    # Google AI
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
    GOOGLE_CLOUD_PROJECT: str = os.getenv("GOOGLE_CLOUD_PROJECT", "")

    # Anthropic
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")

    # OpenAI (Whisper)
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")

    # Twilio
    TWILIO_ACCOUNT_SID: str = os.getenv("TWILIO_ACCOUNT_SID", "")
    TWILIO_AUTH_TOKEN: str = os.getenv("TWILIO_AUTH_TOKEN", "")
    TWILIO_WHATSAPP_FROM: str = os.getenv("TWILIO_WHATSAPP_FROM", "whatsapp:+14155238886")

    # SendGrid
    SENDGRID_API_KEY: str = os.getenv("SENDGRID_API_KEY", "")
    SENDGRID_FROM_EMAIL: str = os.getenv("SENDGRID_FROM_EMAIL", "noreply@propmanage.app")
    SENDGRID_FROM_NAME: str = os.getenv("SENDGRID_FROM_NAME", "PropManage")

    # Frontend
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")

    # Feature Flags
    ENABLE_AI_AGENT: bool = os.getenv("ENABLE_AI_AGENT", "true").lower() == "true"
    ENABLE_VOICE: bool = os.getenv("ENABLE_VOICE", "false").lower() == "true"
    ENABLE_EMBEDDINGS: bool = os.getenv("ENABLE_EMBEDDINGS", "true").lower() == "true"


settings = Settings()

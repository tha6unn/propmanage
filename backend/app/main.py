"""
PropManage — FastAPI Backend
AI-Powered Global Property Management Platform
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import auth, properties, documents, tenancies, payments, maintenance, agent, notifications

app = FastAPI(
    title="PropManage API",
    description="AI-Powered Global Property Management Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — dynamic origins from env + Vercel preview deploys
allowed_origins = ["http://localhost:3000", "http://localhost:3001"]
if settings.FRONTEND_URL:
    allowed_origins.append(settings.FRONTEND_URL.rstrip("/"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "*"],
)

# Register routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(properties.router, prefix="/api/properties", tags=["Properties"])
app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])
app.include_router(tenancies.router, prefix="/api/tenancies", tags=["Tenancies"])
app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])
app.include_router(maintenance.router, prefix="/api/maintenance", tags=["Maintenance"])
app.include_router(agent.router, prefix="/api/agent", tags=["AI Agent"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])


@app.on_event("startup")
async def startup_event():
    """Start background scheduler on app startup."""
    from app.worker import scheduler
    scheduler.start()


@app.on_event("shutdown")
async def shutdown_event():
    """Shutdown background scheduler on app shutdown."""
    from app.worker import scheduler
    scheduler.shutdown()


@app.get("/health", tags=["System"])
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "version": "1.0.0", "env": settings.APP_ENV}


@app.get("/", tags=["System"])
async def root():
    """Root endpoint."""
    return {
        "message": "PropManage API — AI-Powered Property Management",
        "docs": "/docs",
        "health": "/health",
    }

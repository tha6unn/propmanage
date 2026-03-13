"""
PropManage — FastAPI Backend
AI-Powered Global Property Management Platform
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, properties, documents, tenancies, payments, maintenance, agent, notifications

app = FastAPI(
    title="PropManage API",
    description="AI-Powered Global Property Management Platform",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — allow Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://propmanage.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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


@app.get("/health", tags=["System"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "propmanage-api",
        "version": "0.1.0",
    }


@app.get("/", tags=["System"])
async def root():
    """Root endpoint."""
    return {
        "message": "PropManage API — AI-Powered Property Management",
        "docs": "/docs",
        "health": "/health",
    }

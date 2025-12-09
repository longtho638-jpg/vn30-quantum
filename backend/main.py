#!/usr/bin/env python3
"""
VN30-Quantum Backend API
FastAPI application with JWT auth and trading signals
"""
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .config import settings
from .database import init_db
from .routes import auth, signals


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    print("🚀 Starting VN30-Quantum API...")
    init_db()
    print("✅ Database initialized")
    yield
    # Shutdown
    print("👋 Shutting down VN30-Quantum API...")


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
## VN30-Quantum Trading API

AI-powered trading signals for Vietnamese VN30 stocks.

### Features
- 🔐 JWT Authentication
- 📊 Real-time trading signals
- 🤖 AI-powered analysis (Gemini)
- 📈 Technical indicators (RSI, MACD, Bollinger)
- 🎯 Pattern detection

### Subscription Tiers
- **Free**: 5 stocks, basic signals
- **Basic ($19/mo)**: 15 stocks, alerts
- **Pro ($49/mo)**: All 30 VN30 stocks, AI analysis, API access
    """,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(signals.router, prefix="/api/v1")


# ============== Root Routes ==============

@app.get("/")
async def root():
    """API root - welcome message"""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs",
        "endpoints": {
            "auth": "/api/v1/auth",
            "signals": "/api/v1/signals"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": settings.APP_VERSION
    }


# ============== Run ==============

def main():
    """Run the API server"""
    uvicorn.run(
        "backend.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )


if __name__ == "__main__":
    main()

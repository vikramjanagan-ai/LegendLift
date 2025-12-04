from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from app.core.config import settings
from app.api.endpoints import auth, customers, services, technician_services, reports, admin_users, payments, complaints, callbacks, repairs, minor_points, dashboard, advanced_reports
from app.db.session import engine, Base
from starlette.middleware.base import BaseHTTPMiddleware

# Create database tables
Base.metadata.create_all(bind=engine)

# Middleware to add Bypass-Tunnel-Reminder header for localtunnel
class LocalTunnelBypassMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["Bypass-Tunnel-Reminder"] = "true"
        return response

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    debug=settings.DEBUG,
)

# Add LocalTunnel bypass middleware
app.add_middleware(LocalTunnelBypassMiddleware)

# Set up CORS
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["Bypass-Tunnel-Reminder"],
    )

# Include routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["authentication"])
app.include_router(customers.router, prefix=f"{settings.API_V1_STR}/customers", tags=["customers"])
app.include_router(services.router, prefix=f"{settings.API_V1_STR}/services", tags=["services"])
app.include_router(technician_services.router, prefix=f"{settings.API_V1_STR}/technician", tags=["technician-services"])
app.include_router(callbacks.router, prefix=f"{settings.API_V1_STR}/callbacks", tags=["callbacks"])
app.include_router(repairs.router, prefix=f"{settings.API_V1_STR}/repairs", tags=["repairs"])
app.include_router(reports.router, prefix=f"{settings.API_V1_STR}/reports", tags=["reports"])
app.include_router(admin_users.router, prefix=f"{settings.API_V1_STR}/admin", tags=["admin-users"])
app.include_router(payments.router, prefix=f"{settings.API_V1_STR}/payments", tags=["payments"])
app.include_router(complaints.router, prefix=f"{settings.API_V1_STR}/complaints", tags=["complaints"])
app.include_router(minor_points.router, prefix=f"{settings.API_V1_STR}/minor-points", tags=["minor-points"])
app.include_router(dashboard.router, prefix=f"{settings.API_V1_STR}/dashboard", tags=["dashboard"])
app.include_router(advanced_reports.router, prefix=f"{settings.API_V1_STR}/reports", tags=["advanced-reports"])


@app.get("/")
def root():
    return {
        "message": "Welcome to LegendLift API",
        "version": "1.0.0",
        "docs_url": "/docs",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.get("/favicon.ico")
def favicon():
    # Return empty response to avoid 404 error
    return Response(status_code=204)

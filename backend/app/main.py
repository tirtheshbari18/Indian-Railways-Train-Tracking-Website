from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.database import SessionLocal, Base, engine
from app.data.seed import seed_database
from app.api import auth, trains, routes, live_status, stations, comparison, map_data, favourites, admin, system

_db_initialized = False

def ensure_db_initialized():
    global _db_initialized
    if not _db_initialized:
        try:
            Base.metadata.create_all(bind=engine)
            db = SessionLocal()
            try:
                seed_database(db)
            finally:
                db.close()
            _db_initialized = True
        except Exception as e:
            print(f"Database initialization notice: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    ensure_db_initialized()
    yield

ensure_db_initialized()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="""
# Indian Railways Train Tracking & Information Platform API

Welcome to the official developer API for the Indian Railways train tracking platform.
This service provides:
- High-performance train search and timetable inspection
- Verified real-time train tracking & GPS telemetry
- Railway station directories and live station boards
- Comprehensive route visualisations and train comparisons
- Strict separation between verified live data and simulation/scheduled estimations.
    """,
    lifespan=lifespan,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc"
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers (Mount at both /api and root to guarantee Vercel proxy compatibility)
api_routers = [
    auth.router, trains.router, routes.router, live_status.router,
    stations.router, comparison.router, map_data.router,
    favourites.router, admin.router, system.router
]

for r in api_routers:
    app.include_router(r, prefix=settings.API_V1_STR)
    if settings.API_V1_STR != "":
        app.include_router(r)

@app.get("/")
def root():
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "status": "healthy",
        "docs_url": f"{settings.API_V1_STR}/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

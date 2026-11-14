import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Indian Railways Train Tracking Platform"
    PROJECT_VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Database: Supports PostgreSQL or local SQLite fallback
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./railway.db")
    
    # JWT Settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "railway-super-secret-key-change-in-production-768392")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000",
        "*"
    ]
    
    # Rate Limiting & Live Feed simulator
    RATE_LIMIT_PER_MINUTE: int = 120
    SIMULATION_INTERVAL_SECONDS: int = 15

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()

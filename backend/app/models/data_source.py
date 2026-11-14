from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime, timezone
from app.core.database import Base

class DataSource(Base):
    __tablename__ = "data_sources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    source_type = Column(String(50), nullable=False) # "INTERNAL_SIMULATOR", "STATIC_IMPORT", "OFFICIAL_API"
    endpoint_url = Column(String(255), nullable=True)
    api_key_configured = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    is_live_verified = Column(Boolean, default=False)
    last_sync_time = Column(DateTime, nullable=True)
    sync_interval_seconds = Column(Integer, default=30)
    status = Column(String(50), default="OPERATIONAL") # "OPERATIONAL", "DEGRADED", "OFFLINE"
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

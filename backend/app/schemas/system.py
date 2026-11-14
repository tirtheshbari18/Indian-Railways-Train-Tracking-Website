from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class DataSourceOut(BaseModel):
    id: int
    name: str
    source_type: str
    endpoint_url: Optional[str] = None
    is_active: bool
    is_live_verified: bool
    last_sync_time: Optional[datetime] = None
    sync_interval_seconds: int
    status: str

    class Config:
        from_attributes = True

class DataSourceUpdate(BaseModel):
    name: Optional[str] = None
    endpoint_url: Optional[str] = None
    is_active: Optional[bool] = None
    is_live_verified: Optional[bool] = None
    sync_interval_seconds: Optional[int] = None
    status: Optional[str] = None

class SystemHealthOut(BaseModel):
    status: str
    database: str
    active_trains_count: int
    active_stations_count: int
    live_tracking_enabled: bool
    data_sources: List[DataSourceOut]
    server_time: datetime
    uptime_seconds: float

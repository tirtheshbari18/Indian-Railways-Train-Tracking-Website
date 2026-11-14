from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime

class AuditLogOut(BaseModel):
    id: int
    user_id: Optional[int] = None
    user_email: Optional[str] = None
    action: str
    entity_type: str
    entity_id: Optional[str] = None
    details: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class AdminStatsOut(BaseModel):
    total_trains: int
    total_stations: int
    total_users: int
    total_running_updates: int
    data_sources_count: int
    recent_searches_count: int

class CSVImportResult(BaseModel):
    imported_count: int
    errors: List[str] = []
    message: str

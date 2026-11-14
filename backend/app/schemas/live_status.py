from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.schemas.station import StationOut

class StopLiveProgress(BaseModel):
    station_code: str
    station_name: str
    stop_sequence: int
    scheduled_arrival: Optional[str] = None
    scheduled_departure: Optional[str] = None
    actual_arrival: Optional[str] = None
    actual_departure: Optional[str] = None
    delay_minutes: int = 0
    distance_km: float = 0.0
    day_number: int = 1
    platform_number: Optional[str] = None
    status: str # "DEPARTED", "ARRIVED", "CURRENT", "UPCOMING"

class LiveStatusOut(BaseModel):
    train_id: int
    train_number: str
    train_name: str
    train_category: str
    source_station: StationOut
    destination_station: StationOut
    status: str # "Running", "Departed", "Arrived", "Scheduled", "Delayed", "Terminated"
    delay_minutes: int
    current_speed_kmh: float
    distance_covered_km: float
    distance_remaining_km: float
    progress_percentage: float
    
    current_station: Optional[StationOut] = None
    last_reported_station: Optional[StationOut] = None
    next_scheduled_station: Optional[StationOut] = None
    
    current_latitude: Optional[float] = None
    current_longitude: Optional[float] = None
    
    scheduled_departure: str
    scheduled_arrival: str
    actual_departure: Optional[str] = None
    actual_arrival: Optional[str] = None
    
    data_source_type: str # "LIVE_VERIFIED", "DEMO_DATA", "SCHEDULED_ESTIMATE"
    is_live_verified: bool
    data_source_name: str
    last_updated: datetime
    
    stops_timeline: List[StopLiveProgress] = []

class LiveStatusUpdate(BaseModel):
    status: Optional[str] = None
    delay_minutes: Optional[int] = None
    current_speed_kmh: Optional[float] = None
    distance_covered_km: Optional[float] = None
    last_reported_station_id: Optional[int] = None
    next_scheduled_station_id: Optional[int] = None
    current_latitude: Optional[float] = None
    current_longitude: Optional[float] = None
    data_source_type: Optional[str] = None

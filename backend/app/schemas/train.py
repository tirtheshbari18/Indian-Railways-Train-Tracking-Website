from pydantic import BaseModel
from typing import Optional, List
from app.schemas.station import StationOut

class TrainStopOut(BaseModel):
    id: int
    stop_sequence: int
    station: StationOut
    scheduled_arrival: Optional[str] = None
    scheduled_departure: Optional[str] = None
    halt_minutes: int = 0
    distance_from_source_km: float = 0.0
    day_number: int = 1
    platform_number: Optional[str] = None
    speed_kmh: Optional[float] = None

    class Config:
        from_attributes = True

class TrainRouteOut(BaseModel):
    id: int
    route_name: str
    total_stops: int
    stops: List[TrainStopOut] = []

    class Config:
        from_attributes = True

class TrainBase(BaseModel):
    train_number: str
    train_name: str
    train_category: str
    source_station_id: int
    destination_station_id: int
    departure_time: str
    arrival_time: str
    total_distance_km: float
    total_duration_minutes: int
    operating_days: str = "Mon,Tue,Wed,Thu,Fri,Sat,Sun"
    rake_type: str = "LHB"
    classes: str = "1A,2A,3A,SL"
    average_speed_kmh: float = 70.0
    max_speed_kmh: float = 130.0
    punctuality_rating: float = 4.5

class TrainCreate(TrainBase):
    pass

class TrainOut(TrainBase):
    id: int
    source_station: StationOut
    destination_station: StationOut

    class Config:
        from_attributes = True

class TrainDetailOut(TrainOut):
    routes: List[TrainRouteOut] = []
    current_status_summary: Optional[str] = None
    punctuality_percentage: float = 92.5
    data_freshness_seconds: int = 45

    class Config:
        from_attributes = True

class TrainSearchQuery(BaseModel):
    query: Optional[str] = None
    source_code: Optional[str] = None
    destination_code: Optional[str] = None
    category: Optional[str] = None
    operating_day: Optional[str] = None
    departure_time_range: Optional[str] = None # e.g. "morning", "afternoon", "evening", "night"

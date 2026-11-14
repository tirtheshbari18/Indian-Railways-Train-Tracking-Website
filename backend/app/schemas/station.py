from pydantic import BaseModel
from typing import Optional, List

class PlatformOut(BaseModel):
    id: int
    platform_number: str
    length_meters: Optional[float] = None
    has_escalator: bool
    has_lift: bool
    is_accessible: bool

    class Config:
        from_attributes = True

class StationBase(BaseModel):
    code: str
    name: str
    hindi_name: Optional[str] = None
    zone: Optional[str] = None
    division: Optional[str] = None
    state: str
    latitude: float
    longitude: float
    number_of_platforms: int = 1
    station_category: Optional[str] = "Standard"

class StationCreate(StationBase):
    pass

class StationOut(StationBase):
    id: int

    class Config:
        from_attributes = True

class StationAutocomplete(BaseModel):
    id: int
    code: str
    name: str
    state: str
    zone: Optional[str] = None

    class Config:
        from_attributes = True

class TrainArrivalDepartureOut(BaseModel):
    train_number: str
    train_name: str
    train_category: str
    source_name: str
    source_code: str
    destination_name: str
    destination_code: str
    scheduled_arrival: Optional[str]
    scheduled_departure: Optional[str]
    halt_minutes: int
    platform_number: Optional[str]
    delay_minutes: int = 0
    status: str = "On Time"

class StationDetailOut(StationOut):
    platforms: List[PlatformOut] = []
    total_stopping_trains: int = 0
    schedule_sample: List[TrainArrivalDepartureOut] = []

    class Config:
        from_attributes = True

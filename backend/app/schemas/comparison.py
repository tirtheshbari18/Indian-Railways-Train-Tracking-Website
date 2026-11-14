from pydantic import BaseModel
from typing import List, Optional
from app.schemas.train import TrainOut

class TrainMetricComparison(BaseModel):
    train: TrainOut
    total_stops: int
    duration_formatted: str
    average_speed_kmh: float
    max_speed_kmh: float
    punctuality_rating: float
    classes_available: List[str]
    operating_days_count: int
    major_intermediate_stations: List[str]
    typical_delay_minutes: int

class TrainCompareRequest(BaseModel):
    train_numbers: List[str]

class TrainCompareOut(BaseModel):
    trains: List[TrainMetricComparison]
    fastest_train_number: str
    least_stops_train_number: str
    highest_punctuality_train_number: str

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.train import TrainOut, TrainDetailOut
from app.services.train_service import TrainService
from app.models.train import Train
from app.models.search_history import SearchHistory
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/trains", tags=["Trains"])

@router.get("/search", response_model=List[TrainOut])
def search_trains(
    query: Optional[str] = Query(None, description="Train number, name or station keyword"),
    source_code: Optional[str] = Query(None, description="Source station code (e.g. NDLS)"),
    destination_code: Optional[str] = Query(None, description="Destination station code (e.g. BSB)"),
    category: Optional[str] = Query(None, description="Train category (Vande Bharat, Rajdhani, etc.)"),
    operating_day: Optional[str] = Query(None, description="Operating day (Mon, Tue, etc.)"),
    departure_time_range: Optional[str] = Query(None, description="morning, afternoon, evening, night"),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    # Log search history if query exists
    if query or source_code or destination_code:
        search_rec = SearchHistory(
            user_id=current_user.id if current_user else None,
            query_type="train_search",
            search_query=query or f"{source_code or ''} -> {destination_code or ''}",
            source_code=source_code,
            destination_code=destination_code
        )
        db.add(search_rec)
        db.commit()

    trains = TrainService.search_trains(
        db=db,
        query=query,
        source_code=source_code,
        destination_code=destination_code,
        category=category,
        operating_day=operating_day,
        departure_time_range=departure_time_range,
        skip=skip,
        limit=limit
    )
    return trains

@router.get("/popular/featured", response_model=List[TrainOut])
def get_featured_trains(db: Session = Depends(get_db)):
    trains = db.query(Train).order_by(Train.punctuality_rating.desc()).limit(6).all()
    return trains

@router.get("/{train_number}", response_model=TrainDetailOut)
def get_train_details(train_number: str, db: Session = Depends(get_db)):
    train = TrainService.get_train_by_number(db, train_number)
    if not train:
        raise HTTPException(status_code=404, detail=f"Train {train_number} not found")
    
    # Calculate detailed attributes
    return TrainDetailOut(
        id=train.id,
        train_number=train.train_number,
        train_name=train.train_name,
        train_category=train.train_category,
        source_station_id=train.source_station_id,
        destination_station_id=train.destination_station_id,
        departure_time=train.departure_time,
        arrival_time=train.arrival_time,
        total_distance_km=train.total_distance_km,
        total_duration_minutes=train.total_duration_minutes,
        operating_days=train.operating_days,
        rake_type=train.rake_type,
        classes=train.classes,
        average_speed_kmh=train.average_speed_kmh,
        max_speed_kmh=train.max_speed_kmh,
        punctuality_rating=train.punctuality_rating,
        source_station=train.source_station,
        destination_station=train.destination_station,
        routes=train.routes,
        current_status_summary=f"Running on time with {train.punctuality_rating}/5.0 reliability",
        punctuality_percentage=round((train.punctuality_rating / 5.0) * 100, 1),
        data_freshness_seconds=30
    )

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.station import StationOut, StationDetailOut, StationAutocomplete, TrainArrivalDepartureOut
from app.services.station_service import StationService
from app.models.station import Station
from app.models.route import TrainStop

router = APIRouter(prefix="/stations", tags=["Stations"])

@router.get("/search", response_model=List[StationOut])
def search_stations(
    query: Optional[str] = Query(None, description="Station code, name or state"),
    zone: Optional[str] = Query(None, description="Railway Zone (NR, WR, CR, etc.)"),
    state: Optional[str] = Query(None, description="State name"),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    return StationService.search_stations(db, query=query, zone=zone, state=state, skip=skip, limit=limit)

@router.get("/autocomplete", response_model=List[StationAutocomplete])
def autocomplete_stations(
    term: str = Query("", description="Station prefix or code"),
    limit: int = 10,
    db: Session = Depends(get_db)
):
    return StationService.autocomplete(db, term=term, limit=limit)

@router.get("/{code}", response_model=StationDetailOut)
def get_station_details(code: str, db: Session = Depends(get_db)):
    station = StationService.get_by_code(db, code)
    if not station:
        raise HTTPException(status_code=404, detail=f"Station with code {code} not found")

    # Get sample stopping trains timetable
    timetable = StationService.get_station_timetable(db, station.id)
    stopping_count = db.query(TrainStop).filter(TrainStop.station_id == station.id).count()

    return StationDetailOut(
        id=station.id,
        code=station.code,
        name=station.name,
        hindi_name=station.hindi_name,
        zone=station.zone,
        division=station.division,
        state=station.state,
        latitude=station.latitude,
        longitude=station.longitude,
        number_of_platforms=station.number_of_platforms,
        station_category=station.station_category,
        platforms=station.platforms,
        total_stopping_trains=stopping_count,
        schedule_sample=timetable[:10]
    )

@router.get("/{code}/timetable", response_model=List[TrainArrivalDepartureOut])
def get_station_timetable(code: str, db: Session = Depends(get_db)):
    station = StationService.get_by_code(db, code)
    if not station:
        raise HTTPException(status_code=404, detail=f"Station with code {code} not found")
    return StationService.get_station_timetable(db, station.id)

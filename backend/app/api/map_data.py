from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.models.station import Station
from app.models.train import Train
from app.models.route import TrainRoute, TrainStop
from app.models.live_update import TrainRunningUpdate
from app.data.corridors import CORRIDOR_WAYPOINTS

router = APIRouter(prefix="/map", tags=["Railway Map Network"])

@router.get("/network")
def get_railway_network(db: Session = Depends(get_db)):
    stations = db.query(Station).all()
    stations_data = [
        {
            "id": s.id,
            "code": s.code,
            "name": s.name,
            "zone": s.zone,
            "state": s.state,
            "latitude": s.latitude,
            "longitude": s.longitude,
            "category": s.station_category,
            "platforms": s.number_of_platforms
        }
        for s in stations
    ]

    # Get train routes
    trains = db.query(Train).options(
        joinedload(Train.source_station),
        joinedload(Train.destination_station),
        joinedload(Train.routes).joinedload(TrainRoute.stops).joinedload(TrainStop.station),
        joinedload(Train.running_updates)
    ).all()

    routes_data = []
    live_trains_data = []

    for t in trains:
        coords = []
        if t.routes and t.routes[0].stops:
            sorted_stops = sorted(t.routes[0].stops, key=lambda s: s.stop_sequence)
            coords = [[s.station.latitude, s.station.longitude] for s in sorted_stops]

        routes_data.append({
            "train_number": t.train_number,
            "train_name": t.train_name,
            "category": t.train_category,
            "source_code": t.source_station.code,
            "destination_code": t.destination_station.code,
            "coordinates": CORRIDOR_WAYPOINTS.get(t.train_number.strip(), coords)
        })

        if t.running_updates and len(t.running_updates) > 0:
            up = t.running_updates[0]
            live_trains_data.append({
                "train_number": t.train_number,
                "train_name": t.train_name,
                "category": t.train_category,
                "latitude": up.current_latitude or t.source_station.latitude,
                "longitude": up.current_longitude or t.source_station.longitude,
                "speed_kmh": up.current_speed_kmh,
                "delay_minutes": up.delay_minutes,
                "status": up.status,
                "progress_percentage": up.progress_percentage
            })

    return {
        "stations": stations_data,
        "routes": routes_data,
        "live_trains": live_trains_data
    }

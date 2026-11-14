from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.models.train import Train
from app.models.route import TrainRoute, TrainStop

router = APIRouter(prefix="/routes", tags=["Routes"])

@router.get("/{train_number}")
def get_train_route(train_number: str, db: Session = Depends(get_db)):
    train = db.query(Train).options(
        joinedload(Train.source_station),
        joinedload(Train.destination_station),
        joinedload(Train.routes).joinedload(TrainRoute.stops).joinedload(TrainStop.station)
    ).filter(Train.train_number == train_number.strip()).first()

    if not train:
        raise HTTPException(status_code=404, detail="Train not found")

    stops_data = []
    coordinates = []
    
    if train.routes and train.routes[0].stops:
        sorted_stops = sorted(train.routes[0].stops, key=lambda x: x.stop_sequence)
        prev_dist = 0.0

        for stop in sorted_stops:
            st = stop.station
            dist_from_prev = round(max(0.0, stop.distance_from_source_km - prev_dist), 1)
            prev_dist = stop.distance_from_source_km

            stops_data.append({
                "sequence": stop.stop_sequence,
                "station_code": st.code,
                "station_name": st.name,
                "hindi_name": st.hindi_name,
                "state": st.state,
                "zone": st.zone,
                "scheduled_arrival": stop.scheduled_arrival or train.departure_time,
                "scheduled_departure": stop.scheduled_departure or train.arrival_time,
                "halt_minutes": stop.halt_minutes,
                "distance_from_source_km": stop.distance_from_source_km,
                "distance_from_previous_km": dist_from_prev,
                "day_number": stop.day_number,
                "platform_number": stop.platform_number,
                "latitude": st.latitude,
                "longitude": st.longitude
            })
            coordinates.append([st.latitude, st.longitude])

    return {
        "train_number": train.train_number,
        "train_name": train.train_name,
        "category": train.train_category,
        "source": {
            "code": train.source_station.code,
            "name": train.source_station.name,
            "latitude": train.source_station.latitude,
            "longitude": train.source_station.longitude,
        },
        "destination": {
            "code": train.destination_station.code,
            "name": train.destination_station.name,
            "latitude": train.destination_station.latitude,
            "longitude": train.destination_station.longitude,
        },
        "total_stops": len(stops_data),
        "total_distance_km": train.total_distance_km,
        "total_duration_minutes": train.total_duration_minutes,
        "stops": stops_data,
        "coordinates": coordinates
    }

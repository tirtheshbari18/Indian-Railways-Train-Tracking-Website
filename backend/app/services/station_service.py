from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from app.models.station import Station, StationPlatform
from app.models.train import Train
from app.models.route import TrainStop
from app.schemas.station import TrainArrivalDepartureOut

class StationService:
    @staticmethod
    def search_stations(
        db: Session,
        query: Optional[str] = None,
        zone: Optional[str] = None,
        state: Optional[str] = None,
        skip: int = 0,
        limit: int = 50
    ) -> List[Station]:
        q = db.query(Station).options(joinedload(Station.platforms))
        if query:
            clean_q = query.strip()
            q = q.filter(
                or_(
                    Station.code.ilike(f"%{clean_q}%"),
                    Station.name.ilike(f"%{clean_q}%"),
                    Station.state.ilike(f"%{clean_q}%")
                )
            )
        if zone and zone != "ALL":
            q = q.filter(Station.zone == zone.strip().upper())
        if state and state != "ALL":
            q = q.filter(Station.state.ilike(f"%{state.strip()}%"))
        return q.offset(skip).limit(limit).all()

    @staticmethod
    def autocomplete(db: Session, term: str, limit: int = 10) -> List[Station]:
        clean = term.strip()
        if not clean:
            return db.query(Station).limit(limit).all()
        return db.query(Station).filter(
            or_(
                Station.code.ilike(f"{clean}%"),
                Station.name.ilike(f"%{clean}%")
            )
        ).limit(limit).all()

    @staticmethod
    def get_by_code(db: Session, code: str) -> Optional[Station]:
        return db.query(Station).options(
            joinedload(Station.platforms)
        ).filter(Station.code.ilike(code.strip())).first()

    @staticmethod
    def get_station_timetable(db: Session, station_id: int) -> List[TrainArrivalDepartureOut]:
        stops = db.query(TrainStop).options(
            joinedload(TrainStop.train).joinedload(Train.source_station),
            joinedload(TrainStop.train).joinedload(Train.destination_station)
        ).filter(TrainStop.station_id == station_id).all()

        results = []
        for stop in stops:
            train = stop.train
            if not train:
                continue
            results.append(TrainArrivalDepartureOut(
                train_number=train.train_number,
                train_name=train.train_name,
                train_category=train.train_category,
                source_name=train.source_station.name,
                source_code=train.source_station.code,
                destination_name=train.destination_station.name,
                destination_code=train.destination_station.code,
                scheduled_arrival=stop.scheduled_arrival or train.departure_time,
                scheduled_departure=stop.scheduled_departure or train.arrival_time,
                halt_minutes=stop.halt_minutes,
                platform_number=stop.platform_number,
                delay_minutes=0,
                status="On Time" if stop.stop_sequence == 1 else "Scheduled"
            ))
        # Sort by scheduled arrival or departure
        results.sort(key=lambda x: (x.scheduled_arrival or x.scheduled_departure or "00:00"))
        return results

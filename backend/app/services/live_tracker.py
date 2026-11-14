from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy.orm import Session, joinedload
from app.models.train import Train
from app.models.station import Station
from app.models.route import TrainRoute, TrainStop
from app.models.live_update import TrainRunningUpdate
from app.models.data_source import DataSource
from app.schemas.live_status import LiveStatusOut, StopLiveProgress
from app.schemas.station import StationOut

class LiveTrackerService:
    @staticmethod
    def get_live_status(db: Session, train_number: str) -> Optional[LiveStatusOut]:
        train = db.query(Train).options(
            joinedload(Train.source_station),
            joinedload(Train.destination_station),
            joinedload(Train.routes).joinedload(TrainRoute.stops).joinedload(TrainStop.station),
            joinedload(Train.running_updates).joinedload(TrainRunningUpdate.last_reported_station),
            joinedload(Train.running_updates).joinedload(TrainRunningUpdate.next_scheduled_station),
            joinedload(Train.running_updates).joinedload(TrainRunningUpdate.current_station)
        ).filter(Train.train_number == train_number.strip()).first()

        if not train:
            return None

        update = None
        if train.running_updates:
            update = train.running_updates[0]

        # Check if verified live data source is active
        verified_source = db.query(DataSource).filter(
            DataSource.is_active == True,
            DataSource.is_live_verified == True
        ).first()

        # If no running update exists yet, generate initial baseline
        if not update:
            update = TrainRunningUpdate(
                train_id=train.id,
                last_reported_station_id=train.source_station_id,
                next_scheduled_station_id=train.destination_station_id,
                status="Scheduled",
                delay_minutes=0,
                current_speed_kmh=0.0,
                distance_covered_km=0.0,
                distance_remaining_km=train.total_distance_km,
                progress_percentage=0.0,
                current_latitude=train.source_station.latitude,
                current_longitude=train.source_station.longitude,
                data_source_type="SCHEDULED_ESTIMATE"
            )
            db.add(update)
            db.commit()
            db.refresh(update)

        # Check verified flag
        is_live_verified = (
            update.data_source_type == "LIVE_VERIFIED" and 
            verified_source is not None and 
            verified_source.is_active
        )

        data_source_name = "CRIS / NTES Live Feed" if is_live_verified else (
            "National Timetable Simulation" if update.data_source_type == "DEMO_DATA" else "Scheduled Timetable Model"
        )

        # Build stops timeline
        stops_timeline: List[StopLiveProgress] = []
        ordered_stops = []
        if train.routes and train.routes[0].stops:
            ordered_stops = sorted(train.routes[0].stops, key=lambda s: s.stop_sequence)

        # Calculate station progress relative to distance covered
        for s in ordered_stops:
            dist = s.distance_from_source_km
            stop_status = "UPCOMING"
            delay = update.delay_minutes

            if dist < update.distance_covered_km - 5:
                stop_status = "DEPARTED"
            elif abs(dist - update.distance_covered_km) <= 5:
                stop_status = "CURRENT"
            else:
                stop_status = "UPCOMING"

            # Estimate actual arrival / departure if delayed
            act_arr = s.scheduled_arrival
            act_dep = s.scheduled_departure
            if delay > 0:
                if act_arr:
                    act_arr = LiveTrackerService._add_delay_to_time(act_arr, delay)
                if act_dep:
                    act_dep = LiveTrackerService._add_delay_to_time(act_dep, delay)

            stops_timeline.append(StopLiveProgress(
                station_code=s.station.code,
                station_name=s.station.name,
                stop_sequence=s.stop_sequence,
                scheduled_arrival=s.scheduled_arrival,
                scheduled_departure=s.scheduled_departure,
                actual_arrival=act_arr,
                actual_departure=act_dep,
                delay_minutes=delay if stop_status != "UPCOMING" else 0,
                distance_km=s.distance_from_source_km,
                day_number=s.day_number,
                platform_number=s.platform_number,
                status=stop_status
            ))

        return LiveStatusOut(
            train_id=train.id,
            train_number=train.train_number,
            train_name=train.train_name,
            train_category=train.train_category,
            source_station=StationOut.model_validate(train.source_station),
            destination_station=StationOut.model_validate(train.destination_station),
            status=update.status,
            delay_minutes=update.delay_minutes,
            current_speed_kmh=update.current_speed_kmh,
            distance_covered_km=update.distance_covered_km,
            distance_remaining_km=update.distance_remaining_km,
            progress_percentage=update.progress_percentage,
            current_station=StationOut.model_validate(update.current_station) if update.current_station else None,
            last_reported_station=StationOut.model_validate(update.last_reported_station) if update.last_reported_station else None,
            next_scheduled_station=StationOut.model_validate(update.next_scheduled_station) if update.next_scheduled_station else None,
            current_latitude=update.current_latitude or train.source_station.latitude,
            current_longitude=update.current_longitude or train.source_station.longitude,
            scheduled_departure=train.departure_time,
            scheduled_arrival=train.arrival_time,
            actual_departure=update.actual_departure or train.departure_time,
            actual_arrival=update.actual_arrival or train.arrival_time,
            data_source_type=update.data_source_type if is_live_verified else "DEMO_DATA",
            is_live_verified=is_live_verified,
            data_source_name=data_source_name,
            last_updated=update.last_updated or datetime.now(timezone.utc),
            stops_timeline=stops_timeline
        )

    @staticmethod
    def _add_delay_to_time(time_str: str, delay_minutes: int) -> str:
        try:
            parts = time_str.split(":")
            h = int(parts[0])
            m = int(parts[1])
            total = h * 60 + m + delay_minutes
            new_h = (total // 60) % 24
            new_m = total % 60
            return f"{new_h:02d}:{new_m:02d}"
        except Exception:
            return time_str

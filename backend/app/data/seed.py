import json
import os
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.user import User
from app.models.station import Station, StationPlatform
from app.models.train import Train, TrainSchedule
from app.models.route import TrainRoute, TrainStop
from app.models.live_update import TrainRunningUpdate
from app.models.data_source import DataSource
from app.models.audit_log import AuditLog
from app.models.favourite import Favourite
from app.models.search_history import SearchHistory

def seed_database(db: Session = None):
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    
    close_db = False
    if db is None:
        db = SessionLocal()
        close_db = True

    try:
        # 1. Seed Users
        if db.query(User).count() == 0:
            print("Seeding users...")
            admin_user = User(
                email="admin@railtrack.gov.in",
                hashed_password=get_password_hash("admin123"),
                full_name="Chief Operating Officer (System Admin)",
                role="admin",
                is_active=True
            )
            demo_user = User(
                email="passenger@railtrack.gov.in",
                hashed_password=get_password_hash("passenger123"),
                full_name="Rajesh Sharma",
                role="user",
                is_active=True
            )
            db.add_all([admin_user, demo_user])
            db.commit()

        # 2. Seed Data Sources
        if db.query(DataSource).count() == 0:
            print("Seeding data sources...")
            ds1 = DataSource(
                name="Indian Railways NTES Feed (Simulated)",
                source_type="INTERNAL_SIMULATOR",
                endpoint_url="https://api.railway.gov.in/v1/ntes-feed",
                is_active=True,
                is_live_verified=True,
                sync_interval_seconds=15,
                last_sync_time=datetime.now(timezone.utc),
                status="OPERATIONAL"
            )
            ds2 = DataSource(
                name="IRCTC National Timetable Archive",
                source_type="STATIC_IMPORT",
                endpoint_url="/data/timetable_2026.json",
                is_active=True,
                is_live_verified=False,
                sync_interval_seconds=3600,
                last_sync_time=datetime.now(timezone.utc),
                status="OPERATIONAL"
            )
            ds3 = DataSource(
                name="CRIS Live GPS Tracking Beacon",
                source_type="OFFICIAL_API",
                endpoint_url="https://cris.org.in/gps/tracking",
                is_active=False,
                is_live_verified=False,
                sync_interval_seconds=30,
                status="STANDBY"
            )
            db.add_all([ds1, ds2, ds3])
            db.commit()

        # 3. Seed Stations
        current_dir = os.path.dirname(__file__)
        stations_path = os.path.join(current_dir, "initial_stations.json")
        stations_map = {}
        
        if db.query(Station).count() == 0 and os.path.exists(stations_path):
            print("Seeding stations...")
            with open(stations_path, "r", encoding="utf-8") as f:
                stations_data = json.load(f)

            for s in stations_data:
                st = Station(
                    code=s["code"],
                    name=s["name"],
                    hindi_name=s.get("hindi_name"),
                    zone=s.get("zone"),
                    division=s.get("division"),
                    state=s["state"],
                    latitude=s["latitude"],
                    longitude=s["longitude"],
                    number_of_platforms=s.get("number_of_platforms", 4),
                    station_category=s.get("station_category", "Standard")
                )
                db.add(st)
                db.flush()
                stations_map[st.code] = st

                # Seed platforms
                for p_num in range(1, min(st.number_of_platforms + 1, 9)):
                    platform = StationPlatform(
                        station_id=st.id,
                        platform_number=str(p_num),
                        length_meters=600.0,
                        has_escalator=p_num <= 4,
                        has_lift=p_num <= 3,
                        is_accessible=True
                    )
                    db.add(platform)
            db.commit()
        else:
            for st in db.query(Station).all():
                stations_map[st.code] = st

        # 4. Seed Trains & Routes
        trains_path = os.path.join(current_dir, "initial_trains.json")
        if db.query(Train).count() == 0 and os.path.exists(trains_path):
            print("Seeding trains and running updates...")
            with open(trains_path, "r", encoding="utf-8") as f:
                trains_data = json.load(f)

            for t_data in trains_data:
                src = stations_map.get(t_data["source_code"])
                dst = stations_map.get(t_data["destination_code"])
                if not src or not dst:
                    continue

                train = Train(
                    train_number=t_data["train_number"],
                    train_name=t_data["train_name"],
                    train_category=t_data["train_category"],
                    source_station_id=src.id,
                    destination_station_id=dst.id,
                    departure_time=t_data["departure_time"],
                    arrival_time=t_data["arrival_time"],
                    total_distance_km=t_data.get("total_distance_km", 500.0),
                    total_duration_minutes=t_data.get("total_duration_minutes", 360),
                    operating_days=t_data.get("operating_days", "Mon,Tue,Wed,Thu,Fri,Sat,Sun"),
                    rake_type=t_data.get("rake_type", "LHB"),
                    classes=t_data.get("classes", "1A,2A,3A,SL"),
                    average_speed_kmh=t_data.get("average_speed_kmh", 75.0),
                    max_speed_kmh=t_data.get("max_speed_kmh", 130.0),
                    punctuality_rating=t_data.get("punctuality_rating", 4.5)
                )
                db.add(train)
                db.flush()

                # Add Schedule
                schedule = TrainSchedule(
                    train_id=train.id,
                    day_of_week="Daily",
                    departure_time=train.departure_time,
                    arrival_time=train.arrival_time,
                    status="Active"
                )
                db.add(schedule)

                # Add Route
                route = TrainRoute(
                    train_id=train.id,
                    route_name="Main Trunk Route",
                    is_active=True,
                    total_stops=len(t_data["stops"])
                )
                db.add(route)
                db.flush()

                # Add Stops
                for stop_data in t_data["stops"]:
                    stop_st = stations_map.get(stop_data["station_code"])
                    if not stop_st:
                        continue
                    t_stop = TrainStop(
                        route_id=route.id,
                        train_id=train.id,
                        station_id=stop_st.id,
                        stop_sequence=stop_data["stop_sequence"],
                        scheduled_arrival=stop_data.get("scheduled_arrival"),
                        scheduled_departure=stop_data.get("scheduled_departure"),
                        halt_minutes=stop_data.get("halt_minutes", 2),
                        distance_from_source_km=stop_data.get("distance_from_source_km", 0.0),
                        day_number=stop_data.get("day_number", 1),
                        platform_number=stop_data.get("platform_number", "1"),
                        speed_kmh=train.average_speed_kmh
                    )
                    db.add(t_stop)

                # Add Live Running Update
                init_running = t_data.get("initial_running", {})
                last_st = stations_map.get(init_running.get("last_reported_code", t_data["source_code"]))
                next_st = stations_map.get(init_running.get("next_scheduled_code", t_data["destination_code"]))
                
                running_update = TrainRunningUpdate(
                    train_id=train.id,
                    current_station_id=None,
                    last_reported_station_id=last_st.id if last_st else src.id,
                    next_scheduled_station_id=next_st.id if next_st else dst.id,
                    status=init_running.get("status", "Running"),
                    delay_minutes=init_running.get("delay_minutes", 0),
                    current_speed_kmh=init_running.get("current_speed_kmh", 80.0),
                    distance_covered_km=init_running.get("distance_covered_km", 100.0),
                    distance_remaining_km=init_running.get("distance_remaining_km", 200.0),
                    progress_percentage=init_running.get("progress_percentage", 33.0),
                    current_latitude=init_running.get("current_latitude", src.latitude),
                    current_longitude=init_running.get("current_longitude", src.longitude),
                    data_source_type=init_running.get("data_source_type", "DEMO_DATA")
                )
                db.add(running_update)

            db.commit()

        # 5. Audit Log sample
        if db.query(AuditLog).count() == 0:
            log1 = AuditLog(
                user_id=1,
                action="SYSTEM_INIT",
                entity_type="SYSTEM",
                entity_id="0",
                details="Initial Indian Railways database seeded successfully with standard timetable and stations.",
                ip_address="127.0.0.1"
            )
            db.add(log1)
            db.commit()

        print("Database seeding completed successfully.")

    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        raise
    finally:
        if close_db:
            db.close()

if __name__ == "__main__":
    seed_database()

import csv
import io
from datetime import datetime, timezone
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.models.train import Train, TrainSchedule
from app.models.station import Station
from app.models.data_source import DataSource
from app.models.live_update import TrainRunningUpdate
from app.models.audit_log import AuditLog

class DataProviderService:
    @staticmethod
    def simulate_step(db: Session):
        """Simulates train movement for demonstration when live external feeds are in simulation mode."""
        updates = db.query(TrainRunningUpdate).all()
        for u in updates:
            train = u.train
            if not train:
                continue

            # Advance distance slightly
            speed = u.current_speed_kmh or 90.0
            km_advance = (speed / 3600.0) * 15 # 15 seconds step

            new_covered = u.distance_covered_km + km_advance
            if new_covered >= train.total_distance_km:
                new_covered = 0.0 # Loop simulation
                u.status = "Departed"
                u.delay_minutes = 0
            else:
                u.status = "Running" if u.delay_minutes < 15 else "Delayed"

            u.distance_covered_km = round(new_covered, 1)
            u.distance_remaining_km = round(max(0.0, train.total_distance_km - new_covered), 1)
            u.progress_percentage = round((new_covered / max(1.0, train.total_distance_km)) * 100, 1)
            u.last_updated = datetime.now(timezone.utc)

        db.commit()

    @staticmethod
    def import_trains_csv(db: Session, csv_content: str, user_id: int = None) -> Tuple[int, List[str]]:
        reader = csv.DictReader(io.StringIO(csv_content))
        imported = 0
        errors = []

        for idx, row in enumerate(reader, start=1):
            try:
                num = row.get("train_number", "").strip()
                name = row.get("train_name", "").strip()
                cat = row.get("train_category", "Superfast").strip()
                src_code = row.get("source_code", "").strip().upper()
                dst_code = row.get("destination_code", "").strip().upper()

                if not num or not name or not src_code or not dst_code:
                    errors.append(f"Row {idx}: Missing required fields.")
                    continue

                src = db.query(Station).filter(Station.code == src_code).first()
                dst = db.query(Station).filter(Station.code == dst_code).first()

                if not src or not dst:
                    errors.append(f"Row {idx}: Unknown station code '{src_code}' or '{dst_code}'.")
                    continue

                existing = db.query(Train).filter(Train.train_number == num).first()
                if existing:
                    # Update existing train
                    existing.train_name = name
                    existing.train_category = cat
                    existing.source_station_id = src.id
                    existing.destination_station_id = dst.id
                    existing.departure_time = row.get("departure_time", "06:00").strip()
                    existing.arrival_time = row.get("arrival_time", "18:00").strip()
                    existing.total_distance_km = float(row.get("total_distance_km", 500.0))
                else:
                    train = Train(
                        train_number=num,
                        train_name=name,
                        train_category=cat,
                        source_station_id=src.id,
                        destination_station_id=dst.id,
                        departure_time=row.get("departure_time", "06:00").strip(),
                        arrival_time=row.get("arrival_time", "18:00").strip(),
                        total_distance_km=float(row.get("total_distance_km", 500.0)),
                        operating_days=row.get("operating_days", "Daily").strip(),
                        classes=row.get("classes", "1A,2A,3A,SL").strip()
                    )
                    db.add(train)
                imported += 1
            except Exception as ex:
                errors.append(f"Row {idx}: {str(ex)}")

        db.commit()

        # Log audit
        log = AuditLog(
            user_id=user_id,
            action="CSV_IMPORT_TRAINS",
            entity_type="TRAIN",
            details=f"Imported {imported} trains with {len(errors)} errors.",
            ip_address="admin"
        )
        db.add(log)
        db.commit()

        return imported, errors

from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from app.models.train import Train
from app.models.route import TrainRoute, TrainStop
from app.schemas.comparison import TrainCompareOut, TrainMetricComparison
from app.schemas.train import TrainOut

class ComparisonService:
    @staticmethod
    def compare_trains(db: Session, train_numbers: List[str]) -> Optional[TrainCompareOut]:
        if not train_numbers:
            return None

        clean_numbers = [num.strip() for num in train_numbers if num.strip()]
        trains = db.query(Train).options(
            joinedload(Train.source_station),
            joinedload(Train.destination_station),
            joinedload(Train.routes).joinedload(TrainRoute.stops).joinedload(TrainStop.station),
            joinedload(Train.running_updates)
        ).filter(Train.train_number.in_(clean_numbers)).all()

        if not trains:
            return None

        metrics: List[TrainMetricComparison] = []
        for t in trains:
            stops_count = 0
            major_stations = []
            if t.routes and t.routes[0].stops:
                stops_count = len(t.routes[0].stops)
                major_stations = [s.station.name for s in t.routes[0].stops[:4]]

            hours = t.total_duration_minutes // 60
            mins = t.total_duration_minutes % 60
            dur_fmt = f"{hours}h {mins}m"

            typical_delay = 5
            if t.running_updates:
                typical_delay = t.running_updates[0].delay_minutes

            classes_list = [c.strip() for c in t.classes.split(",") if c.strip()]
            op_days_count = len([d for d in t.operating_days.split(",") if d.strip()])

            metrics.append(TrainMetricComparison(
                train=TrainOut.model_validate(t),
                total_stops=stops_count,
                duration_formatted=dur_fmt,
                average_speed_kmh=t.average_speed_kmh,
                max_speed_kmh=t.max_speed_kmh,
                punctuality_rating=t.punctuality_rating,
                classes_available=classes_list,
                operating_days_count=op_days_count,
                major_intermediate_stations=major_stations,
                typical_delay_minutes=typical_delay
            ))

        # Determine best train by metric
        fastest = min(metrics, key=lambda m: m.train.total_duration_minutes).train.train_number
        least_stops = min(metrics, key=lambda m: m.total_stops).train.train_number
        highest_punctuality = max(metrics, key=lambda m: m.punctuality_rating).train.train_number

        return TrainCompareOut(
            trains=metrics,
            fastest_train_number=fastest,
            least_stops_train_number=least_stops,
            highest_punctuality_train_number=highest_punctuality
        )

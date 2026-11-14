from typing import List, Optional
from sqlalchemy.orm import Session, joinedload, aliased
from sqlalchemy import or_, and_
from app.models.train import Train
from app.models.station import Station
from app.models.route import TrainRoute, TrainStop

class TrainService:
    @staticmethod
    def search_trains(
        db: Session,
        query: Optional[str] = None,
        source_code: Optional[str] = None,
        destination_code: Optional[str] = None,
        category: Optional[str] = None,
        operating_day: Optional[str] = None,
        departure_time_range: Optional[str] = None,
        skip: int = 0,
        limit: int = 50
    ) -> List[Train]:
        q = db.query(Train).options(
            joinedload(Train.source_station),
            joinedload(Train.destination_station)
        )

        if query:
            clean_q = query.strip()
            src_st = aliased(Station)
            dst_st = aliased(Station)
            q = q.join(src_st, Train.source_station_id == src_st.id, isouter=True)\
                 .join(dst_st, Train.destination_station_id == dst_st.id, isouter=True)\
                 .filter(
                    or_(
                        Train.train_number.ilike(f"%{clean_q}%"),
                        Train.train_name.ilike(f"%{clean_q}%"),
                        src_st.code.ilike(f"%{clean_q}%"),
                        src_st.name.ilike(f"%{clean_q}%"),
                        dst_st.code.ilike(f"%{clean_q}%"),
                        dst_st.name.ilike(f"%{clean_q}%")
                    )
                )

        if source_code:
            src_alias = db.query(Station.id).filter(Station.code.ilike(source_code.strip())).subquery()
            # Direct source or intermediate stop
            q = q.filter(
                or_(
                    Train.source_station_id.in_(src_alias),
                    Train.id.in_(
                        db.query(TrainStop.train_id).filter(
                            TrainStop.station_id.in_(src_alias)
                        )
                    )
                )
            )

        if destination_code:
            dst_alias = db.query(Station.id).filter(Station.code.ilike(destination_code.strip())).subquery()
            q = q.filter(
                or_(
                    Train.destination_station_id.in_(dst_alias),
                    Train.id.in_(
                        db.query(TrainStop.train_id).filter(
                            TrainStop.station_id.in_(dst_alias)
                        )
                    )
                )
            )

        if category and category != "ALL":
            q = q.filter(Train.train_category.ilike(f"%{category}%"))

        if operating_day and operating_day != "ALL":
            q = q.filter(Train.operating_days.ilike(f"%{operating_day[:3]}%"))

        if departure_time_range and departure_time_range != "ALL":
            # "morning" (06:00-11:59), "afternoon" (12:00-16:59), "evening" (17:00-20:59), "night" (21:00-05:59)
            if departure_time_range == "morning":
                q = q.filter(Train.departure_time >= "06:00", Train.departure_time < "12:00")
            elif departure_time_range == "afternoon":
                q = q.filter(Train.departure_time >= "12:00", Train.departure_time < "17:00")
            elif departure_time_range == "evening":
                q = q.filter(Train.departure_time >= "17:00", Train.departure_time < "21:00")
            elif departure_time_range == "night":
                q = q.filter(or_(Train.departure_time >= "21:00", Train.departure_time < "06:00"))

        return q.offset(skip).limit(limit).all()

    @staticmethod
    def get_train_by_number(db: Session, train_number: str) -> Optional[Train]:
        return db.query(Train).options(
            joinedload(Train.source_station),
            joinedload(Train.destination_station),
            joinedload(Train.routes).joinedload(TrainRoute.stops).joinedload(TrainStop.station)
        ).filter(Train.train_number == train_number.strip()).first()

    @staticmethod
    def get_train_by_id(db: Session, train_id: int) -> Optional[Train]:
        return db.query(Train).options(
            joinedload(Train.source_station),
            joinedload(Train.destination_station)
        ).filter(Train.id == train_id).first()

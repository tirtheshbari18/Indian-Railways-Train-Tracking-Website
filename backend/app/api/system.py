import time
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db, engine
from app.models.train import Train
from app.models.station import Station
from app.models.data_source import DataSource
from app.schemas.system import SystemHealthOut, DataSourceOut

router = APIRouter(prefix="/system", tags=["System & Infrastructure"])

_SERVER_START_TIME = time.time()

@router.get("/health", response_model=SystemHealthOut)
def get_system_health(db: Session = Depends(get_db)):
    train_count = db.query(Train).count()
    station_count = db.query(Station).count()
    data_sources = db.query(DataSource).all()
    
    live_verified_active = any(ds.is_active and ds.is_live_verified for ds in data_sources)

    return SystemHealthOut(
        status="OPERATIONAL",
        database="CONNECTED" if engine else "DISCONNECTED",
        active_trains_count=train_count,
        active_stations_count=station_count,
        live_tracking_enabled=live_verified_active,
        data_sources=[DataSourceOut.model_validate(ds) for ds in data_sources],
        server_time=datetime.now(timezone.utc),
        uptime_seconds=round(time.time() - _SERVER_START_TIME, 2)
    )

@router.get("/data-sources", response_model=List[DataSourceOut])
def get_data_sources(db: Session = Depends(get_db)):
    return db.query(DataSource).all()

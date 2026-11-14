from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class TrainRunningUpdate(Base):
    __tablename__ = "train_running_updates"

    id = Column(Integer, primary_key=True, index=True)
    train_id = Column(Integer, ForeignKey("trains.id", ondelete="CASCADE"), nullable=False, index=True)
    current_station_id = Column(Integer, ForeignKey("stations.id"), nullable=True)
    last_reported_station_id = Column(Integer, ForeignKey("stations.id"), nullable=True)
    next_scheduled_station_id = Column(Integer, ForeignKey("stations.id"), nullable=True)
    
    status = Column(String(50), default="Scheduled") # "Running", "Departed", "Arrived", "Scheduled", "Delayed", "Terminated"
    delay_minutes = Column(Integer, default=0)
    current_speed_kmh = Column(Float, default=0.0)
    distance_covered_km = Column(Float, default=0.0)
    distance_remaining_km = Column(Float, default=0.0)
    progress_percentage = Column(Float, default=0.0)
    current_latitude = Column(Float, nullable=True)
    current_longitude = Column(Float, nullable=True)
    
    # Must distinguish genuine LIVE data from simulation / scheduled / demo data
    data_source_type = Column(String(50), default="DEMO_DATA") # "LIVE_VERIFIED", "DEMO_DATA", "SCHEDULED_ESTIMATE"
    actual_departure = Column(String(10), nullable=True)
    actual_arrival = Column(String(10), nullable=True)
    last_updated = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    train = relationship("Train", back_populates="running_updates")
    current_station = relationship("Station", foreign_keys=[current_station_id])
    last_reported_station = relationship("Station", foreign_keys=[last_reported_station_id])
    next_scheduled_station = relationship("Station", foreign_keys=[next_scheduled_station_id])

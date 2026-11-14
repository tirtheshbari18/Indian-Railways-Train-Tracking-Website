from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class Train(Base):
    __tablename__ = "trains"

    id = Column(Integer, primary_key=True, index=True)
    train_number = Column(String(10), unique=True, index=True, nullable=False)
    train_name = Column(String(150), index=True, nullable=False)
    train_category = Column(String(50), index=True, nullable=False) # Vande Bharat, Rajdhani, Shatabdi, Superfast, Mail/Express, Duronto, Garib Rath
    source_station_id = Column(Integer, ForeignKey("stations.id"), nullable=False, index=True)
    destination_station_id = Column(Integer, ForeignKey("stations.id"), nullable=False, index=True)
    departure_time = Column(String(10), nullable=False)             # "06:00"
    arrival_time = Column(String(10), nullable=False)               # "14:05"
    total_distance_km = Column(Float, default=0.0)
    total_duration_minutes = Column(Integer, default=0)
    operating_days = Column(String(50), default="Mon,Tue,Wed,Thu,Fri,Sat,Sun") # Comma separated
    rake_type = Column(String(50), default="LHB")                   # LHB, Vande Bharat, ICF
    classes = Column(String(100), default="1A,2A,3A,SL")            # e.g., EC,CC or 1A,2A,3A,SL,2S
    average_speed_kmh = Column(Float, default=70.0)
    max_speed_kmh = Column(Float, default=130.0)
    punctuality_rating = Column(Float, default=4.5)                 # out of 5.0
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    source_station = relationship("Station", foreign_keys=[source_station_id], back_populates="originating_trains")
    destination_station = relationship("Station", foreign_keys=[destination_station_id], back_populates="terminating_trains")
    routes = relationship("TrainRoute", back_populates="train", cascade="all, delete-orphan")
    stops = relationship("TrainStop", back_populates="train", cascade="all, delete-orphan")
    schedules = relationship("TrainSchedule", back_populates="train", cascade="all, delete-orphan")
    running_updates = relationship("TrainRunningUpdate", back_populates="train", cascade="all, delete-orphan")

class TrainSchedule(Base):
    __tablename__ = "train_schedules"

    id = Column(Integer, primary_key=True, index=True)
    train_id = Column(Integer, ForeignKey("trains.id", ondelete="CASCADE"), nullable=False, index=True)
    day_of_week = Column(String(20), nullable=False) # "Mon", "Tue", etc. or "Daily"
    departure_time = Column(String(10), nullable=False)
    arrival_time = Column(String(10), nullable=False)
    status = Column(String(20), default="Active")

    train = relationship("Train", back_populates="schedules")

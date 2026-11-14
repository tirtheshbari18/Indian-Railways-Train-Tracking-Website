from sqlalchemy import Column, Integer, String, Float, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

class TrainRoute(Base):
    __tablename__ = "train_routes"

    id = Column(Integer, primary_key=True, index=True)
    train_id = Column(Integer, ForeignKey("trains.id", ondelete="CASCADE"), nullable=False, index=True)
    route_name = Column(String(100), default="Primary Route")
    is_active = Column(Boolean, default=True)
    total_stops = Column(Integer, default=0)

    train = relationship("Train", back_populates="routes")
    stops = relationship("TrainStop", back_populates="route", cascade="all, delete-orphan", order_by="TrainStop.stop_sequence")

class TrainStop(Base):
    __tablename__ = "train_stops"

    id = Column(Integer, primary_key=True, index=True)
    route_id = Column(Integer, ForeignKey("train_routes.id", ondelete="CASCADE"), nullable=True, index=True)
    train_id = Column(Integer, ForeignKey("trains.id", ondelete="CASCADE"), nullable=False, index=True)
    station_id = Column(Integer, ForeignKey("stations.id"), nullable=False, index=True)
    stop_sequence = Column(Integer, nullable=False, index=True)
    scheduled_arrival = Column(String(10), nullable=True)     # "06:00" or None for origin
    scheduled_departure = Column(String(10), nullable=True)   # "06:05" or None for destination
    halt_minutes = Column(Integer, default=0)
    distance_from_source_km = Column(Float, default=0.0)
    day_number = Column(Integer, default=1)
    platform_number = Column(String(10), nullable=True)
    speed_kmh = Column(Float, nullable=True)

    route = relationship("TrainRoute", back_populates="stops")
    train = relationship("Train", back_populates="stops")
    station = relationship("Station", back_populates="stops")

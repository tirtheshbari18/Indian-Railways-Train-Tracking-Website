from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class Station(Base):
    __tablename__ = "stations"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(10), unique=True, index=True, nullable=False)
    name = Column(String(150), index=True, nullable=False)
    hindi_name = Column(String(150), nullable=True)
    zone = Column(String(10), index=True, nullable=True)          # e.g., NR, WR, CR, SR, ER, NCR, etc.
    division = Column(String(50), nullable=True)                  # e.g., Delhi, Mumbai, etc.
    state = Column(String(100), index=True, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    number_of_platforms = Column(Integer, default=1)
    station_category = Column(String(50), default="Standard")     # A1, A, Junction, Terminal, etc.
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    platforms = relationship("StationPlatform", back_populates="station", cascade="all, delete-orphan")
    originating_trains = relationship("Train", foreign_keys="Train.source_station_id", back_populates="source_station")
    terminating_trains = relationship("Train", foreign_keys="Train.destination_station_id", back_populates="destination_station")
    stops = relationship("TrainStop", back_populates="station", cascade="all, delete-orphan")

class StationPlatform(Base):
    __tablename__ = "station_platforms"

    id = Column(Integer, primary_key=True, index=True)
    station_id = Column(Integer, ForeignKey("stations.id", ondelete="CASCADE"), nullable=False, index=True)
    platform_number = Column(String(10), nullable=False)
    length_meters = Column(Float, nullable=True)
    has_escalator = Column(Boolean, default=False)
    has_lift = Column(Boolean, default=False)
    is_accessible = Column(Boolean, default=True)

    station = relationship("Station", back_populates="platforms")

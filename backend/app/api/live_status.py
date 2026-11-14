from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.live_tracker import LiveTrackerService
from app.services.data_provider import DataProviderService
from app.schemas.live_status import LiveStatusOut

router = APIRouter(prefix="/live-status", tags=["Train Live Running Status"])

@router.get("/{train_number}", response_model=LiveStatusOut)
def get_live_status(train_number: str, db: Session = Depends(get_db)):
    status_data = LiveTrackerService.get_live_status(db, train_number)
    if not status_data:
        raise HTTPException(status_code=404, detail=f"No running status found for train {train_number}")
    return status_data

@router.post("/simulate-tick")
def simulate_train_movement(db: Session = Depends(get_db)):
    """Advances trains along their routes to provide real-time updates."""
    DataProviderService.simulate_step(db)
    return {"status": "ok", "message": "Simulated train movement step executed"}

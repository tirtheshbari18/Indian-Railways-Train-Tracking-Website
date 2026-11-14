from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.comparison import TrainCompareRequest, TrainCompareOut
from app.services.comparison_service import ComparisonService

router = APIRouter(prefix="/comparison", tags=["Train Comparison"])

@router.post("/compare", response_model=TrainCompareOut)
def compare_trains(req: TrainCompareRequest, db: Session = Depends(get_db)):
    if not req.train_numbers or len(req.train_numbers) < 2:
        raise HTTPException(
            status_code=400,
            detail="At least 2 train numbers are required for comparison"
        )
    
    result = ComparisonService.compare_trains(db, req.train_numbers)
    if not result:
        raise HTTPException(
            status_code=404,
            detail="Could not find enough matching trains to compare"
        )
    return result

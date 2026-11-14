from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel
from app.core.database import get_db
from app.models.user import User
from app.models.favourite import Favourite
from app.models.search_history import SearchHistory
from app.models.train import Train
from app.models.station import Station
from app.api.deps import require_current_user

router = APIRouter(prefix="/user", tags=["User Preferences & History"])

class FavouriteCreate(BaseModel):
    item_type: str # "train" or "station"
    train_id: int = None
    station_id: int = None

class FavouriteOut(BaseModel):
    id: int
    item_type: str
    train_id: int = None
    station_id: int = None
    title: str
    subtitle: str

@router.get("/favourites")
def get_user_favourites(current_user: User = Depends(require_current_user), db: Session = Depends(get_db)):
    favs = db.query(Favourite).options(
        joinedload(Favourite.train),
        joinedload(Favourite.station)
    ).filter(Favourite.user_id == current_user.id).all()

    results = []
    for f in favs:
        title = ""
        subtitle = ""
        if f.item_type == "train" and f.train:
            title = f"{f.train.train_number} - {f.train.train_name}"
            subtitle = f"{f.train.train_category} | {f.train.operating_days}"
        elif f.item_type == "station" and f.station:
            title = f"{f.station.code} - {f.station.name}"
            subtitle = f"{f.station.state} | {f.station.zone} Zone"

        results.append({
            "id": f.id,
            "item_type": f.item_type,
            "train_id": f.train_id,
            "station_id": f.station_id,
            "train_number": f.train.train_number if f.train else None,
            "station_code": f.station.code if f.station else None,
            "title": title,
            "subtitle": subtitle,
            "created_at": f.created_at
        })
    return results

@router.post("/favourites")
def add_favourite(fav: FavouriteCreate, current_user: User = Depends(require_current_user), db: Session = Depends(get_db)):
    # Check if duplicate exists
    query = db.query(Favourite).filter(Favourite.user_id == current_user.id, Favourite.item_type == fav.item_type)
    if fav.item_type == "train":
        query = query.filter(Favourite.train_id == fav.train_id)
    else:
        query = query.filter(Favourite.station_id == fav.station_id)
    
    if query.first():
        return {"status": "already_exists", "message": "Item is already in your favourites"}

    new_fav = Favourite(
        user_id=current_user.id,
        item_type=fav.item_type,
        train_id=fav.train_id,
        station_id=fav.station_id
    )
    db.add(new_fav)
    db.commit()
    db.refresh(new_fav)
    return {"status": "ok", "id": new_fav.id, "message": "Added to favourites"}

@router.delete("/favourites/{fav_id}")
def remove_favourite(fav_id: int, current_user: User = Depends(require_current_user), db: Session = Depends(get_db)):
    fav = db.query(Favourite).filter(Favourite.id == fav_id, Favourite.user_id == current_user.id).first()
    if not fav:
        raise HTTPException(status_code=404, detail="Favourite not found")
    db.delete(fav)
    db.commit()
    return {"status": "ok", "message": "Removed from favourites"}

@router.get("/history")
def get_user_search_history(current_user: User = Depends(require_current_user), db: Session = Depends(get_db)):
    history = db.query(SearchHistory).filter(
        SearchHistory.user_id == current_user.id
    ).order_by(SearchHistory.created_at.desc()).limit(20).all()

    return [
        {
            "id": h.id,
            "query_type": h.query_type,
            "search_query": h.search_query,
            "source_code": h.source_code,
            "destination_code": h.destination_code,
            "created_at": h.created_at
        }
        for h in history
    ]

@router.delete("/history")
def clear_user_search_history(current_user: User = Depends(require_current_user), db: Session = Depends(get_db)):
    db.query(SearchHistory).filter(SearchHistory.user_id == current_user.id).delete()
    db.commit()
    return {"status": "ok", "message": "Search history cleared"}

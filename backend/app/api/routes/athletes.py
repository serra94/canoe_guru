from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models import EventCategory, EventAthlete
from app.schemas import EventAthleteOut

router = APIRouter(
    prefix="/events/{event_id}/categories/{category_id}/athletes",
    tags=["event-athletes"],
)


@router.get("", response_model=List[EventAthleteOut])
def list_athletes(event_id: str, category_id: str, db: Session = Depends(get_db)) -> List[EventAthleteOut]:
    category = (
        db.query(EventCategory)
        .filter(EventCategory.id == category_id, EventCategory.event_id == event_id)
        .first()
    )
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return (
        db.query(EventAthlete)
        .filter(EventAthlete.event_id == event_id, EventAthlete.event_category_id == category_id)
        .order_by(EventAthlete.ranking_position.asc().nulls_last())
        .all()
    )

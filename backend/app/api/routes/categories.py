from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models import Event, EventCategory
from app.schemas import EventCategoryOut

router = APIRouter(prefix="/events/{event_id}/categories", tags=["event-categories"])


@router.get("", response_model=List[EventCategoryOut])
def list_categories(event_id: str, db: Session = Depends(get_db)) -> List[EventCategoryOut]:
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return (
        db.query(EventCategory)
        .filter(EventCategory.event_id == event_id)
        .order_by(EventCategory.name.asc())
        .all()
    )

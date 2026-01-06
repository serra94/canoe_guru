from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models import Event
from app.schemas import EventOut

router = APIRouter(prefix="/events", tags=["events"])


@router.get("", response_model=List[EventOut])
def list_events(
    is_official: Optional[bool] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
) -> List[EventOut]:
    query = db.query(Event)
    if is_official is not None:
        query = query.filter(Event.is_official == is_official)
    if status:
        query = query.filter(Event.status == status)
    return query.order_by(Event.created_at.desc()).all()


@router.get("/{event_id}", response_model=EventOut)
def get_event(event_id: str, db: Session = Depends(get_db)) -> EventOut:
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

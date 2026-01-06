from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models import EventResult
from app.schemas import EventResultOut

router = APIRouter(prefix="/events/{event_id}/results", tags=["event-results"])


@router.get("", response_model=List[EventResultOut])
def list_results(event_id: str, db: Session = Depends(get_db)) -> List[EventResultOut]:
    return (
        db.query(EventResult)
        .filter(EventResult.event_id == event_id)
        .order_by(EventResult.event_category_id.asc())
        .all()
    )

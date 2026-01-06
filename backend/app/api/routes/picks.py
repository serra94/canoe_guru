from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models import Event, EventAthlete, EventCategory, UserPick
from app.schemas import UserPickCreate, UserPickOut

router = APIRouter(prefix="/events/{event_id}/categories/{category_id}/picks", tags=["picks"])

DEFAULT_DARK_HORSE_MIN_RANK = 11


def _get_dark_horse_min_rank(event: Event, category: EventCategory) -> Optional[int]:
    if category.dark_horse_min_rank is not None:
        return category.dark_horse_min_rank
    if event.is_official:
        return DEFAULT_DARK_HORSE_MIN_RANK
    return None


def _validate_dark_horse(
    db: Session,
    event: Event,
    category: EventCategory,
    dark_horse_id: str,
) -> None:
    min_rank = _get_dark_horse_min_rank(event, category)
    if min_rank is None:
        return

    athlete = (
        db.query(EventAthlete)
        .filter(
            EventAthlete.id == dark_horse_id,
            EventAthlete.event_id == event.id,
            EventAthlete.event_category_id == category.id,
        )
        .first()
    )
    if not athlete:
        raise HTTPException(status_code=400, detail="Dark horse athlete not found")
    if athlete.ranking_position is None or athlete.ranking_position < min_rank:
        raise HTTPException(status_code=400, detail="Dark horse athlete is not eligible")


@router.post("", response_model=UserPickOut)
def upsert_pick(
    event_id: str,
    category_id: str,
    payload: UserPickCreate,
    db: Session = Depends(get_db),
) -> UserPickOut:
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    category = (
        db.query(EventCategory)
        .filter(EventCategory.id == category_id, EventCategory.event_id == event_id)
        .first()
    )
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    athlete_ids = {
        payload.first_athlete_id,
        payload.second_athlete_id,
        payload.third_athlete_id,
        payload.dark_horse_athlete_id,
    }
    athletes = (
        db.query(EventAthlete)
        .filter(
            EventAthlete.event_id == event_id,
            EventAthlete.event_category_id == category_id,
            EventAthlete.id.in_(athlete_ids),
        )
        .all()
    )
    if len(athletes) != len(athlete_ids):
        raise HTTPException(status_code=400, detail="Invalid athlete selection")

    _validate_dark_horse(db, event, category, str(payload.dark_horse_athlete_id))

    existing = (
        db.query(UserPick)
        .filter(
            UserPick.user_id == payload.user_id,
            UserPick.event_id == event_id,
            UserPick.event_category_id == category_id,
        )
        .first()
    )
    if existing:
        existing.first_athlete_id = payload.first_athlete_id
        existing.second_athlete_id = payload.second_athlete_id
        existing.third_athlete_id = payload.third_athlete_id
        existing.dark_horse_athlete_id = payload.dark_horse_athlete_id
        db.add(existing)
        db.commit()
        db.refresh(existing)
        return existing

    pick = UserPick(
        user_id=payload.user_id,
        event_id=event_id,
        event_category_id=category_id,
        first_athlete_id=payload.first_athlete_id,
        second_athlete_id=payload.second_athlete_id,
        third_athlete_id=payload.third_athlete_id,
        dark_horse_athlete_id=payload.dark_horse_athlete_id,
    )
    db.add(pick)
    db.commit()
    db.refresh(pick)
    return pick


@router.get("", response_model=List[UserPickOut])
def list_picks(
    event_id: str,
    category_id: str,
    user_id: str,
    db: Session = Depends(get_db),
) -> List[UserPickOut]:
    return (
        db.query(UserPick)
        .filter(
            UserPick.user_id == user_id,
            UserPick.event_id == event_id,
            UserPick.event_category_id == category_id,
        )
        .all()
    )

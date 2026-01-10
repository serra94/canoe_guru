from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models import (
    Event,
    EventAthlete,
    EventCategory,
    EventResult,
    EventResultValidation,
    GroupEventScore,
    UserEventScore,
    UserPick,
)
from app.schemas import (
    EventAdminCreate,
    EventAdminUpdate,
    EventAthleteCreate,
    EventAthleteOut,
    EventAthleteUpdate,
    EventCategoryCreate,
    EventCategoryOut,
    EventCategoryUpdate,
    EventOut,
    StartlistImportRequest,
    StartlistImportIssue,
    StartlistImportResponse,
)
from app.services.startlist_import import StartlistIssue, decode_base64, parse_startlist

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/events", response_model=List[EventOut])
def list_events(db: Session = Depends(get_db)) -> List[EventOut]:
    return db.query(Event).order_by(Event.created_at.desc()).all()


@router.post("/events", response_model=EventOut)
def create_event(payload: EventAdminCreate, db: Session = Depends(get_db)) -> EventOut:
    event = Event(
        name=payload.name,
        starts_at=payload.starts_at,
        status=payload.status or "draft",
        is_official=payload.is_official,
        visibility=payload.visibility,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.patch("/events/{event_id}", response_model=EventOut)
def update_event(event_id: str, payload: EventAdminUpdate, db: Session = Depends(get_db)) -> EventOut:
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(event, field, value)
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.delete("/events/{event_id}")
def delete_event(event_id: str, db: Session = Depends(get_db)) -> dict:
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    try:
        db.query(EventResultValidation).filter(
            EventResultValidation.event_result_id.in_(
                db.query(EventResult.id).filter(EventResult.event_id == event_id)
            )
        ).delete(synchronize_session=False)
        db.query(EventResult).filter(EventResult.event_id == event_id).delete(synchronize_session=False)
        db.query(UserPick).filter(UserPick.event_id == event_id).delete(synchronize_session=False)
        db.query(EventAthlete).filter(EventAthlete.event_id == event_id).delete(synchronize_session=False)
        db.query(EventCategory).filter(EventCategory.event_id == event_id).delete(synchronize_session=False)
        db.query(UserEventScore).filter(UserEventScore.event_id == event_id).delete(synchronize_session=False)
        db.query(GroupEventScore).filter(GroupEventScore.event_id == event_id).delete(synchronize_session=False)
        db.delete(event)
        db.commit()
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete event") from exc
    return {"status": "deleted"}


@router.get("/events/{event_id}/categories", response_model=List[EventCategoryOut])
def list_event_categories(event_id: str, db: Session = Depends(get_db)) -> List[EventCategoryOut]:
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return (
        db.query(EventCategory)
        .filter(EventCategory.event_id == event_id)
        .order_by(EventCategory.name.asc())
        .all()
    )


@router.post("/events/{event_id}/categories", response_model=EventCategoryOut)
def create_event_category(
    event_id: str,
    payload: EventCategoryCreate,
    db: Session = Depends(get_db),
) -> EventCategoryOut:
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    category = EventCategory(
        event_id=event_id,
        name=payload.name,
        name_en=payload.name_en,
        is_active=payload.is_active,
        dark_horse_min_rank=payload.dark_horse_min_rank,
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.patch("/events/{event_id}/categories/{category_id}", response_model=EventCategoryOut)
def update_event_category(
    event_id: str,
    category_id: str,
    payload: EventCategoryUpdate,
    db: Session = Depends(get_db),
) -> EventCategoryOut:
    category = (
        db.query(EventCategory)
        .filter(EventCategory.id == category_id, EventCategory.event_id == event_id)
        .first()
    )
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    updates = payload.model_dump(exclude_unset=True)
    if updates.get("is_active"):
        issues = _validate_category(db, category)
        if issues:
            raise HTTPException(
                status_code=400,
                detail=[issue.__dict__ for issue in issues],
            )

    for field, value in updates.items():
        setattr(category, field, value)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.delete("/events/{event_id}/categories/{category_id}")
def delete_event_category(
    event_id: str,
    category_id: str,
    db: Session = Depends(get_db),
) -> dict:
    category = (
        db.query(EventCategory)
        .filter(EventCategory.id == category_id, EventCategory.event_id == event_id)
        .first()
    )
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    try:
        db.query(EventResultValidation).filter(
            EventResultValidation.event_result_id.in_(
                db.query(EventResult.id).filter(
                    EventResult.event_id == event_id,
                    EventResult.event_category_id == category_id,
                )
            )
        ).delete(synchronize_session=False)
        db.query(EventResult).filter(
            EventResult.event_id == event_id,
            EventResult.event_category_id == category_id,
        ).delete(synchronize_session=False)
        db.query(UserPick).filter(
            UserPick.event_id == event_id,
            UserPick.event_category_id == category_id,
        ).delete(synchronize_session=False)
        db.query(EventAthlete).filter(
            EventAthlete.event_id == event_id,
            EventAthlete.event_category_id == category_id,
        ).delete(synchronize_session=False)
        db.delete(category)
        db.commit()
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete category") from exc
    return {"status": "deleted"}


@router.post("/events/{event_id}/categories/{category_id}/startlist", response_model=StartlistImportResponse)
def import_startlist(
    event_id: str,
    category_id: str,
    payload: StartlistImportRequest,
    db: Session = Depends(get_db),
) -> StartlistImportResponse:
    category = (
        db.query(EventCategory)
        .filter(EventCategory.id == category_id, EventCategory.event_id == event_id)
        .first()
    )
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    content = decode_base64(payload.content_base64)
    try:
        rows, issues = parse_startlist(payload.filename, content, payload.content_type)
    except (ValueError, RuntimeError) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    if payload.replace_existing:
        db.query(EventAthlete).filter(
            EventAthlete.event_id == event_id,
            EventAthlete.event_category_id == category_id,
        ).delete()

    inserted = 0
    for row in rows:
        if not row.name or not row.country_code:
            continue
        athlete = EventAthlete(
            event_id=event_id,
            event_category_id=category_id,
            name=row.name,
            country_code=row.country_code,
            ranking_position=row.ranking_position,
        )
        db.add(athlete)
        inserted += 1

    db.commit()
    return StartlistImportResponse(
        total_rows=len(rows),
        inserted_rows=inserted,
        issues=[_issue_to_schema(issue) for issue in issues],
    )


@router.get(
    "/events/{event_id}/categories/{category_id}/athletes",
    response_model=List[EventAthleteOut],
)
def list_category_athletes(
    event_id: str, category_id: str, db: Session = Depends(get_db)
) -> List[EventAthleteOut]:
    return (
        db.query(EventAthlete)
        .filter(EventAthlete.event_id == event_id, EventAthlete.event_category_id == category_id)
        .order_by(EventAthlete.ranking_position.asc().nulls_last(), EventAthlete.name.asc())
        .all()
    )


@router.post(
    "/events/{event_id}/categories/{category_id}/athletes",
    response_model=EventAthleteOut,
)
def create_category_athlete(
    event_id: str,
    category_id: str,
    payload: EventAthleteCreate,
    db: Session = Depends(get_db),
) -> EventAthleteOut:
    category = (
        db.query(EventCategory)
        .filter(EventCategory.id == category_id, EventCategory.event_id == event_id)
        .first()
    )
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    athlete = EventAthlete(
        event_id=event_id,
        event_category_id=category_id,
        name=payload.name.strip(),
        country_code=payload.country_code.strip().upper(),
        ranking_position=payload.ranking_position,
    )
    db.add(athlete)
    db.commit()
    db.refresh(athlete)
    return athlete


@router.patch(
    "/events/{event_id}/categories/{category_id}/athletes/{athlete_id}",
    response_model=EventAthleteOut,
)
def update_category_athlete(
    event_id: str,
    category_id: str,
    athlete_id: str,
    payload: EventAthleteUpdate,
    db: Session = Depends(get_db),
) -> EventAthleteOut:
    athlete = (
        db.query(EventAthlete)
        .filter(
            EventAthlete.id == athlete_id,
            EventAthlete.event_id == event_id,
            EventAthlete.event_category_id == category_id,
        )
        .first()
    )
    if not athlete:
        raise HTTPException(status_code=404, detail="Athlete not found")

    updates = payload.model_dump(exclude_unset=True)
    if "name" in updates and updates["name"] is not None:
        athlete.name = updates["name"].strip()
    if "country_code" in updates and updates["country_code"] is not None:
        athlete.country_code = updates["country_code"].strip().upper()
    if "ranking_position" in updates:
        if updates["ranking_position"] is None:
            raise HTTPException(status_code=400, detail="Ranking is required")
        athlete.ranking_position = updates["ranking_position"]

    db.add(athlete)
    db.commit()
    db.refresh(athlete)
    return athlete


@router.delete("/events/{event_id}/categories/{category_id}/athletes/{athlete_id}")
def delete_category_athlete(
    event_id: str,
    category_id: str,
    athlete_id: str,
    db: Session = Depends(get_db),
) -> dict:
    athlete = (
        db.query(EventAthlete)
        .filter(
            EventAthlete.id == athlete_id,
            EventAthlete.event_id == event_id,
            EventAthlete.event_category_id == category_id,
        )
        .first()
    )
    if not athlete:
        raise HTTPException(status_code=404, detail="Athlete not found")
    db.delete(athlete)
    db.commit()
    return {"status": "deleted"}


@router.get("/events/{event_id}/categories/{category_id}/validate")
def validate_category(
    event_id: str, category_id: str, db: Session = Depends(get_db)
) -> dict:
    category = (
        db.query(EventCategory)
        .filter(EventCategory.id == category_id, EventCategory.event_id == event_id)
        .first()
    )
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    issues = _validate_category(db, category)
    return {"issues": [issue.__dict__ for issue in issues]}


def _validate_category(db: Session, category: EventCategory) -> List[StartlistIssue]:
    issues: List[StartlistIssue] = []
    athletes = (
        db.query(EventAthlete)
        .filter(EventAthlete.event_category_id == category.id)
        .all()
    )
    seen = set()
    for idx, athlete in enumerate(athletes, start=1):
        if not athlete.name:
            issues.append(StartlistIssue(idx, "name", "Missing athlete name.", ""))
        if not athlete.country_code:
            issues.append(StartlistIssue(idx, "country_code", "Missing country code.", ""))
        elif len(athlete.country_code) != 3:
            issues.append(StartlistIssue(idx, "country_code", "Country code must have 3 letters.", ""))
        if athlete.ranking_position is None:
            issues.append(StartlistIssue(idx, "ranking_position", "Missing ICF world ranking.", ""))
        key = (athlete.name.lower(), athlete.country_code.upper(), athlete.ranking_position)
        if key in seen:
            issues.append(StartlistIssue(idx, "duplicate", "Duplicate athlete row.", ""))
        seen.add(key)
    return issues


def _issue_to_schema(issue: StartlistIssue) -> StartlistImportIssue:
    return StartlistImportIssue(
        row_index=issue.row_index,
        field=issue.field,
        message=issue.message,
        source_line=issue.source_line,
    )

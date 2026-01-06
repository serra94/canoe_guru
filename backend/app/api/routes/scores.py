from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models import GroupEventScore, UserEventScore
from app.schemas import GroupEventScoreOut, UserEventScoreOut

router = APIRouter(tags=["scores"])


@router.get("/events/{event_id}/scores", response_model=List[UserEventScoreOut])
def list_event_scores(event_id: str, db: Session = Depends(get_db)) -> List[UserEventScoreOut]:
    return (
        db.query(UserEventScore)
        .filter(UserEventScore.event_id == event_id)
        .order_by(UserEventScore.points_total.desc())
        .all()
    )


@router.get(
    "/groups/{group_id}/events/{event_id}/scores",
    response_model=List[GroupEventScoreOut],
)
def list_group_event_scores(group_id: str, event_id: str, db: Session = Depends(get_db)) -> List[GroupEventScoreOut]:
    return (
        db.query(GroupEventScore)
        .filter(GroupEventScore.group_id == group_id, GroupEventScore.event_id == event_id)
        .order_by(GroupEventScore.points_total.desc())
        .all()
    )

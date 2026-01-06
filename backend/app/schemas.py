import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: Optional[str] = None
    display_name: str


class EventOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    starts_at: Optional[datetime] = None
    is_official: bool
    status: str


class EventCategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    event_id: uuid.UUID
    name: str
    is_active: bool
    dark_horse_min_rank: Optional[int] = None


class EventAthleteOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    event_id: uuid.UUID
    event_category_id: uuid.UUID
    name: str
    country_code: str
    ranking_position: Optional[int] = None


class EventResultOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    event_id: uuid.UUID
    event_category_id: uuid.UUID
    first_athlete_id: uuid.UUID
    second_athlete_id: uuid.UUID
    third_athlete_id: uuid.UUID
    dark_horse_athlete_id: uuid.UUID
    status: str


class UserPickCreate(BaseModel):
    user_id: uuid.UUID
    first_athlete_id: uuid.UUID
    second_athlete_id: uuid.UUID
    third_athlete_id: uuid.UUID
    dark_horse_athlete_id: uuid.UUID


class UserPickOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    event_id: uuid.UUID
    event_category_id: uuid.UUID
    first_athlete_id: uuid.UUID
    second_athlete_id: uuid.UUID
    third_athlete_id: uuid.UUID
    dark_horse_athlete_id: uuid.UUID


class UserEventScoreOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: uuid.UUID
    event_id: uuid.UUID
    points_total: int
    rank_position: Optional[int] = None


class GroupEventScoreOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    group_id: uuid.UUID
    user_id: uuid.UUID
    event_id: uuid.UUID
    points_total: int
    rank_position: Optional[int] = None

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
    visibility: Optional[str] = None


class EventAdminCreate(BaseModel):
    name: str
    starts_at: Optional[datetime] = None
    status: Optional[str] = None
    is_official: bool = False
    visibility: str = "public"


class EventAdminUpdate(BaseModel):
    name: Optional[str] = None
    starts_at: Optional[datetime] = None
    status: Optional[str] = None
    is_official: Optional[bool] = None
    visibility: Optional[str] = None


class EventCategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    event_id: uuid.UUID
    name: str
    name_en: Optional[str] = None
    is_active: bool
    dark_horse_min_rank: Optional[int] = None


class EventCategoryCreate(BaseModel):
    name: str
    name_en: Optional[str] = None
    is_active: bool = False
    dark_horse_min_rank: Optional[int] = None


class EventCategoryUpdate(BaseModel):
    name: Optional[str] = None
    name_en: Optional[str] = None
    is_active: Optional[bool] = None
    dark_horse_min_rank: Optional[int] = None


class EventAthleteOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    event_id: uuid.UUID
    event_category_id: uuid.UUID
    name: str
    country_code: str
    ranking_position: Optional[int] = None


class EventAthleteCreate(BaseModel):
    name: str
    country_code: str
    ranking_position: int


class EventAthleteUpdate(BaseModel):
    name: Optional[str] = None
    country_code: Optional[str] = None
    ranking_position: Optional[int] = None


class StartlistImportRequest(BaseModel):
    filename: str
    content_base64: str
    content_type: Optional[str] = None
    replace_existing: bool = True


class StartlistImportIssue(BaseModel):
    row_index: int
    field: str
    message: str
    source_line: str


class StartlistImportResponse(BaseModel):
    total_rows: int
    inserted_rows: int
    issues: List[StartlistImportIssue]


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

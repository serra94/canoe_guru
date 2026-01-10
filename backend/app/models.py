import uuid

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from .db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=True)
    display_name = Column(String(120), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    groups_owned = relationship("Group", back_populates="owner")


class Event(Base):
    __tablename__ = "events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    starts_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(32), nullable=False, default="draft")
    is_official = Column(Boolean, nullable=False, default=False)
    created_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    visibility = Column(String(16), nullable=False, default="public")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    categories = relationship("EventCategory", back_populates="event", cascade="all, delete-orphan")
    results = relationship("EventResult", back_populates="event", cascade="all, delete-orphan")


class EventCategory(Base):
    __tablename__ = "event_categories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(120), nullable=False)
    name_en = Column(String(120), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    dark_horse_min_rank = Column(Integer, nullable=True)

    event = relationship("Event", back_populates="categories")
    athletes = relationship("EventAthlete", back_populates="category", cascade="all, delete-orphan")

    __table_args__ = (UniqueConstraint("event_id", "name", name="uq_event_category_name"),)


class EventAthlete(Base):
    __tablename__ = "event_athletes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    event_category_id = Column(UUID(as_uuid=True), ForeignKey("event_categories.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(200), nullable=False)
    country_code = Column(String(3), nullable=False)
    ranking_position = Column(Integer, nullable=True)

    category = relationship("EventCategory", back_populates="athletes")

    __table_args__ = (
        UniqueConstraint(
            "event_id",
            "event_category_id",
            "name",
            "country_code",
            "ranking_position",
            name="uq_event_athlete_row",
        ),
    )


class EventResult(Base):
    __tablename__ = "event_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    event_category_id = Column(UUID(as_uuid=True), ForeignKey("event_categories.id", ondelete="CASCADE"), nullable=False)
    first_athlete_id = Column(UUID(as_uuid=True), ForeignKey("event_athletes.id"), nullable=False)
    second_athlete_id = Column(UUID(as_uuid=True), ForeignKey("event_athletes.id"), nullable=False)
    third_athlete_id = Column(UUID(as_uuid=True), ForeignKey("event_athletes.id"), nullable=False)
    dark_horse_athlete_id = Column(UUID(as_uuid=True), ForeignKey("event_athletes.id"), nullable=False)
    status = Column(String(24), nullable=False, default="pending")
    created_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    validation_deadline = Column(DateTime(timezone=True), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    event = relationship("Event", back_populates="results")
    validations = relationship("EventResultValidation", back_populates="result", cascade="all, delete-orphan")

    __table_args__ = (UniqueConstraint("event_id", "event_category_id", name="uq_event_result_category"),)


class EventResultValidation(Base):
    __tablename__ = "event_result_validations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_result_id = Column(UUID(as_uuid=True), ForeignKey("event_results.id", ondelete="CASCADE"), nullable=False)
    validator_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(24), nullable=False, default="pending")
    assigned_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    decided_at = Column(DateTime(timezone=True), nullable=True)

    result = relationship("EventResult", back_populates="validations")

    __table_args__ = (UniqueConstraint("event_result_id", "validator_user_id", name="uq_event_result_validator"),)


class Group(Base):
    __tablename__ = "groups"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(160), nullable=False)
    type = Column(String(16), nullable=False, default="public")
    owner_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    owner = relationship("User", back_populates="groups_owned")
    members = relationship("GroupMember", back_populates="group", cascade="all, delete-orphan")


class GroupMember(Base):
    __tablename__ = "group_members"

    group_id = Column(UUID(as_uuid=True), ForeignKey("groups.id", ondelete="CASCADE"), primary_key=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    role = Column(String(16), nullable=False, default="member")
    status = Column(String(16), nullable=False, default="active")
    joined_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    group = relationship("Group", back_populates="members")


class UserPick(Base):
    __tablename__ = "user_picks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    event_category_id = Column(UUID(as_uuid=True), ForeignKey("event_categories.id", ondelete="CASCADE"), nullable=False)
    first_athlete_id = Column(UUID(as_uuid=True), ForeignKey("event_athletes.id"), nullable=False)
    second_athlete_id = Column(UUID(as_uuid=True), ForeignKey("event_athletes.id"), nullable=False)
    third_athlete_id = Column(UUID(as_uuid=True), ForeignKey("event_athletes.id"), nullable=False)
    dark_horse_athlete_id = Column(UUID(as_uuid=True), ForeignKey("event_athletes.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (UniqueConstraint("user_id", "event_id", "event_category_id", name="uq_user_pick_per_category"),)


class UserEventScore(Base):
    __tablename__ = "user_event_scores"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    points_total = Column(Integer, nullable=False, default=0)
    rank_position = Column(Integer, nullable=True)
    calculated_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (UniqueConstraint("user_id", "event_id", name="uq_user_event_score"),)


class GroupEventScore(Base):
    __tablename__ = "group_event_scores"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    group_id = Column(UUID(as_uuid=True), ForeignKey("groups.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    points_total = Column(Integer, nullable=False, default=0)
    rank_position = Column(Integer, nullable=True)
    calculated_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (UniqueConstraint("group_id", "user_id", "event_id", name="uq_group_event_score"),)

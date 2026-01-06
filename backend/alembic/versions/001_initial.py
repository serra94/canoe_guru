"""initial schema

Revision ID: 001_initial
Revises:
Create Date: 2025-02-14 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("email", sa.String(length=255), nullable=True),
        sa.Column("display_name", sa.String(length=120), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.UniqueConstraint("email", name="users_email_key"),
    )

    op.create_table(
        "events",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("starts_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("is_official", sa.Boolean(), nullable=False),
        sa.Column("created_by_user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("visibility", sa.String(length=16), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["created_by_user_id"], ["users.id"], name="fk_events_created_by_user"),
    )

    op.create_table(
        "event_categories",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("event_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("dark_horse_min_rank", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["event_id"], ["events.id"], ondelete="CASCADE", name="fk_event_categories_event"),
        sa.UniqueConstraint("event_id", "name", name="uq_event_category_name"),
    )

    op.create_table(
        "event_athletes",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("event_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("event_category_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("country_code", sa.String(length=3), nullable=False),
        sa.Column("ranking_position", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["event_id"], ["events.id"], ondelete="CASCADE", name="fk_event_athletes_event"),
        sa.ForeignKeyConstraint(["event_category_id"], ["event_categories.id"], ondelete="CASCADE", name="fk_event_athletes_category"),
        sa.UniqueConstraint(
            "event_id",
            "event_category_id",
            "name",
            "country_code",
            "ranking_position",
            name="uq_event_athlete_row",
        ),
    )

    op.create_table(
        "event_results",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("event_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("event_category_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("first_athlete_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("second_athlete_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("third_athlete_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("dark_horse_athlete_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("status", sa.String(length=24), nullable=False),
        sa.Column("created_by_user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("validation_deadline", sa.DateTime(timezone=True), nullable=True),
        sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["event_id"], ["events.id"], ondelete="CASCADE", name="fk_event_results_event"),
        sa.ForeignKeyConstraint(["event_category_id"], ["event_categories.id"], ondelete="CASCADE", name="fk_event_results_category"),
        sa.ForeignKeyConstraint(["first_athlete_id"], ["event_athletes.id"], name="fk_event_results_first"),
        sa.ForeignKeyConstraint(["second_athlete_id"], ["event_athletes.id"], name="fk_event_results_second"),
        sa.ForeignKeyConstraint(["third_athlete_id"], ["event_athletes.id"], name="fk_event_results_third"),
        sa.ForeignKeyConstraint(["dark_horse_athlete_id"], ["event_athletes.id"], name="fk_event_results_dark_horse"),
        sa.ForeignKeyConstraint(["created_by_user_id"], ["users.id"], name="fk_event_results_created_by_user"),
        sa.UniqueConstraint("event_id", "event_category_id", name="uq_event_result_category"),
    )

    op.create_table(
        "event_result_validations",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("event_result_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("validator_user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("status", sa.String(length=24), nullable=False),
        sa.Column("assigned_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("decided_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["event_result_id"], ["event_results.id"], ondelete="CASCADE", name="fk_event_result_validations_result"),
        sa.ForeignKeyConstraint(["validator_user_id"], ["users.id"], ondelete="CASCADE", name="fk_event_result_validations_user"),
        sa.UniqueConstraint("event_result_id", "validator_user_id", name="uq_event_result_validator"),
    )

    op.create_table(
        "groups",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("type", sa.String(length=16), nullable=False),
        sa.Column("owner_user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["owner_user_id"], ["users.id"], name="fk_groups_owner"),
    )

    op.create_table(
        "group_members",
        sa.Column("group_id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("role", sa.String(length=16), nullable=False),
        sa.Column("status", sa.String(length=16), nullable=False),
        sa.Column("joined_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["group_id"], ["groups.id"], ondelete="CASCADE", name="fk_group_members_group"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE", name="fk_group_members_user"),
    )

    op.create_table(
        "user_picks",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("event_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("event_category_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("first_athlete_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("second_athlete_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("third_athlete_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("dark_horse_athlete_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE", name="fk_user_picks_user"),
        sa.ForeignKeyConstraint(["event_id"], ["events.id"], ondelete="CASCADE", name="fk_user_picks_event"),
        sa.ForeignKeyConstraint(["event_category_id"], ["event_categories.id"], ondelete="CASCADE", name="fk_user_picks_category"),
        sa.ForeignKeyConstraint(["first_athlete_id"], ["event_athletes.id"], name="fk_user_picks_first"),
        sa.ForeignKeyConstraint(["second_athlete_id"], ["event_athletes.id"], name="fk_user_picks_second"),
        sa.ForeignKeyConstraint(["third_athlete_id"], ["event_athletes.id"], name="fk_user_picks_third"),
        sa.ForeignKeyConstraint(["dark_horse_athlete_id"], ["event_athletes.id"], name="fk_user_picks_dark_horse"),
        sa.UniqueConstraint("user_id", "event_id", "event_category_id", name="uq_user_pick_per_category"),
    )

    op.create_table(
        "user_event_scores",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("event_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("points_total", sa.Integer(), nullable=False),
        sa.Column("rank_position", sa.Integer(), nullable=True),
        sa.Column("calculated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE", name="fk_user_event_scores_user"),
        sa.ForeignKeyConstraint(["event_id"], ["events.id"], ondelete="CASCADE", name="fk_user_event_scores_event"),
        sa.UniqueConstraint("user_id", "event_id", name="uq_user_event_score"),
    )

    op.create_table(
        "group_event_scores",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("group_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("event_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("points_total", sa.Integer(), nullable=False),
        sa.Column("rank_position", sa.Integer(), nullable=True),
        sa.Column("calculated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["group_id"], ["groups.id"], ondelete="CASCADE", name="fk_group_event_scores_group"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE", name="fk_group_event_scores_user"),
        sa.ForeignKeyConstraint(["event_id"], ["events.id"], ondelete="CASCADE", name="fk_group_event_scores_event"),
        sa.UniqueConstraint("group_id", "user_id", "event_id", name="uq_group_event_score"),
    )


def downgrade() -> None:
    op.drop_table("group_event_scores")
    op.drop_table("user_event_scores")
    op.drop_table("user_picks")
    op.drop_table("group_members")
    op.drop_table("groups")
    op.drop_table("event_result_validations")
    op.drop_table("event_results")
    op.drop_table("event_athletes")
    op.drop_table("event_categories")
    op.drop_table("events")
    op.drop_table("users")

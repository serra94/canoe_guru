"""add name_en to event_categories

Revision ID: 002_add_event_category_name_en
Revises: 001_initial
Create Date: 2025-01-10 12:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "002_add_event_category_name_en"
down_revision = "001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("event_categories", sa.Column("name_en", sa.String(length=120), nullable=True))


def downgrade() -> None:
    op.drop_column("event_categories", "name_en")

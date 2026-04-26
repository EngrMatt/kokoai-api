"""add color to categories

Revision ID: e0621434baec
Revises: bf0e4f38d943
Create Date: 2026-04-26 06:25:21.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e0621434baec'
down_revision: Union[str, None] = 'bf0e4f38d943'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add color column to categories table
    op.add_column('categories', sa.Column('color', sa.String(), nullable=True))


def downgrade() -> None:
    # Remove color column from categories table
    op.drop_column('categories', 'color')

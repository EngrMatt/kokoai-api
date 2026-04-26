"""alter table transactions_transactionRecord

Revision ID: bf0e4f38d943
Revises: 13eeaca9a9c0
Create Date: 2026-04-26 06:14:01.779718+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'bf0e4f38d943'
down_revision: Union[str, None] = '13eeaca9a9c0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Rename table from transactions to transaction_records
    op.rename_table('transactions', 'transaction_records')


def downgrade() -> None:
    # Rename table back from transaction_records to transactions
    op.rename_table('transaction_records', 'transactions')

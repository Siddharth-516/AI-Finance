"""init schema"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '0001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.execute('CREATE EXTENSION IF NOT EXISTS pg_trgm')
    op.create_table('users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.Text()), sa.Column('email', sa.Text(), nullable=False, unique=True),
        sa.Column('password_hash', sa.Text()), sa.Column('timezone', sa.Text()),
        sa.Column('currency', sa.Text(), server_default='INR'), sa.Column('income_range', sa.Text()),
        sa.Column('risk_level', sa.Text(), server_default='low'), sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()))
    op.create_table('accounts', sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True), sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id')), sa.Column('provider', sa.Text()), sa.Column('name', sa.Text()), sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()))
    op.create_table('transactions', sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True), sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id')), sa.Column('account_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('accounts.id'), nullable=True), sa.Column('txn_date', sa.Date(), nullable=False), sa.Column('amount', sa.Numeric(), nullable=False), sa.Column('currency', sa.Text(), nullable=False), sa.Column('merchant', sa.Text()), sa.Column('raw_text', sa.Text()), sa.Column('category', sa.Text()), sa.Column('category_confidence', sa.Numeric()), sa.Column('tags', postgresql.ARRAY(sa.Text())), sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()))
    op.create_index('ix_transactions_user_date', 'transactions', ['user_id', 'txn_date'])
    op.execute('CREATE INDEX ix_transactions_raw_text ON transactions USING gin (raw_text gin_trgm_ops)')
    op.create_table('categories', sa.Column('id', sa.Integer(), primary_key=True), sa.Column('name', sa.Text(), unique=True, nullable=False))
    op.create_table('models', sa.Column('id', sa.Integer(), primary_key=True), sa.Column('name', sa.Text()), sa.Column('type', sa.Text()), sa.Column('version', sa.Text()), sa.Column('metrics', postgresql.JSONB()), sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()))


def downgrade():
    op.drop_table('models'); op.drop_table('categories'); op.drop_index('ix_transactions_user_date', table_name='transactions'); op.execute('DROP INDEX IF EXISTS ix_transactions_raw_text'); op.drop_table('transactions'); op.drop_table('accounts'); op.drop_table('users')

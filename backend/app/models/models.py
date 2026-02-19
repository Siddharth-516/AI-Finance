"""Purpose: ORM models for core entities."""
# CODE OWNERSHIP: Backend Team
import uuid
from sqlalchemy import Date, DateTime, ForeignKey, Index, Numeric, String, Text, func, JSON
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class User(Base):
    __tablename__ = "users"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(Text)
    email: Mapped[str] = mapped_column(Text, unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(Text)
    timezone: Mapped[str] = mapped_column(Text, default="Asia/Kolkata")
    currency: Mapped[str] = mapped_column(Text, default="INR")
    income_range: Mapped[str] = mapped_column(Text, default="0-25000")
    risk_level: Mapped[str] = mapped_column(Text, default="low")
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Account(Base):
    __tablename__ = "accounts"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    provider: Mapped[str] = mapped_column(Text, default="manual")
    name: Mapped[str] = mapped_column(Text)
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Transaction(Base):
    __tablename__ = "transactions"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), index=True)
    account_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("accounts.id"), nullable=True)
    txn_date: Mapped[str] = mapped_column(Date, index=True)
    amount: Mapped[float] = mapped_column(Numeric)
    currency: Mapped[str] = mapped_column(String(8), default="INR")
    merchant: Mapped[str] = mapped_column(Text, nullable=True)
    raw_text: Mapped[str] = mapped_column(Text, nullable=True)
    category: Mapped[str] = mapped_column(Text, default="others")
    category_confidence: Mapped[float] = mapped_column(Numeric, default=0.0)
    tags: Mapped[list[str]] = mapped_column(ARRAY(Text), default=[])
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        Index("ix_transactions_user_date", "user_id", "txn_date"),
        Index("ix_transactions_raw_text", "raw_text", postgresql_using="gin", postgresql_ops={"raw_text": "gin_trgm_ops"}),
    )


class Category(Base):
    __tablename__ = "categories"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(Text, unique=True)


class ModelRegistry(Base):
    __tablename__ = "models"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(Text)
    type: Mapped[str] = mapped_column(Text)
    version: Mapped[str] = mapped_column(Text)
    metrics: Mapped[dict] = mapped_column(JSON)
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())

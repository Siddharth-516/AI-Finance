"""Purpose: API request/response models."""
from datetime import date
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=8)
    timezone: str = "Asia/Kolkata"
    currency: str = "INR"
    income_range: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str


class UserOut(BaseModel):
    name: str
    email: EmailStr
    timezone: str
    currency: str
    income_range: str
    risk_level: str


class TransactionIn(BaseModel):
    txn_date: date
    amount: float
    currency: str = "INR"
    merchant: Optional[str] = None
    category: str = "others"
    tags: list[str] = []
    notes: Optional[str] = None


class SMSImportRequest(BaseModel):
    items: list[str]
    consent: bool = False


class ChatRequest(BaseModel):
    message: str


class RiskQuizRequest(BaseModel):
    answers: list[int] = Field(min_length=10, max_length=10)

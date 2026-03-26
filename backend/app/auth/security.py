"""Purpose: authentication and token helpers."""
# CODE OWNERSHIP: Security Team
from datetime import datetime, timedelta, timezone
from jose import jwt
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(password, hashed)


def _create_token(subject: str, minutes: int, token_type: str) -> str:
    exp = datetime.now(timezone.utc) + timedelta(minutes=minutes)
    return jwt.encode({"sub": subject, "type": token_type, "exp": exp}, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def create_access_token(subject: str) -> str:
    return _create_token(subject, settings.access_token_minutes, "access")


def create_refresh_token(subject: str) -> str:
    return _create_token(subject, settings.refresh_token_minutes, "refresh")

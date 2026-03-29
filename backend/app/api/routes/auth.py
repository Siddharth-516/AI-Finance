from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.routes._legacy import _get_or_create_user, _issue_token_pair
from app.auth.deps import get_current_user
from app.auth.security import create_access_token, create_refresh_token
from app.core.config import settings
from app.db.session import get_db
from app.models.models import User
from app.schemas.schemas import GoogleLoginRequest
from app.services.google_oauth import verify_google_identity

router = APIRouter()


@router.post("/google")
async def google_login(payload: GoogleLoginRequest, db: AsyncSession = Depends(get_db)):
    try:
        identity = verify_google_identity(payload.id_token, payload.email, payload.name)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    if not identity.get("email"):
        raise HTTPException(status_code=400, detail="Google account did not provide email")

    user: User = await _get_or_create_user(db, identity["email"], identity.get("name", "Google User"), password_hash="oauth-google")
    token_pair = await _issue_token_pair(user.email)

    profile = {
        "name": user.name,
        "email": user.email,
        "timezone": user.timezone,
        "currency": user.currency,
        "income_range": user.income_range,
        "risk_level": user.risk_level,
    }

    return {
        "token": token_pair.access_token,
        "refresh_token": token_pair.refresh_token,
        "profile": profile,
    }


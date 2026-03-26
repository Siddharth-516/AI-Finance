"""Purpose: Google OAuth token verification utility with strict mode + optional dev fallback."""
from typing import Optional
from app.core.config import settings


def verify_google_identity(id_token_str: Optional[str], email: Optional[str], name: Optional[str]) -> dict:
    if id_token_str:
        from google.oauth2 import id_token
        from google.auth.transport import requests

        payload = id_token.verify_oauth2_token(id_token_str, requests.Request(), settings.google_client_id)
        return {
            "email": payload.get("email"),
            "name": payload.get("name") or payload.get("given_name") or "Google User",
            "mode": "google_verified",
        }

    if settings.allow_dev_google_fallback and email:
        return {"email": email, "name": name or "Demo Google User", "mode": "dev_fallback"}

    raise ValueError("Google id_token required (dev fallback disabled)")

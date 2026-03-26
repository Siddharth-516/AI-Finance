"""Purpose: Google OAuth token verification utility with dev fallback."""
from typing import Optional
from app.core.config import settings


def verify_google_identity(id_token_str: Optional[str], email: Optional[str], name: Optional[str]) -> dict:
    if id_token_str:
        try:
            from google.oauth2 import id_token
            from google.auth.transport import requests

            payload = id_token.verify_oauth2_token(id_token_str, requests.Request(), settings.google_client_id)
            return {"email": payload.get("email"), "name": payload.get("name") or payload.get("given_name") or "Google User"}
        except Exception:
            pass

    if email:
        return {"email": email, "name": name or "Demo Google User"}

    raise ValueError("Unable to verify Google login payload")

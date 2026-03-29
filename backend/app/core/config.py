"""Purpose: application settings loaded from environment variables."""
# CODE OWNERSHIP: Platform Team

from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE = BASE_DIR / ".env"


class Settings(BaseSettings):
    app_name: str = "AI Financial Companion"
    api_prefix: str = "/api/v1"

    jwt_secret: str = "dev-secret"
    jwt_algorithm: str = "HS256"
    access_token_minutes: int = 30
    refresh_token_minutes: int = 60 * 24 * 7

    database_url: str = "sqlite+aiosqlite:///./aifinance.db"
    redis_url: str = "redis://redis:6379/0"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    google_client_id: str = ""
    allow_dev_google_fallback: bool = False
    allow_guest_login: bool = True

    deepseek_api_key: str = ""
    deepseek_base_url: str = "https://api.deepseek.com"
    deepseek_model: str = "deepseek-chat"

    openai_api_key: str = ""
    openai_model: str = "gpt-4.1-mini"

    encryption_key: str = "0123456789abcdef0123456789abcdef"
    rate_limit_per_minute: int = 120
    educational_disclaimer: str = (
        "EDUCATIONAL_ONLY: This application provides educational information and is not financial advice. "
        "Consult a certified financial advisor before making investment decisions."
    )

    model_config = SettingsConfigDict(env_file=ENV_FILE, extra="ignore")


settings = Settings()

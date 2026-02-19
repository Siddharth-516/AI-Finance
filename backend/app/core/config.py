"""Purpose: application settings loaded from environment variables."""
# CODE OWNERSHIP: Platform Team
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "AI Financial Companion"
    api_prefix: str = "/api/v1"
    jwt_secret: str = "dev-secret"
    jwt_algorithm: str = "HS256"
    access_token_minutes: int = 30
    refresh_token_minutes: int = 60 * 24 * 7
    database_url: str = "postgresql+asyncpg://postgres:postgres@postgres:5432/aifinance"
    redis_url: str = "redis://redis:6379/0"
    cors_origins: str = "http://localhost:5173"
    openai_api_key: str = ""
    encryption_key: str = "0123456789abcdef0123456789abcdef"
    rate_limit_per_minute: int = 120
    educational_disclaimer: str = (
        "EDUCATIONAL_ONLY: This application provides educational information and is not financial advice. "
        "Consult a certified financial advisor before making investment decisions."
    )

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()

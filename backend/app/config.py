import secrets
import sys

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "sqlite+aiosqlite:///./riskradar.db"
    secret_key: str = ""
    hibp_api_key: str = ""
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173,https://cole-giardina.github.io"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]


settings = Settings()

if not settings.secret_key:
    settings.secret_key = secrets.token_hex(32)
    print(
        "WARNING: No SECRET_KEY set. Using a random ephemeral key — "
        "sessions will not persist across restarts. "
        "Set SECRET_KEY in .env for production.",
        file=sys.stderr,
    )

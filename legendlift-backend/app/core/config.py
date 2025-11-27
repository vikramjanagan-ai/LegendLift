from typing import List, Union, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, validator


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore"
    )

    # API Configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "LegendLift API"
    DEBUG: bool = True

    # Database Configuration
    DATABASE_URL: str

    # JWT Configuration
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS Configuration
    cors_origins_str: Optional[str] = Field(None, alias="BACKEND_CORS_ORIGINS")

    @property
    def BACKEND_CORS_ORIGINS(self) -> List[str]:
        if not self.cors_origins_str:
            return []
        # Handle comma-separated format
        origins = [i.strip() for i in self.cors_origins_str.split(",") if i.strip()]
        return origins

    # Admin Configuration
    FIRST_SUPERUSER_EMAIL: str
    FIRST_SUPERUSER_PASSWORD: str


settings = Settings()

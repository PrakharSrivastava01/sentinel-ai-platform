# app/core/config.py

# app/core/config.py

from pydantic_settings import BaseSettings
from pydantic import ConfigDict

class Settings(BaseSettings):
    APP_NAME: str = "SentinelAI"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"
    PORT: int = 8000

    # Frontend
    FRONTEND_PORT: int = 5173

    # Grafana
    GRAFANA_ADMIN_USER: str = "admin"
    GRAFANA_ADMIN_PASSWORD: str = ""

    model_config = ConfigDict(env_file=".env")

settings = Settings()

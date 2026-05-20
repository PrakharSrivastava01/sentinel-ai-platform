# app/models/schemas.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class HealthResponse(BaseModel):
    status: str
    app: str
    version: str
    environment: str

class StatusResponse(BaseModel):
    status: str
    uptime_seconds: float
    timestamp: str

class Alert(BaseModel):
    id: str
    severity: str  # critical / warning / info
    message: str
    source: str
    timestamp: str

class AlertsResponse(BaseModel):
    total: int
    alerts: list[Alert]

class RecommendationResponse(BaseModel):
    alert_id: Optional[str]
    recommendation: str
    confidence: str
    generated_at: str

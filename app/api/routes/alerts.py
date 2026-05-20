from fastapi import APIRouter
from app.models.schemas import AlertsResponse
from app.services.alert_service import get_mock_alerts

router = APIRouter()

@router.get("/alerts", response_model=AlertsResponse)
def get_alerts():
    alerts = get_mock_alerts()
    return AlertsResponse(total=len(alerts), alerts=alerts)

# app/services/alert_service.py
from app.models.schemas import Alert
from datetime import datetime, timezone

def get_mock_alerts() -> list[Alert]:
    return [
        Alert(
            id="alert-001",
            severity="critical",
            message="CPU usage exceeded 90% on node worker-1",
            source="prometheus",
            timestamp=datetime.now(timezone.utc).isoformat()
        ),
        Alert(
            id="alert-002",
            severity="warning",
            message="Memory usage at 75% on pod sentinelai-api",
            source="prometheus",
            timestamp=datetime.now(timezone.utc).isoformat()
        ),
        Alert(
            id="alert-003",
            severity="info",
            message="Deployment sentinelai rolled out successfully",
            source="kubernetes",
            timestamp=datetime.now(timezone.utc).isoformat()
        ),
    ]

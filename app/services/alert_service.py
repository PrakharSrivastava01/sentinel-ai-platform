# app/services/alert_service.py
import psutil
from app.models.schemas import Alert
from datetime import datetime, timezone


def get_real_alerts() -> list[Alert]:
    alerts = []
    now = datetime.now(timezone.utc).isoformat()

    cpu = psutil.cpu_percent()
    memory = psutil.virtual_memory().percent

    if cpu > 80:
        alerts.append(Alert(
            id="alert-cpu-critical",
            severity="critical",
            message=f"CPU usage at {cpu:.1f}% — exceeds 80% threshold",
            source="sentinelai-detector",
            timestamp=now,
        ))
    elif cpu > 60:
        alerts.append(Alert(
            id="alert-cpu-warning",
            severity="warning",
            message=f"CPU usage at {cpu:.1f}% — approaching threshold",
            source="sentinelai-detector",
            timestamp=now,
        ))

    if memory > 85:
        alerts.append(Alert(
            id="alert-memory-critical",
            severity="critical",
            message=f"Memory usage at {memory:.1f}% — exceeds 85% threshold",
            source="sentinelai-detector",
            timestamp=now,
        ))
    elif memory > 70:
        alerts.append(Alert(
            id="alert-memory-warning",
            severity="warning",
            message=f"Memory usage at {memory:.1f}% — approaching threshold",
            source="sentinelai-detector",
            timestamp=now,
        ))

    if not alerts:
        alerts.append(Alert(
            id="alert-info-healthy",
            severity="info",
            message=f"All systems healthy. CPU: {cpu:.1f}%, Memory: {memory:.1f}%",
            source="sentinelai-detector",
            timestamp=now,
        ))

    return alerts


def get_mock_alerts() -> list[Alert]:
    return get_real_alerts()

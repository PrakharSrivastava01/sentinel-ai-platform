import psutil
import uuid
from app.models.schemas import Alert
from datetime import datetime, timezone


def get_real_alerts() -> list[Alert]:
    alerts = []
    now = datetime.now(timezone.utc).isoformat()
    cpu = psutil.cpu_percent(interval=0.1)
    memory = psutil.virtual_memory().percent

    if cpu > 80:
        alerts.append(Alert(
            id=f"alert-cpu-critical-{uuid.uuid4().hex[:8]}",
            severity="critical",
            message=f"CPU usage at {cpu:.1f}% — exceeds 80% threshold",
            source="sentinelai-detector",
            timestamp=now,
        ))
    elif cpu > 60:
        alerts.append(Alert(
            id=f"alert-cpu-warning-{uuid.uuid4().hex[:8]}",
            severity="warning",
            message=f"CPU usage at {cpu:.1f}% — approaching threshold",
            source="sentinelai-detector",
            timestamp=now,
        ))

    if memory > 85:
        alerts.append(Alert(
            id=f"alert-memory-critical-{uuid.uuid4().hex[:8]}",
            severity="critical",
            message=f"Memory usage at {memory:.1f}% — exceeds 85% threshold",
            source="sentinelai-detector",
            timestamp=now,
        ))
    elif memory > 70:
        alerts.append(Alert(
            id=f"alert-memory-warning-{uuid.uuid4().hex[:8]}",
            severity="warning",
            message=f"Memory usage at {memory:.1f}% — approaching threshold",
            source="sentinelai-detector",
            timestamp=now,
        ))

    if not alerts:
        alerts.append(Alert(
            id=f"alert-info-healthy-{uuid.uuid4().hex[:8]}",
            severity="info",
            message=f"All systems healthy. CPU: {cpu:.1f}%, Memory: {memory:.1f}%",
            source="sentinelai-detector",
            timestamp=now,
        ))

    return alerts

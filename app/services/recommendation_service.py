# app/services/recommendation_service.py
import psutil
from datetime import datetime, timezone
from app.models.schemas import RecommendationResponse
from app.services.anomaly_detector import detector


def build_recommendation(result: dict, cpu: float, memory: float) -> str:
    if result["warming_up"]:
        return "System is collecting baseline metrics. Check back in a few seconds."

    if not result["anomaly_detected"]:
        return (
            f"All systems normal. CPU at {cpu:.1f}%, memory at {memory:.1f}%. "
            f"No anomalies detected against {20}-reading baseline."
        )

    parts = []

    if abs(result["cpu_score"]) > 2.0:
        parts.append(
            f"CPU anomaly detected (Z-score: {result['cpu_score']}). "
            f"Current usage {cpu:.1f}% is significantly above baseline. "
            f"Consider checking for runaway processes or triggering HPA scale-up."
        )

    if abs(result["memory_score"]) > 2.0:
        parts.append(
            f"Memory anomaly detected (Z-score: {result['memory_score']}). "
            f"Current usage {memory:.1f}% is above baseline. "
            f"Check for memory leaks or increase pod memory limits."
        )

    return " | ".join(parts)


def get_recommendation(alert_id: str = None) -> RecommendationResponse:
    cpu = psutil.cpu_percent()
    memory = psutil.virtual_memory().percent

    result = detector.analyze(cpu, memory)

    recommendation = build_recommendation(result, cpu, memory)

    return RecommendationResponse(
        alert_id=alert_id,
        recommendation=recommendation,
        confidence=result["confidence"],
        anomaly_detected=result["anomaly_detected"],
        anomaly_score=max(abs(result["cpu_score"]), abs(result["memory_score"])),
        generated_at=datetime.now(timezone.utc).isoformat(),
    )

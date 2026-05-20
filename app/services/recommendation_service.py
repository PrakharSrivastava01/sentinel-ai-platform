# app/services/recommendation_service.py
from app.models.schemas import RecommendationResponse
from datetime import datetime, timezone

def get_recommendation(alert_id: str = None) -> RecommendationResponse:
    recommendations = {
        "alert-001": "Scale up worker nodes or optimize CPU-intensive workloads. Consider HPA.",
        "alert-002": "Review memory limits on pod spec. Check for memory leaks in application.",
        "alert-003": "No action needed. Monitor rollout for 10 minutes post-deployment.",
    }

    message = recommendations.get(
        alert_id,
        "No specific recommendation available. Review logs and metrics for context."
    )

    return RecommendationResponse(
        alert_id=alert_id,
        recommendation=message,
        confidence="medium",
        generated_at=datetime.now(timezone.utc).isoformat()
    )

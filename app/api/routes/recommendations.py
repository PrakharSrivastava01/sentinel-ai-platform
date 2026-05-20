from fastapi import APIRouter
from app.models.schemas import RecommendationResponse
from app.services.recommendation_service import get_recommendation
from typing import Optional

router = APIRouter()

@router.get("/recommendation", response_model=RecommendationResponse)
def get_recommendation_endpoint(alert_id: Optional[str] = None):
    return get_recommendation(alert_id)

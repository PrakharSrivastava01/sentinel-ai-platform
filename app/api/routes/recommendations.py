# app/api/routes/recommendations.py
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from app.models.schemas import RecommendationResponse
from app.services.recommendation_service import get_recommendation
from typing import Optional

router = APIRouter()

@router.get("/recommendation")
def get_recommendation_endpoint(alert_id: Optional[str] = None):
    result: RecommendationResponse = get_recommendation(alert_id)
    return JSONResponse(content=result.model_dump())

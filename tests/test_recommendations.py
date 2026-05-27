# tests/test_recommendations.py
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_recommendations_status_code():
    response = client.get("/recommendation")
    assert response.status_code == 200

def test_recommendations_field_exists():
    response = client.get("/recommendation")
    assert "recommendation" in response.json()

def test_recommendations_confidence():
    response = client.get("/recommendation")
    assert "confidence" in response.json()

def test_recommendations_generated_at():
    response = client.get("/recommendation")
    assert "generated_at" in response.json()

def test_recommendations_alert_id():
    response = client.get("/recommendation")
    assert "alert_id" in response.json()

def test_recommendations_anomaly_detected_field():
    response = client.get("/recommendation")
    assert "anomaly_detected" in response.json()
    assert isinstance(response.json()["anomaly_detected"], bool)

def test_recommendations_anomaly_score_field():
    response = client.get("/recommendation")
    assert "anomaly_score" in response.json()
    assert isinstance(response.json()["anomaly_score"], float)

def test_recommendations_confidence_valid_value():
    response = client.get("/recommendation")
    assert response.json()["confidence"] in ["low", "medium", "high"]

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_status_code():
    response = client.get("/health")
    assert response.status_code == 200

def test_health_status_value():
    response = client.get("/health")
    assert response.json()["status"] == "healthy"

def test_health_app():
    response = client.get("/health")
    assert response.json()["app"] == "SentinelAI"

def test_health_version():
    response = client.get("/health")
    assert response.json()["version"] == "1.0.0"

def test_health_environment():
    response = client.get("/health")
    assert response.json()["environment"] == "development"


from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_status_code():
    response = client.get("/status")
    assert response.status_code == 200

def test_status_running():
    response = client.get("/status")
    assert response.json()["status"] == "running"

def test_status_uptime_exists():
    response = client.get("/status")
    assert "uptime_seconds" in response.json()

def test_status_timestamp_exists():
    response = client.get("/status")
    assert "timestamp" in response.json()

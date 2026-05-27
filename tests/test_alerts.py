from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_alert_status_code():
    response = client.get("/alerts")
    assert response.status_code == 200

def test_alerts_is_list():
    response = client.get("/alerts")
    assert isinstance(response.json()["alerts"], list)

def test_alerts_total():
    response = client.get("/alerts")
    assert response.json()["total"] >= 1

def test_alerts_total_exists():
    response = client.get("/alerts")
    assert "total" in response.json()

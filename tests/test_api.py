from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_all_endpoints_reachable():
    for path in ["/health", "/status", "/alerts", "/recommendation"]:
        res = client.get(path)
        assert res.status_code == 200

def test_response_content_type():
    res = client.get("/health")
    assert res.headers["content-type"] == "application/json"

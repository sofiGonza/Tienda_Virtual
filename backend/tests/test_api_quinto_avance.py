from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_and_openapi_include_q5_routes():
    assert client.get("/health").status_code == 200
    paths = app.openapi()["paths"]
    assert "/api/ventas" in paths
    assert "/api/reportes/ventas-diarias/pdf" in paths
    assert "/api/chatbot/mensaje" in paths


def test_protected_routes_require_authentication():
    assert client.get("/api/ventas").status_code == 401
    assert client.get("/api/facturas").status_code == 401
    assert client.get("/api/pqr").status_code == 401
    assert client.post("/api/chatbot/mensaje", json={"mensaje": "horarios"}).status_code == 401


def test_report_downloads_require_authentication():
    assert client.get("/api/reportes/ventas-diarias/pdf").status_code == 401
    assert client.get("/api/reportes/ventas-diarias/excel").status_code == 401

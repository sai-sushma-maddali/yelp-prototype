"""Smoke tests for the monolith FastAPI app (no Kafka workers)."""
import os

# Must be set before `app.main` is imported so startup skips broker threads.
os.environ.setdefault("SKIP_KAFKA_WORKERS", "1")

from starlette.testclient import TestClient

from app.main import app


def test_root():
    with TestClient(app) as client:
        r = client.get("/")
        assert r.status_code == 200
        assert r.json().get("message")


def test_openapi_available():
    with TestClient(app) as client:
        r = client.get("/openapi.json")
        assert r.status_code == 200
        body = r.json()
        assert body.get("openapi")
        assert body.get("paths")

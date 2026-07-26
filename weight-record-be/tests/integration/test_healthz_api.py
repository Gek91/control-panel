"""Integration tests for the /health endpoint."""

from __future__ import annotations

from fastapi.testclient import TestClient


def test_health_check_returns_200(client: TestClient) -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {}

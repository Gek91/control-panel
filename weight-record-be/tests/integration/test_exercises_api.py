"""Integration tests for the /exercises API."""

from __future__ import annotations

from fastapi.testclient import TestClient


EXPECTED_SEEDED_EXERCISES = [
    {"id": "ex1", "name": "Push Ups"},
    {"id": "ex2", "name": "Squats"},
    {"id": "ex3", "name": "Pull Ups"},
]


def test_list_exercises_returns_empty_list_when_no_data(
    client: TestClient,
) -> None:
    response = client.get("/exercises")

    assert response.status_code == 200
    assert response.json() == []


def test_list_exercises_returns_seeded_exercises(
    client: TestClient, seed_data: None
) -> None:
    response = client.get("/exercises")

    assert response.status_code == 200
    payload = response.json()
    assert len(payload) == len(EXPECTED_SEEDED_EXERCISES)
    assert {entry["id"] for entry in payload} == {
        entry["id"] for entry in EXPECTED_SEEDED_EXERCISES
    }
    assert all(set(entry.keys()) == {"id", "name"} for entry in payload)


def test_list_exercises_response_matches_seeded_dataset(
    client: TestClient, seed_data: None
) -> None:
    response = client.get("/exercises")

    assert response.status_code == 200
    payload = sorted(response.json(), key=lambda entry: entry["id"])
    expected = sorted(EXPECTED_SEEDED_EXERCISES, key=lambda entry: entry["id"])
    assert payload == expected

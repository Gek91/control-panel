"""Integration tests for /records and exercise percentages APIs."""

from __future__ import annotations

from fastapi.testclient import TestClient

SEEDED_RECORDS = [
    {
        "id": "11111111-1111-1111-1111-111111111111",
        "date": "2025-09-12",
        "exercise": {"id": "ex1", "name": "Push Ups"},
        "weight": 100.0,
        "percentage": 100,
    },
    {
        "id": "22222222-2222-2222-2222-222222222222",
        "date": "2025-09-10",
        "exercise": {"id": "ex2", "name": "Squats"},
        "weight": 140.0,
        "percentage": 100,
    },
    {
        "id": "33333333-3333-3333-3333-333333333333",
        "date": "2025-09-08",
        "exercise": {"id": "ex1", "name": "Push Ups"},
        "weight": 80.0,
        "percentage": 80,
    },
]


def test_list_records_returns_seeded_data(
    client: TestClient, seed_data: None
) -> None:
    response = client.get("/records")

    assert response.status_code == 200
    payload = response.json()
    assert len(payload) == len(SEEDED_RECORDS)
    # Default sort: date desc
    assert [entry["id"] for entry in payload] == [
        "11111111-1111-1111-1111-111111111111",
        "22222222-2222-2222-2222-222222222222",
        "33333333-3333-3333-3333-333333333333",
    ]
    assert payload == SEEDED_RECORDS


def test_create_list_and_filter_records(
    client: TestClient, seed_data: None
) -> None:
    created = client.post(
        "/records",
        json={
            "date": "2025-09-14",
            "exerciseId": "ex1",
            "weight": 100,
            "percentage": 100,
        },
    )
    assert created.status_code == 201
    body = created.json()
    assert body["exercise"] == {"id": "ex1", "name": "Push Ups"}
    assert body["weight"] == 100
    assert body["percentage"] == 100
    assert "id" in body

    client.post(
        "/records",
        json={
            "date": "2025-09-15",
            "exerciseId": "ex2",
            "weight": 140,
            "percentage": 100,
        },
    )

    listed = client.get("/records")
    assert listed.status_code == 200
    assert len(listed.json()) == len(SEEDED_RECORDS) + 2
    assert listed.json()[0]["date"] == "2025-09-15"

    filtered = client.get("/records", params={"exerciseId": "ex2"})
    assert filtered.status_code == 200
    assert len(filtered.json()) == 2
    assert all(entry["exercise"]["id"] == "ex2" for entry in filtered.json())


def test_create_record_unknown_exercise_returns_404(
    client: TestClient, seed_data: None
) -> None:
    response = client.post(
        "/records",
        json={
            "date": "2025-09-12",
            "exerciseId": "missing",
            "weight": 100,
            "percentage": 100,
        },
    )
    assert response.status_code == 404


def test_create_record_rejects_invalid_percentage(
    client: TestClient, seed_data: None
) -> None:
    response = client.post(
        "/records",
        json={
            "date": "2025-09-12",
            "exerciseId": "ex1",
            "weight": 100,
            "percentage": 0,
        },
    )
    assert response.status_code == 422


def test_update_and_delete_record(
    client: TestClient, seed_data: None
) -> None:
    created = client.post(
        "/records",
        json={
            "date": "2025-09-12",
            "exerciseId": "ex1",
            "weight": 100,
            "percentage": 100,
        },
    ).json()
    record_id = created["id"]

    updated = client.put(
        f"/records/{record_id}",
        json={
            "date": "2025-09-13",
            "exerciseId": "ex1",
            "weight": 110,
            "percentage": 90,
        },
    )
    assert updated.status_code == 200
    assert updated.json()["weight"] == 110
    assert updated.json()["percentage"] == 90

    deleted = client.delete(f"/records/{record_id}")
    assert deleted.status_code == 204

    missing = client.get(f"/records/{record_id}")
    assert missing.status_code == 404


def test_percentage_map_after_record(
    client: TestClient, seed_data: None
) -> None:
    # ex3 has no seeded records
    empty = client.get("/exercises/ex3/percentages")
    assert empty.status_code == 200
    assert empty.json() == []

    client.post(
        "/records",
        json={
            "date": "2025-09-12",
            "exerciseId": "ex3",
            "weight": 100,
            "percentage": 80,
        },
    )

    response = client.get("/exercises/ex3/percentages")
    assert response.status_code == 200
    assert response.json() == [
        {"percentage": 50, "value": 62.5},
        {"percentage": 60, "value": 75.0},
        {"percentage": 70, "value": 87.5},
        {"percentage": 80, "value": 100.0},
        {"percentage": 90, "value": 112.5},
        {"percentage": 100, "value": 125.0},
    ]

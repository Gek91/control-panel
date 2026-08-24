"""Unit tests for RecordsService (Record CRUD + on-the-fly percentage map)."""

from __future__ import annotations

from datetime import date

import pytest
from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.exercises.repositories.exercises_repository import ExerciseRepository
from app.exercises.services.exercises_service import ExercisesService
from app.records.repositories.records_repository import RecordRepository
from app.records.services.records_service import (
    InvalidRecordError,
    RecordsService,
)


@pytest.fixture()
def service(db_session: Session) -> RecordsService:
    return RecordsService(
        RecordRepository(db_session),
        ExercisesService(ExerciseRepository(db_session)),
    )


class TestRecordsService:
    def test_create_record_requires_existing_exercise(
        self, service: RecordsService, seed_data: None
    ) -> None:
        with pytest.raises(NotFoundError):
            service.create_record(
                record_date=date(2025, 9, 12),
                exercise_id="missing",
                weight=100,
                percentage=100,
            )

    def test_create_record_enables_percentage_map(
        self, service: RecordsService, seed_data: None
    ) -> None:
        record = service.create_record(
            record_date=date(2025, 9, 12),
            exercise_id="ex1",
            weight=100,
            percentage=80,
        )

        assert record.exercise_id == "ex1"
        assert record.weight == 100
        assert record.percentage == 80
        percentages = service.get_percentage_map("ex1")
        assert percentages[0] == {"percentage": 50, "value": 62.5}
        assert percentages[-1] == {"percentage": 100, "value": 125.0}

    def test_percentage_map_uses_max_estimate_across_records(
        self, service: RecordsService, seed_data: None
    ) -> None:
        service.create_record(
            record_date=date(2025, 9, 12),
            exercise_id="ex1",
            weight=100,
            percentage=100,
        )
        service.create_record(
            record_date=date(2025, 9, 13),
            exercise_id="ex1",
            weight=90,
            percentage=80,
        )

        # max(100, 112.5) = 112.5
        percentages = service.get_percentage_map("ex1")
        assert percentages[-1] == {"percentage": 100, "value": 112.5}

    def test_delete_last_record_clears_percentage_map(
        self, service: RecordsService, seed_data: None
    ) -> None:
        record = service.create_record(
            record_date=date(2025, 9, 12),
            exercise_id="ex3",
            weight=100,
            percentage=100,
        )
        service.delete_record(record.id)

        assert service.get_percentage_map("ex3") == []

    def test_list_defaults_to_date_desc(
        self, service: RecordsService, seed_data: None
    ) -> None:
        result = service.list_records()
        assert [r.id for r in result] == [
            "11111111-1111-1111-1111-111111111111",
            "22222222-2222-2222-2222-222222222222",
            "33333333-3333-3333-3333-333333333333",
        ]
        assert [r.date for r in result] == [
            date(2025, 9, 12),
            date(2025, 9, 10),
            date(2025, 9, 8),
        ]

    def test_get_missing_record_raises(
        self, service: RecordsService, seed_data: None
    ) -> None:
        with pytest.raises(NotFoundError):
            service.get_record("00000000-0000-0000-0000-000000000000")

    def test_create_rejects_invalid_percentage(
        self, service: RecordsService, seed_data: None
    ) -> None:
        with pytest.raises(InvalidRecordError, match="percentage"):
            service.create_record(
                record_date=date(2025, 9, 12),
                exercise_id="ex1",
                weight=100,
                percentage=0,
            )

    def test_create_rejects_non_positive_weight(
        self, service: RecordsService, seed_data: None
    ) -> None:
        with pytest.raises(InvalidRecordError, match="weight"):
            service.create_record(
                record_date=date(2025, 9, 12),
                exercise_id="ex1",
                weight=0,
                percentage=100,
            )

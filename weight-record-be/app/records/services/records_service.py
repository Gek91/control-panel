from __future__ import annotations

import uuid
from datetime import date

from app.core.exceptions import NotFoundError
from app.exercises.services.exercises_service import ExercisesService
from app.records.models.record import Record
from app.records.repositories.records_repository import RecordRepository

PERCENTAGE_STEPS = (50, 60, 70, 80, 90, 100)


class InvalidRecordError(Exception):
    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


class RecordsService:
    def __init__(
        self,
        record_repository: RecordRepository,
        exercises_service: ExercisesService,
    ):
        self.record_repository = record_repository
        self.exercises_service = exercises_service

    def list_records(
        self,
        *,
        exercise_id: str | None = None,
        from_date: date | None = None,
        to_date: date | None = None,
        sort_by: str = "date",
        sort_order: str = "desc",
    ) -> list[Record]:
        return self.record_repository.list(
            exercise_id=exercise_id,
            from_date=from_date,
            to_date=to_date,
            sort_by=sort_by,
            sort_order=sort_order,
        )

    def get_record(self, record_id: str) -> Record:
        record = self.record_repository.get_by_id(record_id)
        if record is None:
            raise NotFoundError("Record", record_id)
        return record

    def create_record(
        self,
        *,
        record_date: date,
        exercise_id: str,
        weight: float,
        percentage: int,
    ) -> Record:
        self._validate_record_fields(
            exercise_id=exercise_id, weight=weight, percentage=percentage
        )
        self.exercises_service.get_exercise(exercise_id)
        record = Record(
            id=str(uuid.uuid4()),
            date=record_date,
            exercise_id=exercise_id,
            weight=weight,
            percentage=percentage,
        )
        self.record_repository.add(record)
        return self.get_record(record.id)

    def update_record(
        self,
        record_id: str,
        *,
        record_date: date,
        exercise_id: str,
        weight: float,
        percentage: int,
    ) -> Record:
        record = self.get_record(record_id)
        self._validate_record_fields(
            exercise_id=exercise_id, weight=weight, percentage=percentage
        )
        self.exercises_service.get_exercise(exercise_id)

        record.date = record_date
        record.exercise_id = exercise_id
        record.weight = weight
        record.percentage = percentage
        self.record_repository.add(record)
        return self.get_record(record_id)

    def delete_record(self, record_id: str) -> None:
        record = self.get_record(record_id)
        self.record_repository.delete(record)

    def get_percentage_map(self, exercise_id: str) -> list[dict[str, float | int]]:
        self.exercises_service.get_exercise(exercise_id)
        one_rep_max = self.record_repository.max_estimated_one_rep_max(
            exercise_id
        )
        if one_rep_max is None:
            return []

        value = round(float(one_rep_max), 1)
        return [
            {
                "percentage": step,
                "value": round(value * step / 100, 1),
            }
            for step in PERCENTAGE_STEPS
        ]

    def _validate_record_fields(
        self, *, exercise_id: str, weight: float, percentage: int
    ) -> None:
        if not exercise_id or not exercise_id.strip():
            raise InvalidRecordError("exerciseId is required")
        if weight <= 0:
            raise InvalidRecordError("weight must be greater than 0")
        if (
            isinstance(percentage, bool)
            or not isinstance(percentage, int)
            or percentage < 1
            or percentage > 100
        ):
            raise InvalidRecordError("percentage must be an integer between 1 and 100")

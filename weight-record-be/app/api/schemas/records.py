from __future__ import annotations

from datetime import date
from typing import TYPE_CHECKING

from pydantic import BaseModel

from app.api.schemas.exercises import ExerciseDTO

if TYPE_CHECKING:
    from app.records.models.record import Record


class RecordCreateDTO(BaseModel):
    date: date
    exerciseId: str
    weight: float
    percentage: int


class RecordUpdateDTO(RecordCreateDTO):
    pass


class RecordDTO(BaseModel):
    id: str
    date: date
    exercise: ExerciseDTO
    weight: float
    percentage: int

    model_config = {
        "populate_by_name": True,
        "from_attributes": True,
    }

    @classmethod
    def from_entity(cls, record: Record) -> RecordDTO:
        return cls(
            id=record.id,
            date=record.date,
            exercise=ExerciseDTO.model_validate(record.exercise),
            weight=record.weight,
            percentage=record.percentage,
        )


class PercentageValueDTO(BaseModel):
    percentage: int
    value: float

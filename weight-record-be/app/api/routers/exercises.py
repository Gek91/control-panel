from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from starlette import status

from app.api.schemas.exercises import ExerciseDTO
from app.api.schemas.records import PercentageValueDTO
from app.core.exceptions import NotFoundError
from app.exercises.services.exercises_service import ExercisesService
from app.records.services.records_service import RecordsService

from ..dependencies import get_exercises_service, get_records_service

router = APIRouter(
    prefix="/exercises",
)

@router.get("", status_code=status.HTTP_200_OK)
async def list_exercises(exercises_service: Annotated[ExercisesService, Depends(get_exercises_service)]) -> list[ExerciseDTO]:
    
    exercises = exercises_service.list_exercies()
    return [ExerciseDTO.model_validate(exercise) for exercise in exercises]


@router.get("/{exercise_id}/percentages", status_code=status.HTTP_200_OK)
async def get_exercise_percentages(
    exercise_id: str,
    records_service: Annotated[RecordsService, Depends(get_records_service)],
) -> list[PercentageValueDTO]:
    try:
        values = records_service.get_percentage_map(exercise_id)
    except NotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=exc.message
        ) from exc
    return [PercentageValueDTO.model_validate(value) for value in values]

from app.api.schemas.exercises import ExerciseDTO
from starlette import status
from fastapi import APIRouter, Depends
from typing import Annotated
from app.exercises.services.exercises_service import ExercisesService
from ..dependencies import get_exercises_service

router = APIRouter(
    prefix="/exercises",
)

@router.get("", status_code=status.HTTP_200_OK)
async def list_exercises(exercises_service: Annotated[ExercisesService, Depends(get_exercises_service)]) -> list[ExerciseDTO]:
    
    exercises = exercises_service.list_exercies()
    return [ExerciseDTO.model_validate(exercise) for exercise in exercises]
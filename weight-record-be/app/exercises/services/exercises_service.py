from __future__ import annotations

from app.core.exceptions import NotFoundError
from app.exercises.repositories.exercises_repository import ExerciseRepository
from ..models.exercise import Exercise


class ExercisesService:

    def __init__(self, exercise_repository: ExerciseRepository):
        self.exercise_repository = exercise_repository

    def list_exercies(self) -> list[Exercise]:
        return self.exercise_repository.list_all()

    def get_exercise(self, exercise_id: str) -> Exercise:
        exercise = self.exercise_repository.get_by_id(exercise_id)
        if exercise is None:
            raise NotFoundError("Exercise", exercise_id)
        return exercise

from app.exercises.repositories.exercises_repository import ExerciseRepository
from app.core.configs import Configs
from ..models.exercise import Exercise

class ExercisesService:

    def __init__(self, exercise_repository: ExerciseRepository):
        self.exercise_repository = exercise_repository


    def list_exercies(self) -> list[Exercise]:
        return self.exercise_repository.list_all()
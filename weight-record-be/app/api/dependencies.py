
from app.core.configs import Configs, get_configs
from fastapi import Request, Depends
from sqlalchemy.orm import sessionmaker
from app.exercises.repositories.exercises_repository import ExerciseRepository
from app.exercises.services.exercises_service import ExercisesService


def get_configs() -> Configs:
    return get_configs()

def get_database_session(request: Request) -> sessionmaker:
    # This is set up in the database middleware.
    return request.state.db_session

def get_exercise_repository(db_session: sessionmaker = Depends(get_database_session)):
    return ExerciseRepository(db_session)

def get_exercises_service(exercise_repository: ExerciseRepository = Depends(get_exercise_repository)):
    return ExercisesService(exercise_repository)

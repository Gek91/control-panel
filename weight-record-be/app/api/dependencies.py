from app.core.configs import Configs, get_configs as load_configs
from fastapi import Request, Depends
from sqlalchemy.orm import sessionmaker
from app.exercises.repositories.exercises_repository import ExerciseRepository
from app.exercises.services.exercises_service import ExercisesService
from app.records.repositories.records_repository import RecordRepository
from app.records.services.records_service import RecordsService


def get_configs() -> Configs:
    return load_configs()

def get_database_session(request: Request) -> sessionmaker:
    # This is set up in the database middleware.
    return request.state.db_session

def get_exercise_repository(db_session: sessionmaker = Depends(get_database_session)):
    return ExerciseRepository(db_session)

def get_exercises_service(exercise_repository: ExerciseRepository = Depends(get_exercise_repository)):
    return ExercisesService(exercise_repository)

def get_record_repository(db_session: sessionmaker = Depends(get_database_session)):
    return RecordRepository(db_session)

def get_records_service(
    record_repository: RecordRepository = Depends(get_record_repository),
    exercises_service: ExercisesService = Depends(get_exercises_service),
):
    return RecordsService(record_repository, exercises_service)

"""Unit tests for the exercises service.

The service is exercised against a real (in-memory) SQLite database wired
through the actual repository, so these tests also cover the repository code
paths reached by the service. The database is seeded from
``resources/test_data.sql``.
"""

from __future__ import annotations

import pytest
from sqlalchemy.orm import Session

from app.exercises.models.exercise import Exercise
from app.exercises.repositories.exercises_repository import ExerciseRepository
from app.exercises.services.exercises_service import ExercisesService


EXPECTED_SEEDED_IDS = {"ex1", "ex2", "ex3"}


@pytest.fixture()
def service(db_session: Session) -> ExercisesService:
    return ExercisesService(ExerciseRepository(db_session))


class TestExercisesService:
    def test_list_exercises_returns_empty_when_no_data(
        self, service: ExercisesService
    ) -> None:
        assert service.list_exercies() == []

    def test_list_exercises_returns_seeded_exercises(
        self, service: ExercisesService, seed_data: None
    ) -> None:
        result = service.list_exercies()

        assert len(result) == len(EXPECTED_SEEDED_IDS)
        assert all(isinstance(exercise, Exercise) for exercise in result)
        assert {exercise.id for exercise in result} == EXPECTED_SEEDED_IDS

    def test_list_exercises_returns_expected_names(
        self, service: ExercisesService, seed_data: None
    ) -> None:
        result = service.list_exercies()

        assert {(exercise.id, exercise.name) for exercise in result} == {
            ("ex1", "Push Ups"),
            ("ex2", "Squats"),
            ("ex3", "Pull Ups"),
        }

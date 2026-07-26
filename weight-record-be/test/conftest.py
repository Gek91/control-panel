"""Shared pytest fixtures.

These fixtures build an in-memory SQLite database that is reused across the
test session. The StaticPool keeps a single connection alive so that the
``sqlite://`` in-memory database is visible to every session (including the
one opened by the FastAPI middleware during API integration tests).

The database is seeded on demand from ``resources/test_data.sql`` through the
``seed_data`` fixture, mirroring the mechanism used by the local environment
with ``resources/local_data.sql``.
"""

from __future__ import annotations

from pathlib import Path
from typing import Iterator

import pytest
from sqlalchemy import Engine, create_engine, text
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import BaseModel
# Importing the model ensures it is registered against ``BaseModel.metadata``
# before ``create_all`` is executed below.
from app.exercises.models.exercise import Exercise  # noqa: F401


TEST_DATA_SQL = Path(__file__).resolve().parent.parent / "resources" / "test_data.sql"


@pytest.fixture()
def engine() -> Iterator[Engine]:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    BaseModel.metadata.create_all(engine)
    try:
        yield engine
    finally:
        BaseModel.metadata.drop_all(engine)
        engine.dispose()


@pytest.fixture()
def session_factory(engine: Engine) -> sessionmaker[Session]:
    return sessionmaker(bind=engine, expire_on_commit=False)


@pytest.fixture()
def db_session(session_factory: sessionmaker[Session]) -> Iterator[Session]:
    with session_factory() as session:
        yield session


@pytest.fixture()
def seed_data(engine: Engine) -> None:
    """Populate the in-memory database from ``resources/test_data.sql``."""

    sql = TEST_DATA_SQL.read_text()
    with engine.begin() as connection:
        for statement in _split_sql_statements(sql):
            connection.execute(text(statement))


def _split_sql_statements(sql: str) -> list[str]:
    return [stmt.strip() for stmt in sql.split(";") if stmt.strip()]

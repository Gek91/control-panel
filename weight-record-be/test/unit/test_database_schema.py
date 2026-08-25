"""Runtime schema wiring for SQLite vs Postgres."""

from __future__ import annotations

from sqlalchemy import create_engine, inspect
from sqlalchemy.pool import StaticPool

from app.core.database import WEIGHT_RECORD_SCHEMA, BaseModel, get_engine
from app.exercises.models.exercise import Exercise  # noqa: F401
from app.records.models.record import Record  # noqa: F401


class TestRuntimeSchema:
    def test_models_have_no_schema(self) -> None:
        assert BaseModel.metadata.schema is None
        assert Exercise.__table__.schema is None
        assert Record.__table__.schema is None

    def test_exercise_name_matches_schema_sql(self) -> None:
        name_col = Exercise.__table__.c.name
        assert name_col.type.length == 255
        assert not name_col.nullable
        assert name_col.unique

    def test_postgres_engine_translates_into_weight_record(self) -> None:
        from app.core import database as database_module

        url = "postgresql+psycopg://controlpanel:controlpanel@localhost/controlpanel"
        database_module._engines.pop(url, None)
        # create_engine does not connect until first use; options are set at build time.
        engine = get_engine(url)
        options = engine.get_execution_options()
        assert options.get("schema_translate_map") == {None: WEIGHT_RECORD_SCHEMA}

    def test_sqlite_engine_has_no_schema_translation(self) -> None:
        from app.core import database as database_module

        database_module._engines.pop("sqlite://", None)
        engine = get_engine("sqlite://")
        assert "schema_translate_map" not in engine.get_execution_options()

    def test_create_all_on_sqlite(self) -> None:
        engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        BaseModel.metadata.create_all(engine)
        table_names = set(inspect(engine).get_table_names())
        assert "exercises" in table_names
        assert "records" in table_names

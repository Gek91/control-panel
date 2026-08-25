from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from sqlalchemy.pool import StaticPool

WEIGHT_RECORD_SCHEMA = "weight_record"

_engines: dict[str, Engine] = {}


def get_engine(database_url: str, echo=False) -> Engine:
    # Reuse one engine per URL so an in-memory SQLite DB is shared across
    # startup seeding and request sessions.
    if database_url not in _engines:
        kwargs: dict = {"echo": echo}
        if database_url.startswith("sqlite"):
            if database_url in ("sqlite://", "sqlite:///:memory:"):
                kwargs["connect_args"] = {"check_same_thread": False}
                kwargs["poolclass"] = StaticPool
            engine = create_engine(database_url, **kwargs)
        else:
            # Models stay schema-agnostic; qualify as weight_record only on Postgres.
            engine = create_engine(database_url, **kwargs).execution_options(
                schema_translate_map={None: WEIGHT_RECORD_SCHEMA}
            )
        _engines[database_url] = engine
    return _engines[database_url]


def get_local_session(database_url: str, echo=False):
    engine = get_engine(database_url, echo)
    session = sessionmaker(expire_on_commit=False, bind=engine)
    return session


class BaseModel(DeclarativeBase):
    pass

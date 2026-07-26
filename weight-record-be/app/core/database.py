from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import StaticPool

_engines: dict[str, Engine] = {}


def _is_sqlite_memory(database_url: str) -> bool:
    return database_url in ("sqlite://", "sqlite:///:memory:")


def get_engine(database_url: str, echo=False) -> Engine:
    # Reuse one engine per URL so an in-memory SQLite DB is shared across
    # startup seeding and request sessions.
    if database_url not in _engines:
        kwargs: dict = {"echo": echo}
        if _is_sqlite_memory(database_url):
            kwargs["connect_args"] = {"check_same_thread": False}
            kwargs["poolclass"] = StaticPool
        _engines[database_url] = create_engine(database_url, **kwargs)
    return _engines[database_url]


def get_local_session(database_url: str, echo=False):
    engine = get_engine(database_url, echo)
    session = sessionmaker(expire_on_commit=False, bind=engine)
    return session


class BaseModel(DeclarativeBase):
    pass

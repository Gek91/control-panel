from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import DeclarativeBase


def get_engine(database_url: str, echo=False) -> Engine:
    engine = create_engine(database_url, echo=echo)
    return engine


def get_local_session(database_url: str, echo=False):
    engine = get_engine(database_url, echo)
    session = sessionmaker(expire_on_commit=False, bind=engine)
    return session


class BaseModel(DeclarativeBase):
    pass
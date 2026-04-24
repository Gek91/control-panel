"""Integration-test fixtures.

The FastAPI application is built with a test-only configuration that points
the session factory at the in-memory SQLite engine created by the root
``conftest.py``. The database middleware is patched so that both the HTTP
request session and the session used directly by the test share the same
underlying database, which keeps the tests realistic while remaining fully
isolated from any external resource.
"""

from __future__ import annotations

from typing import Iterator

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session, sessionmaker


@pytest.fixture()
def app(
    session_factory: sessionmaker[Session],
    monkeypatch: pytest.MonkeyPatch,
) -> FastAPI:
    from app import main as main_module
    from app.core import middleware as middleware_module
    from app.core.configs import Configs

    def _test_session_factory(database_url: str, echo: bool = False):
        return session_factory

    monkeypatch.setattr(
        middleware_module, "get_local_session", _test_session_factory
    )

    test_configs = Configs(env="test", database_url="sqlite://")
    monkeypatch.setattr(main_module, "get_configs", lambda: test_configs)

    return main_module.main()


@pytest.fixture()
def client(app: FastAPI) -> Iterator[TestClient]:
    with TestClient(app) as test_client:
        yield test_client

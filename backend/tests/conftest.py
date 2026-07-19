"""Test config: isolate to a throwaway SQLite DB and seed via app lifespan."""
import os
import pathlib

# Must be set BEFORE importing app (config reads env at import time).
os.environ["DATABASE_URL"] = "sqlite:///./test_threshold.db"
os.environ["SEED_ON_STARTUP"] = "1"
os.environ["OUTBOX_WORKER"] = "0"  # drain deterministically in tests, no background loop

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

_DB = pathlib.Path("test_threshold.db")


def _rm():
    # Release the SQLAlchemy connection pool so Windows lets us delete the file.
    try:
        from app.db import engine
        engine.dispose()
    except Exception:
        pass
    try:
        if _DB.exists():
            _DB.unlink()
    except PermissionError:
        pass  # best-effort cleanup; not a test failure


@pytest.fixture(scope="session", autouse=True)
def _clean_db():
    _rm()
    yield
    _rm()


@pytest.fixture()
def client():
    from app.main import app
    with TestClient(app) as c:  # `with` triggers lifespan -> init_db + seed
        yield c

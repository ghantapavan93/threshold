"""Database engine/session wiring (SQLAlchemy 2.0). Defaults to SQLite for a
zero-friction local run; DATABASE_URL points at Postgres in Docker."""
from __future__ import annotations

from collections.abc import Iterator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from .config import settings

_connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
engine = create_engine(settings.database_url, connect_args=_connect_args, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False, future=True)


class Base(DeclarativeBase):
    pass


def get_db() -> Iterator[Session]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Local zero-config convenience only. Alembic is the migration source of
    truth (see backend/migrations/ + `alembic upgrade head`); create_all just
    makes the SQLite dev loop frictionless."""
    from . import models  # noqa: F401  (register tables)
    Base.metadata.create_all(bind=engine)

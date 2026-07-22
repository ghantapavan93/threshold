"""Recovery-drill endpoint — runs the outbox failure/recovery drill on demand and
returns its evidence, so 'the architecture survives failure' is a claim you can
re-run, not just read."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..db import get_db
from ..recovery import run_recovery_drill

router = APIRouter(prefix="/api/v1")


@router.get("/recovery-drill")
def recovery_drill(db: Session = Depends(get_db)) -> dict:
    return run_recovery_drill(db)

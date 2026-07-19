"""Append-only tamper-evident audit for a replay job + integrity verification."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..config import settings
from ..db import get_db
from ..domain.audit import verify
from ..models import ReplayJobRow

router = APIRouter(prefix="/api/v1/merchants/{merchant_id}")


def _job(db: Session, merchant_id: str, job_id: str) -> ReplayJobRow:
    row = db.query(ReplayJobRow).filter_by(merchant_id=merchant_id, id=job_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="replay job not found")
    return row


@router.get("/replay-jobs/{job_id}/audit")
def get_audit(merchant_id: str, job_id: str, db: Session = Depends(get_db)) -> list[dict]:
    return _job(db, merchant_id, job_id).result.get("_audit", [])


@router.post("/replay-jobs/{job_id}/audit/verify")
def verify_audit(merchant_id: str, job_id: str, db: Session = Depends(get_db)) -> dict:
    records = _job(db, merchant_id, job_id).result.get("_audit", [])
    return verify(records, settings.audit_secret)

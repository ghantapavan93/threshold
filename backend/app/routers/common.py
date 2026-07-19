"""Shared helpers: policy loading + replay-job response shaping."""
from __future__ import annotations

from fastapi import HTTPException
from sqlalchemy.orm import Session

from ..domain.policy import Policy
from ..models import PolicyVersionRow, ReplayJobRow


def load_policy(db: Session, merchant_id: str, version: str) -> Policy:
    row = (
        db.query(PolicyVersionRow)
        .filter_by(merchant_id=merchant_id, policy_version=version)
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail=f"policy {version} not found for merchant {merchant_id}")
    return Policy.model_validate(row.document)


def job_response(row: ReplayJobRow) -> dict:
    result = dict(row.result)
    result.pop("_audit", None)
    return {
        "id": row.id,
        "merchant_id": row.merchant_id,
        "status": "COMPLETED",
        "created_at": row.created_at.isoformat(),
        **result,
    }

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..db import get_db
from ..domain.diff import diff_policies
from ..models import PolicyVersionRow
from ..schemas import PolicyDiffRequest
from .common import load_policy

router = APIRouter(prefix="/api/v1/merchants/{merchant_id}")


@router.get("/policies")
def list_policies(merchant_id: str, db: Session = Depends(get_db)) -> list[dict]:
    rows = (
        db.query(PolicyVersionRow)
        .filter_by(merchant_id=merchant_id)
        .order_by(PolicyVersionRow.policy_version)
        .all()
    )
    return [{"policy_version": r.policy_version, "name": r.name,
             "created_at": r.created_at.isoformat()} for r in rows]


@router.get("/policies/{policy_version}")
def get_policy(merchant_id: str, policy_version: str, db: Session = Depends(get_db)) -> dict:
    return load_policy(db, merchant_id, policy_version).model_dump()


@router.post("/policy-diff")
def policy_diff(merchant_id: str, req: PolicyDiffRequest, db: Session = Depends(get_db)) -> dict:
    base = load_policy(db, merchant_id, req.base_version)
    proposed = load_policy(db, merchant_id, req.proposed_version)
    return diff_policies(base, proposed)

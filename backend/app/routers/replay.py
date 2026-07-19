from fastapi import APIRouter, Depends, Header, HTTPException, Response
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .. import outbox
from ..config import settings
from ..db import get_db
from ..domain.replay import run_replay
from ..models import OutboxEventRow, ReplayJobRow
from ..observability import get_tracer
from ..schemas import ReplayJobRequest
from .common import job_response, load_policy

tracer = get_tracer()

router = APIRouter(prefix="/api/v1/merchants/{merchant_id}")


@router.post("/replay-jobs")
def create_replay_job(
    merchant_id: str,
    req: ReplayJobRequest,
    response: Response,
    db: Session = Depends(get_db),
    idempotency_key: str | None = Header(default=None, alias="Idempotency-Key"),
) -> dict:
    # Idempotent: same key -> same job (never re-run).
    if idempotency_key:
        existing = (
            db.query(ReplayJobRow)
            .filter_by(merchant_id=merchant_id, idempotency_key=idempotency_key)
            .first()
        )
        if existing:
            response.status_code = 200
            return job_response(existing)

    with tracer.start_as_current_span("replay.load_policies"):
        base = load_policy(db, merchant_id, req.base_version)
        proposed = load_policy(db, merchant_id, req.proposed_version)

    with tracer.start_as_current_span("replay.run") as span:
        job = run_replay(
            base, proposed, req.session_seed, req.session_count, req.injections, settings.audit_secret
        )
        span.set_attribute("threshold.verdict", job["verdict"]["value"])
        span.set_attribute("threshold.session_count", req.session_count)
        span.set_attribute("threshold.proposed_version", req.proposed_version)
    row = ReplayJobRow(
        merchant_id=merchant_id,
        idempotency_key=idempotency_key,
        base_version=req.base_version,
        proposed_version=req.proposed_version,
        verdict=job["verdict"]["value"],
        result=job,
    )
    db.add(row)
    try:
        db.flush()  # assign row.id so the outbox rows reference it
        # Transactional outbox: fan-out events are committed atomically with the job.
        outbox.enqueue(db, row.id, merchant_id,
                       outbox.events_for_job(job["replay_summary"], job["verdict"]))
        db.commit()
    except IntegrityError:  # concurrent request with same key won the race
        db.rollback()
        existing = (
            db.query(ReplayJobRow)
            .filter_by(merchant_id=merchant_id, idempotency_key=idempotency_key)
            .first()
        )
        if existing:
            response.status_code = 200
            return job_response(existing)
        raise HTTPException(status_code=409, detail="replay job conflict")
    db.refresh(row)
    response.status_code = 201
    return job_response(row)


@router.get("/replay-jobs/{job_id}")
def get_replay_job(merchant_id: str, job_id: str, db: Session = Depends(get_db)) -> dict:
    row = db.query(ReplayJobRow).filter_by(merchant_id=merchant_id, id=job_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="replay job not found")
    return job_response(row)


@router.get("/replay-jobs/{job_id}/outbox")
def get_outbox(merchant_id: str, job_id: str, db: Session = Depends(get_db)) -> list[dict]:
    rows = (
        db.query(OutboxEventRow)
        .filter_by(merchant_id=merchant_id, job_id=job_id)
        .order_by(OutboxEventRow.created_at)
        .all()
    )
    return [{"id": r.id, "event_type": r.event_type, "target": r.target,
             "status": r.status, "attempts": r.attempts,
             "created_at": r.created_at.isoformat(),
             "published_at": r.published_at.isoformat() if r.published_at else None}
            for r in rows]

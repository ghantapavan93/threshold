"""ORM models. Policy versions are write-once (immutable documents). Replay jobs
are idempotent by (merchant_id, idempotency_key). Conversions dedupe on
(merchant_id, dedup_key) where dedup_key = conversiontype:confirmationref."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import JSON, DateTime, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from .db import Base


def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


class PolicyVersionRow(Base):
    __tablename__ = "policy_versions"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    merchant_id: Mapped[str] = mapped_column(String, index=True)
    policy_version: Mapped[str] = mapped_column(String, index=True)
    name: Mapped[str] = mapped_column(String)
    document: Mapped[dict] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    __table_args__ = (UniqueConstraint("merchant_id", "policy_version", name="uq_policy_version"),)


class ReplayJobRow(Base):
    __tablename__ = "replay_jobs"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    merchant_id: Mapped[str] = mapped_column(String, index=True)
    idempotency_key: Mapped[str | None] = mapped_column(String, nullable=True)
    base_version: Mapped[str] = mapped_column(String)
    proposed_version: Mapped[str] = mapped_column(String)
    verdict: Mapped[str] = mapped_column(String)
    result: Mapped[dict] = mapped_column(JSON)      # full job payload incl. _audit
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    __table_args__ = (UniqueConstraint("merchant_id", "idempotency_key", name="uq_replay_idem"),)


class OutboxEventRow(Base):
    """Transactional outbox: written in the SAME transaction as the replay job, so
    the fan-out to downstream systems (analytics/billing/partner) is atomic with
    the decision. A background worker drains PENDING rows with capped exponential
    backoff + jitter, and dead-letters after MAX_ATTEMPTS. This is the Milestone-B
    scale foundation, implemented for real (not just documented)."""
    __tablename__ = "outbox_events"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    job_id: Mapped[str] = mapped_column(String, index=True)
    merchant_id: Mapped[str] = mapped_column(String, index=True)
    event_type: Mapped[str] = mapped_column(String)   # REPLAY_COMPLETED | VERDICT_ISSUED
    target: Mapped[str] = mapped_column(String)        # analytics | billing | partner
    payload: Mapped[dict] = mapped_column(JSON)
    status: Mapped[str] = mapped_column(String, default="PENDING")  # PENDING | PUBLISHED | DEAD_LETTER
    attempts: Mapped[int] = mapped_column(Integer, default=0)
    next_attempt_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class ConversionRow(Base):
    __tablename__ = "conversions"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    merchant_id: Mapped[str] = mapped_column(String, index=True)
    dedup_key: Mapped[str] = mapped_column(String, index=True)
    conversiontype: Mapped[str] = mapped_column(String)
    confirmationref: Mapped[str] = mapped_column(String)
    amount: Mapped[float] = mapped_column()
    currency: Mapped[str] = mapped_column(String)
    seq: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    __table_args__ = (UniqueConstraint("merchant_id", "dedup_key", name="uq_conversion_dedup"),)

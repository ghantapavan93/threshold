"""Moment Forge — thin READ-ONLY HTTP adapters over the existing pure engine.

Two endpoints, both deterministic and NON-persisting (they never write a
PolicyVersionRow / ReplayJobRow / OutboxEventRow / ConversionRow):

- POST /semantic-compile  — static semantic delta + bounded-context graph +
  missing-attribute inversion flag (no sessions).  §2.1
- POST /simulations       — ephemeral wrapper over `run_replay` that accepts an
  inline / edited proposed policy or muted contexts.  §2.2

Zero new decision logic (ADR-002): everything on the compute path is one of the
existing pure domain functions (`diff_policies`, `run_replay`, `Policy`) plus the
pure `build_semantic_delta`. The only I/O is the optional read-only `load_policy`
before the pure core runs.
"""
from __future__ import annotations

import logging
import time

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field, ValidationError
from sqlalchemy.orm import Session

from ..config import settings
from ..db import get_db
from ..domain.contexts import CONTEXT_IDS, build_semantic_delta, context_for_attribute
from ..domain.diff import diff_policies
from ..domain.policy import Policy
from ..domain.replay import run_replay
from ..observability import get_meter, get_tracer
from .common import load_policy

log = logging.getLogger("threshold")
tracer = get_tracer()
_meter = get_meter()

# Metrics (degrade to no-op instruments when OTel metrics SDK is absent, §5).
_compile_total = _meter.create_counter("momentforge_compile_total")
_simulate_total = _meter.create_counter("momentforge_simulate_total")
_inversion_total = _meter.create_counter("momentforge_inversion_detected_total")
_validation_error_total = _meter.create_counter("momentforge_validation_error_total")
_compile_duration = _meter.create_histogram("momentforge_compile_duration_ms")
_simulate_duration = _meter.create_histogram("momentforge_simulate_duration_ms")
_simulate_sessions = _meter.create_histogram("momentforge_simulate_sessions")

router = APIRouter(prefix="/api/v1/merchants/{merchant_id}")


# --------------------------------------------------------------------------- #
# Request models
# --------------------------------------------------------------------------- #
class SemanticCompileRequest(BaseModel):
    base_version: str
    proposed_version: str | None = None
    proposed_document: dict | None = None
    muted_contexts: list[str] = Field(default_factory=list)


class SimulationProposed(BaseModel):
    from_version: str | None = None
    document: dict | None = None
    rule_overrides: list[dict] = Field(default_factory=list)
    muted_contexts: list[str] = Field(default_factory=list)


class SimulationRequest(BaseModel):
    base_version: str
    proposed: SimulationProposed = Field(default_factory=SimulationProposed)
    session_seed: int = 42
    session_count: int = Field(default=200, ge=1, le=5000)
    injections: list[str] = Field(
        default_factory=lambda: ["timeout", "invalid_output", "stale_identity"])


# --------------------------------------------------------------------------- #
# Helpers
# --------------------------------------------------------------------------- #
def _rid(request: Request) -> str | None:
    return getattr(request.state, "request_id", None)


def _reject(reason: str, message: str) -> HTTPException:
    """Return a 422 the way the RequestValidationError handler would frame it, and
    bump the validation-error counter (labelled by reason)."""
    _validation_error_total.add(1, {"reason": reason})
    return HTTPException(status_code=422, detail=message)


def _validate_muted(muted: list[str]) -> None:
    unknown = [m for m in muted if m not in CONTEXT_IDS]
    if unknown:
        raise _reject("unknown_muted_contexts",
                      f"unknown muted_contexts: {', '.join(unknown)}")


def _validate_policy_document(document: dict) -> Policy:
    try:
        return Policy.model_validate(document)
    except ValidationError as exc:
        raise _reject("invalid_policy", f"invalid proposed policy: {exc.errors()}") from exc


def _drop_muted_rules(policy: Policy, muted: list[str]) -> Policy:
    """Return a copy of `policy` with every rule whose attribute falls in a muted
    context removed (context toggle OFF). Pure — the input is never mutated."""
    if not muted:
        return policy
    muted_set = set(muted)
    copy = policy.model_copy(deep=True)
    copy.eligibility_rules = [
        r for r in copy.eligibility_rules
        if context_for_attribute(r.attribute) not in muted_set
    ]
    return copy


# --------------------------------------------------------------------------- #
# A. Semantic Change Compiler
# --------------------------------------------------------------------------- #
@router.post("/semantic-compile")
def semantic_compile(
    merchant_id: str,
    req: SemanticCompileRequest,
    request: Request,
    db: Session = Depends(get_db),
) -> dict:
    t0 = time.perf_counter()

    # Exactly one of proposed_version | proposed_document (F4).
    if (req.proposed_version is None) == (req.proposed_document is None):
        raise _reject("proposed_xor",
                      "exactly one of proposed_version or proposed_document is required")
    _validate_muted(req.muted_contexts)  # F10

    base = load_policy(db, merchant_id, req.base_version)  # 404 (F2)
    if req.proposed_version is not None:
        proposed = load_policy(db, merchant_id, req.proposed_version)  # 404 (F2)
        proposed_version = req.proposed_version
    else:
        proposed = _validate_policy_document(req.proposed_document)  # 422 (F3)
        proposed_version = proposed.policy_version

    proposed = _drop_muted_rules(proposed, req.muted_contexts)

    with tracer.start_as_current_span("momentforge.compile") as span:
        delta = build_semantic_delta(base, proposed, req.muted_contexts)
        inversion = delta["missing_attribute_inversion"]
        inversion_detected = bool(inversion and inversion.get("detected"))
        span.set_attribute("threshold.base_version", req.base_version)
        span.set_attribute("threshold.proposed_version", proposed_version)
        span.set_attribute("momentforge.inversion_detected", inversion_detected)
        span.set_attribute("momentforge.change_count", len(delta["changes"]))

    duration_ms = (time.perf_counter() - t0) * 1000.0
    _compile_total.add(1, {"result": "ok"})
    _compile_duration.record(duration_ms)
    if inversion_detected:
        _inversion_total.add(1)
    log.info(
        '{"route":"semantic-compile","merchant_id":"%s","request_id":"%s",'
        '"base":"%s","proposed":"%s","muted_contexts":%d,"change_count":%d,'
        '"inversion_detected":%s,"duration_ms":%.2f}',
        merchant_id, _rid(request), req.base_version, proposed_version,
        len(req.muted_contexts), len(delta["changes"]),
        str(inversion_detected).lower(), duration_ms,
    )

    return {
        "base_version": req.base_version,
        "proposed_version": proposed_version,
        **delta,
    }


# --------------------------------------------------------------------------- #
# B. Domain Evolution Simulator
# --------------------------------------------------------------------------- #
def _resolve_proposed(
    db: Session, merchant_id: str, base_version: str, proposed: SimulationProposed,
) -> Policy:
    """Deterministic one-pass resolution: document|from_version|base → overrides →
    mute → validate (§2.2)."""
    # 1. starting document
    if proposed.document is not None:
        doc = dict(proposed.document)
    elif proposed.from_version:
        doc = load_policy(db, merchant_id, proposed.from_version).model_dump()  # 404
    else:
        doc = load_policy(db, merchant_id, base_version).model_dump()  # 404

    # 2. rule_overrides — patch fields on the rule whose `id` matches.
    if proposed.rule_overrides:
        # Validate BEFORE indexing by id: a dict keyed on rule id silently
        # collapses duplicate ids (last-wins), which would bypass the unique-id
        # guard and run the sim on a policy the operator never authored. Fail
        # closed on a malformed / duplicate-id document first (F3).
        _validate_policy_document(doc)
        rules = doc.get("eligibility_rules", [])
        by_id = {r["id"]: r for r in rules}
        for ov in proposed.rule_overrides:
            rid = ov.get("id")
            if rid in by_id:
                by_id[rid].update({k: v for k, v in ov.items() if k != "id"})
        doc["eligibility_rules"] = list(by_id.values())

    # 4. validate the resolved policy (422 on schema failure, F3)
    policy = _validate_policy_document(doc)
    # 3. drop rules in muted contexts (applied on the validated policy — a subset of
    #    valid rules is still valid; F9 mute-all → 0 rules → unconditional offer).
    policy = _drop_muted_rules(policy, proposed.muted_contexts)
    return policy


@router.post("/simulations")
def simulate(
    merchant_id: str,
    req: SimulationRequest,
    request: Request,
    db: Session = Depends(get_db),
) -> dict:
    t0 = time.perf_counter()
    _validate_muted(req.proposed.muted_contexts)  # F10

    base = load_policy(db, merchant_id, req.base_version)  # 404 (F2)

    with tracer.start_as_current_span("momentforge.simulate.resolve") as span:
        proposed = _resolve_proposed(db, merchant_id, req.base_version, req.proposed)
        span.set_attribute("momentforge.muted_contexts", len(req.proposed.muted_contexts))
        span.set_attribute("momentforge.override_count", len(req.proposed.rule_overrides))

    with tracer.start_as_current_span("momentforge.simulate.run") as span:
        job = run_replay(base, proposed, req.session_seed, req.session_count,
                         req.injections, settings.audit_secret)
        delta = build_semantic_delta(base, proposed, req.proposed.muted_contexts)
        span.set_attribute("threshold.verdict", job["verdict"]["value"])
        span.set_attribute("threshold.session_count", req.session_count)
        span.set_attribute("momentforge.changed_count", job["replay_summary"]["changed"])
        span.set_attribute("momentforge.support", job["ope_prescreen"]["support"])

    audit = job.pop("_audit")
    verdict_value = job["verdict"]["value"]
    inversion = delta["missing_attribute_inversion"]
    inversion_detected = bool(inversion and inversion.get("detected"))

    duration_ms = (time.perf_counter() - t0) * 1000.0
    _simulate_total.add(1, {"verdict": verdict_value})
    _simulate_duration.record(duration_ms)
    _simulate_sessions.record(req.session_count)
    if inversion_detected:
        _inversion_total.add(1)
    log.info(
        '{"route":"simulations","merchant_id":"%s","request_id":"%s","base":"%s",'
        '"proposed":"%s","muted_contexts":%d,"session_count":%d,"verdict":"%s",'
        '"changed_count":%d,"duration_ms":%.2f}',
        merchant_id, _rid(request), req.base_version, job["proposed_version"],
        len(req.proposed.muted_contexts), req.session_count, verdict_value,
        job["replay_summary"]["changed"], duration_ms,
    )

    # Semantic delta minus the base/proposed echoes (they live at the top level).
    semantic_delta = {k: v for k, v in delta.items()}

    return {
        "base_version": job["base_version"],
        "proposed_version": job["proposed_version"],
        "session_count": job["session_count"],
        "semantic_delta": semantic_delta,
        "diff": job["diff"],
        "constraint_results": job["constraint_results"],
        "replay_summary": job["replay_summary"],
        "evaluations": job["evaluations"],
        "failclosed_proofs": job["failclosed_proofs"],
        "ope_prescreen": job["ope_prescreen"],
        "verdict": job["verdict"],
        "context_toggles_applied": list(req.proposed.muted_contexts),
        "audit": audit,
    }

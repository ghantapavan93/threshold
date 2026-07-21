"""Moment Forge — thin READ-ONLY HTTP adapters over the existing pure engine.

Two endpoints, both deterministic and NON-persisting (they never write a
PolicyVersionRow / ReplayJobRow / OutboxEventRow / ConversionRow):

- POST /semantic-compile  — static semantic delta + bounded-context graph +
  missing-attribute inversion flag (no sessions).  §2.1
- POST /simulations       — ephemeral wrapper over `run_replay` that accepts an
  inline / edited proposed policy or muted contexts.  §2.2
- POST /translation-audit — runs the pure Translation Map over a seeded conversion
  corpus and returns the Conformist-vs-ACL upward-bias leak.  §3
- POST /reconciliation-audit — runs the pure Reconciliation Process over a seeded
  fault world: dual-write vs transactional outbox, reconciled side by side (W2).
- GET  /reconciliation — the same process-manager move over the REAL replay-job
  fan-out rows (read-only): proves the outbox invariant on actual data.
- POST /impression-audit — the third whole-value (W3): impression fidelity across
  the BC-7→BC-5 seam, refuse-to-conform ACL vs blended Conformist, plus the live
  unit-wall demonstration (cross-kind addition raising UnitMismatchError).

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
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..config import settings
from ..db import get_db
from ..domain import failclosed
from ..domain.counterexample import forge
from ..domain.ope import offpolicy_estimate
from ..domain.trust_budget import SCENARIOS, run_named_scenario
from ..domain.passport import scenarios as passport_scenarios, run_named_scenario as run_passport_scenario
from ..domain.contexts import CONTEXT_IDS, build_semantic_delta, context_for_attribute
from ..domain.diff import diff_policies
from ..domain.policy import Policy
from ..domain.replay import run_replay
from ..domain.impressions import (
    DEFAULT_AGENT_SHARE,
    DEFAULT_DEGRADED_FRACTION,
    audit_impressions,
)
from ..domain.reconciliation import (
    DEFAULT_AMBIGUOUS_TIMEOUT_FRACTION,
    DEFAULT_CRASH_FRACTION,
    DEFAULT_HARD_FAILURE_FRACTION,
    audit_reconciliation,
    reconcile_fanout,
)
from ..domain.translation import (
    DEFAULT_INCREMENTAL_FRACTION,
    audit_translation,
    demonstrate_unit_wall,
)
from ..models import OutboxEventRow, ReplayJobRow
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
_translation_audit_total = _meter.create_counter("momentforge_translation_audit_total")
_translation_audit_duration = _meter.create_histogram("momentforge_translation_audit_duration_ms")
_translation_leak = _meter.create_histogram("momentforge_translation_leak")
_reconciliation_audit_total = _meter.create_counter("momentforge_reconciliation_audit_total")
_reconciliation_audit_duration = _meter.create_histogram("momentforge_reconciliation_audit_duration_ms")
_reconciliation_silent = _meter.create_histogram("momentforge_reconciliation_silent_divergence")
_reconciliation_proof_total = _meter.create_counter("momentforge_reconciliation_proof_total")
_impression_audit_total = _meter.create_counter("momentforge_impression_audit_total")
_impression_audit_duration = _meter.create_histogram("momentforge_impression_audit_duration_ms")
_impression_refused = _meter.create_histogram("momentforge_impression_refused_units")

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


class ReconciliationAuditRequest(BaseModel):
    # Fault fractions are the labelled synthetic world; bounded and mutually
    # exclusive (their sum must stay ≤ 1.0 — checked in the handler, 422).
    seed: int = 42
    count: int = Field(default=200, ge=1, le=5000)  # bounded like the sim
    crash_fraction: float = Field(default=DEFAULT_CRASH_FRACTION, ge=0.0, le=1.0)
    ambiguous_timeout_fraction: float = Field(
        default=DEFAULT_AMBIGUOUS_TIMEOUT_FRACTION, ge=0.0, le=1.0)
    hard_failure_fraction: float = Field(
        default=DEFAULT_HARD_FAILURE_FRACTION, ge=0.0, le=1.0)


class ImpressionAuditRequest(BaseModel):
    # `impression` is the only modelled term on this seam; both fractions are the
    # labelled synthetic corpus parameters.
    term: str = "impression"
    seed: int = 42
    count: int = Field(default=200, ge=1, le=5000)  # bounded like the sim
    agent_share: float = Field(default=DEFAULT_AGENT_SHARE, ge=0.0, le=1.0)
    degraded_fraction: float = Field(default=DEFAULT_DEGRADED_FRACTION, ge=0.0, le=1.0)


class TranslationAuditRequest(BaseModel):
    # `conversion` is the only modelled seam (BC-5→BC-3); other terms are 422 (§3).
    term: str = "conversion"
    seed: int = 42
    count: int = Field(default=200, ge=1, le=5000)  # bounded like the sim
    incremental_fraction: float = Field(
        default=DEFAULT_INCREMENTAL_FRACTION, gt=0.0, le=1.0)


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


def _validate_injections(injections: list[str]) -> None:
    unknown = [i for i in injections if i not in failclosed.VALID_INJECTIONS]
    if unknown:
        raise _reject("unknown_injection",
                      f"unknown injection(s): {', '.join(unknown)}; "
                      f"valid: {', '.join(sorted(failclosed.VALID_INJECTIONS))}")


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
        # An override targeting a rule id that does not exist is almost certainly a
        # typo; silently ignoring it would run the sim on a policy the operator never
        # authored (surprising in a SAFETY tool). Fail closed with a clear 422 (F3).
        unknown_ids = [ov.get("id") for ov in proposed.rule_overrides
                       if ov.get("id") not in by_id]
        if unknown_ids:
            raise _reject("unknown_override_rule_id",
                          "rule_overrides reference unknown rule id(s): "
                          f"{', '.join(str(u) for u in unknown_ids)}")
        for ov in proposed.rule_overrides:
            rid = ov.get("id")
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
    _validate_injections(req.injections)  # 422 on an out-of-contract injection kind

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


# --------------------------------------------------------------------------- #
# C. Translation Map — the ACL seam made executable (§3)
# --------------------------------------------------------------------------- #
@router.post("/translation-audit")
def translation_audit(
    merchant_id: str,
    req: TranslationAuditRequest,
    request: Request,
) -> dict:
    """Thin, READ-ONLY, NON-persisting: runs the pure `audit_translation` over a
    seeded conversion corpus and returns the Conformist-vs-ACL upward-bias leak. No
    DB, no writes; deterministic (same body → identical bytes). No new decision logic
    in the money path (ADR-002) — the whole compute path is the one pure function."""
    t0 = time.perf_counter()

    # `conversion` is the only modelled polysemic seam; anything else is a 422 (F).
    if req.term != "conversion":
        raise _reject("unknown_term",
                      f"unknown term: {req.term!r}; only 'conversion' is modelled")

    with tracer.start_as_current_span("momentforge.translation_audit") as span:
        result = audit_translation(req.seed, req.count, req.incremental_fraction)
        span.set_attribute("momentforge.term", req.term)
        span.set_attribute("threshold.seed", req.seed)
        span.set_attribute("threshold.count", req.count)
        span.set_attribute("momentforge.recorded_lift", result["recorded_lift"])
        span.set_attribute("momentforge.incremental_lift", result["incremental_lift"])
        span.set_attribute("momentforge.leaked_conversions", result["leaked_conversions"])

    duration_ms = (time.perf_counter() - t0) * 1000.0
    _translation_audit_total.add(1, {"result": "ok"})
    _translation_audit_duration.record(duration_ms)
    _translation_leak.record(result["leaked_conversions"])
    log.info(
        '{"route":"translation-audit","merchant_id":"%s","request_id":"%s",'
        '"term":"%s","seed":%d,"count":%d,"recorded_lift":%d,"incremental_lift":%d,'
        '"leaked_conversions":%d,"duration_ms":%.2f}',
        merchant_id, _rid(request), req.term, req.seed, req.count,
        result["recorded_lift"], result["incremental_lift"],
        result["leaked_conversions"], duration_ms,
    )

    return result


# --------------------------------------------------------------------------- #
# D. Reconciliation Process — the cross-aggregate invariant closed (W2)
# --------------------------------------------------------------------------- #
@router.post("/reconciliation-audit")
def reconciliation_audit(
    merchant_id: str,
    req: ReconciliationAuditRequest,
    request: Request,
) -> dict:
    """Thin, READ-ONLY, NON-persisting: runs the pure Reconciliation Process over a
    seeded fault world — the SAME faults under dual-write vs the transactional
    outbox — and returns both reconciled reports. No DB, no writes; deterministic
    (same body → identical bytes). ADR-002 intact: the compute path is one pure
    function."""
    t0 = time.perf_counter()

    fraction_sum = (req.crash_fraction + req.ambiguous_timeout_fraction
                    + req.hard_failure_fraction)
    if fraction_sum > 1.0:
        raise _reject("fault_fractions_sum",
                      f"fault fractions must sum to at most 1.0 (got {fraction_sum:.3f})")

    with tracer.start_as_current_span("momentforge.reconciliation_audit") as span:
        result = audit_reconciliation(
            req.seed, req.count, req.crash_fraction,
            req.ambiguous_timeout_fraction, req.hard_failure_fraction)
        silent_dual = result["delta"]["silent_divergence_dual_write"]
        silent_outbox = result["delta"]["silent_divergence_outbox"]
        span.set_attribute("threshold.seed", req.seed)
        span.set_attribute("threshold.count", req.count)
        span.set_attribute("momentforge.silent_divergence_dual_write", silent_dual)
        span.set_attribute("momentforge.silent_divergence_outbox", silent_outbox)

    duration_ms = (time.perf_counter() - t0) * 1000.0
    _reconciliation_audit_total.add(1, {"result": "ok"})
    _reconciliation_audit_duration.record(duration_ms)
    _reconciliation_silent.record(silent_dual, {"strategy": "dual_write"})
    _reconciliation_silent.record(silent_outbox, {"strategy": "outbox"})
    log.info(
        '{"route":"reconciliation-audit","merchant_id":"%s","request_id":"%s",'
        '"seed":%d,"count":%d,"silent_dual_write":%d,"silent_outbox":%d,'
        '"duration_ms":%.2f}',
        merchant_id, _rid(request), req.seed, req.count,
        silent_dual, silent_outbox, duration_ms,
    )

    return result


@router.post("/impression-audit")
def impression_audit(
    merchant_id: str,
    req: ImpressionAuditRequest,
    request: Request,
) -> dict:
    """Thin, READ-ONLY, NON-persisting: runs the pure impression-fidelity audit
    over a seeded corpus (refuse-to-conform ACL vs blended Conformist) and attaches
    the live unit-wall demonstration — the illegal cross-kind addition is actually
    performed and the caught UnitMismatchError reported. No DB, no writes;
    deterministic (same body → identical bytes)."""
    t0 = time.perf_counter()

    if req.term != "impression":
        raise _reject("unknown_term",
                      f"unknown term: {req.term!r}; only 'impression' is modelled")

    with tracer.start_as_current_span("momentforge.impression_audit") as span:
        result = audit_impressions(
            req.seed, req.count, req.agent_share, req.degraded_fraction)
        result["unit_wall"] = demonstrate_unit_wall()
        span.set_attribute("threshold.seed", req.seed)
        span.set_attribute("threshold.count", req.count)
        span.set_attribute("momentforge.refused_units", result["acl_result"]["refused"])
        span.set_attribute("momentforge.blended_units", result["blended_units"])

    duration_ms = (time.perf_counter() - t0) * 1000.0
    _impression_audit_total.add(1, {"result": "ok"})
    _impression_audit_duration.record(duration_ms)
    _impression_refused.record(result["acl_result"]["refused"])
    log.info(
        '{"route":"impression-audit","merchant_id":"%s","request_id":"%s",'
        '"seed":%d,"count":%d,"counted":%d,"refused":%d,"duration_ms":%.2f}',
        merchant_id, _rid(request), req.seed, req.count,
        result["acl_result"]["counted"], result["acl_result"]["refused"], duration_ms,
    )

    return result


@router.get("/reconciliation")
def reconciliation_proof(
    merchant_id: str,
    request: Request,
    db: Session = Depends(get_db),
) -> dict:
    """The same process-manager move over REAL rows, read-only: for every replay job
    this merchant actually ran, prove the outbox fan-out is complete and every row is
    in a legal, VISIBLE state. No synthetic input on this lane at all."""
    t0 = time.perf_counter()

    job_rows = db.execute(
        select(ReplayJobRow).where(ReplayJobRow.merchant_id == merchant_id)
    ).scalars().all()
    event_rows = db.execute(
        select(OutboxEventRow).where(OutboxEventRow.merchant_id == merchant_id)
    ).scalars().all()

    with tracer.start_as_current_span("momentforge.reconciliation_proof") as span:
        result = reconcile_fanout(
            [{"id": j.id, "verdict": j.verdict} for j in job_rows],
            [{"job_id": e.job_id, "event_type": e.event_type,
              "target": e.target, "status": e.status} for e in event_rows],
        )
        span.set_attribute("momentforge.total_jobs", result["total_jobs"])
        span.set_attribute("momentforge.invariant_holds", result["invariant_holds"])

    duration_ms = (time.perf_counter() - t0) * 1000.0
    _reconciliation_proof_total.add(1, {"holds": str(result["invariant_holds"]).lower()})
    log.info(
        '{"route":"reconciliation","merchant_id":"%s","request_id":"%s",'
        '"total_jobs":%d,"silent_divergence":%d,"invariant_holds":%s,'
        '"duration_ms":%.2f}',
        merchant_id, _rid(request), result["total_jobs"],
        result["silent_divergence"], str(result["invariant_holds"]).lower(),
        duration_ms,
    )

    return {"merchant_id": merchant_id, **result}


class OpeEstimateRequest(BaseModel):
    """Logged decisions for an off-policy value estimate. One entry per session:
    the observed reward, the NEW policy's action probability (target), the OLD
    policy's logged probability (logging), and an optional reward-model prediction
    for the doubly-robust estimator."""
    rewards: list[float] = Field(min_length=0, max_length=100_000)
    target_p: list[float]
    logging_p: list[float]
    reward_hat: list[float] | None = None
    ess_floor: int = Field(default=30, ge=1, le=100_000)


@router.post("/ope-estimate")
def ope_estimate(
    merchant_id: str,
    req: OpeEstimateRequest,
    request: Request,
) -> dict:
    """Pre-holdout off-policy value estimate (SNIPS / doubly-robust) with an
    effective-sample-size gate. Refuses (INSUFFICIENT_EVIDENCE) when support is
    thin — and never replaces the mandatory holdout."""
    if not (len(req.target_p) == len(req.logging_p) == len(req.rewards)):
        raise _reject("length_mismatch",
                      "rewards, target_p and logging_p must be the same length")
    out = offpolicy_estimate(
        req.rewards, req.target_p, req.logging_p,
        reward_hat=req.reward_hat, ess_floor=req.ess_floor,
    )
    log.info(
        'ope_estimate merchant=%s rid=%s verdict=%s method=%s n=%d ess=%.2f',
        merchant_id, _rid(request), out["verdict"], out.get("method"),
        out["n"], out["ess"],
    )
    return {"merchant_id": merchant_id, **out}


class CounterexampleRequest(BaseModel):
    """Run the adversarial harness over the merchant's live policy. The proposer
    enumerates adversarial fixtures deterministically; the engine judges them."""
    base_version: str = "V17"
    session_seed: int = Field(default=42, ge=0, le=1_000_000)
    session_count: int = Field(default=200, ge=1, le=5_000)


@router.post("/counterexamples")
def counterexamples(
    merchant_id: str,
    req: CounterexampleRequest,
    request: Request,
    db: Session = Depends(get_db),
) -> dict:
    """Counterexample Forge — a proposer enumerates adversarial candidate fixtures,
    each probing one invariant class, and the real deterministic engine judges every
    one (CONTAINED / SURFACED / SAFE / GAP). Read-only and non-persisting; the LLM is
    never in the critical path. On a correct engine the GAP set is empty."""
    base = load_policy(db, merchant_id, req.base_version)  # 404 (F2)
    with tracer.start_as_current_span("momentforge.counterexamples") as span:
        result = forge(base, req.session_seed, req.session_count)
        span.set_attribute("threshold.base_version", req.base_version)
        span.set_attribute("forge.total", result["summary"]["total"])
        span.set_attribute("forge.gaps", result["summary"]["gap"])
        span.set_attribute("forge.no_gaps", result["summary"]["no_gaps"])
    log.info(
        'counterexamples merchant=%s rid=%s base=%s total=%d contained=%d surfaced=%d safe=%d gaps=%d',
        merchant_id, _rid(request), req.base_version, result["summary"]["total"],
        result["summary"]["contained"], result["summary"]["surfaced"],
        result["summary"]["safe"], result["summary"]["gap"],
    )
    return {"merchant_id": merchant_id, **result}


class TrustBudgetRequest(BaseModel):
    """Run a named Trust Budget scenario through the deterministic attention gate."""
    scenario: str = "serial_dismisser"


@router.post("/trust-budget")
def trust_budget(
    merchant_id: str,
    req: TrustBudgetRequest,
    request: Request,
) -> dict:
    """Trust Budget — attention as a scarce, deterministic budget. A stream of
    candidate offers is judged SHOW / DEFER / SUPPRESS by a pure function of the
    interaction history; 'no experience' is an intentional decision. Read-only,
    non-persisting, no LLM in the path."""
    if req.scenario not in SCENARIOS:
        raise _reject("unknown_scenario",
                      f"scenario must be one of {sorted(SCENARIOS)}")
    result = run_named_scenario(req.scenario)
    log.info(
        'trust_budget merchant=%s rid=%s scenario=%s show=%d defer=%d suppress=%d',
        merchant_id, _rid(request), req.scenario, result["summary"]["show"],
        result["summary"]["defer"], result["summary"]["suppress"],
    )
    return {"merchant_id": merchant_id, "scenarios": sorted(SCENARIOS), **result}


class PassportRequest(BaseModel):
    """Run a named Agentic Transaction Passport scenario through the anti-corruption layer."""
    scenario: str = "prompt_injection"


@router.post("/passport")
def passport(
    merchant_id: str,
    req: PassportRequest,
    request: Request,
) -> dict:
    """Agentic Transaction Passport — an untrusted, agent-authored packet of intent
    passes through a deterministic anti-corruption layer: a field reaches the
    transaction only if it is supported, valid, customer-confirmed, in-window, and
    (if sensitive) consented. Read-only, non-persisting, no LLM in the path."""
    secret = settings.audit_secret
    if req.scenario not in passport_scenarios(secret):
        raise _reject("unknown_scenario",
                      f"scenario must be one of {sorted(passport_scenarios(secret))}")
    result = run_passport_scenario(req.scenario, secret)
    log.info(
        'passport merchant=%s rid=%s scenario=%s valid=%s admitted=%d stripped=%d rejected=%d',
        merchant_id, _rid(request), req.scenario, result["outcome"]["passport_valid"],
        result["summary"]["admitted"], result["summary"]["stripped"], result["summary"]["rejected"],
    )
    return {"merchant_id": merchant_id, "scenarios": sorted(passport_scenarios(secret)), **result}

"""Reconciliation Process — the cross-aggregate invariant made CHECKABLE (Case B).

PURE, deterministic, no I/O / no LLM / no wall-clock — mirrors `translation.py` /
`sessions.py` discipline exactly. This module closes W2 of the self-critique in
docs/MOMENT_FORGE_INTEGRATION_CASES.md: the load-bearing invariants span aggregates
(`earned ⇒ issued`), Vernon is explicit they must be eventually consistent via domain
events + a separate transaction (Red Book, *Use Eventual Consistency Outside the
Boundary*), and until now the repo's transactional outbox fanned events out but
NOTHING consumed them to close a multi-step invariant. The Reconciliation Process is
that consumer: a process manager (Red Book ch. 12) that replays the event stream and
PROVES, per earn, that the lifecycle closed — or names exactly how it diverged.

The invariant under proof (Case B, `earned ⇒ issued`):

    every REWARD_EARNED  ⇒  exactly one REWARD_ISSUED  ∨  a VISIBLE dead-letter

Two integration strategies over the SAME seeded fault world (counterfactual
isolation — the same move as "revert the operator and show what widens",
constraints.py, and "revert the ACL and show what leaks", translation.py):

  * `dual_write` — THE BUG. The earn commits, then the issue intent is published in
    a SEPARATE step. A crash between the two loses the intent silently; an ambiguous
    timeout retried without an idempotency key issues twice. Nothing durable records
    that either happened.
  * `outbox`     — THE FIX the repo already ships (outbox.py [REPO]). The issue
    intent is written in the SAME transaction as the earn, a worker drains it with
    capped retries, and a persistent downstream failure becomes a DEAD_LETTER —
    divergence still possible, but never SILENT. The issuing consumer is idempotent
    on earn_id, the same dedup discipline as conversions.py [REPO].

The reconciler then classifies every earn: CONSISTENT, ORPHANED_EARN (silent),
DOUBLE_ISSUE (silent), or VISIBLE_DEAD_LETTER (divergent but actionable). The claim
the audit proves is NOT "the outbox never fails" — it is "under the outbox, failure
is visible; under dual-write, it is silent". Silent divergence is the disease; the
outbox turns it into a page, the reconciler turns it into a proof.

HONESTY. The outbox mechanism and its PENDING → PUBLISHED → DEAD_LETTER states are
[REPO] (outbox.py, tested). The APPLICATION to reward issuance is [HYPOTHESIS]
(`26` #4) — Rokt's reward fulfilment internals are not public. The three fault
fractions are [SYNTHETIC], labelled exactly like sessions.py "~18% omit cc_bin" and
translation.py `incremental_fraction`. No Rokt-internal number is asserted; every
count is computed live by running both lifecycles, never hand-authored.

This module also carries the REAL-data lane: `reconcile_fanout` applies the same
process-manager move to the actual replay-job fan-out (ReplayJobRow ⟷ OutboxEventRow,
read-only, rows passed in as plain dicts so the module stays pure). That is the piece
that makes the already-shipped outbox *do domain work*, not just fan out.
"""
from __future__ import annotations

import random
from dataclasses import dataclass
from enum import Enum
from typing import Sequence

BOUNDARY = "BC-4 Loyalty ⟷ Fulfilment/Ledger"
PATTERN = "Process Manager over a Transactional Outbox"
INVARIANT = "every earned reward is issued exactly once, or its failure is VISIBLE"
GROUNDING = (
    "The transactional outbox and its PENDING → PUBLISHED → DEAD_LETTER lifecycle are "
    "built and tested here (outbox.py). Applying it to reward issuance is [HYPOTHESIS] "
    "— the mechanism is real, the reward ledger is not claimed to be Rokt's. The "
    "idempotent consumer mirrors the real conversion dedup (conversions.py)."
)

# Mirrors outbox.MAX_ATTEMPTS (asserted equal in tests — the domain module stays
# import-pure and cannot pull the effectful shell in here).
MAX_ATTEMPTS = 5

# THE SYNTHETIC INPUTS — labelled like sessions.py "~18% of sessions omit cc_bin".
# Per-earn probabilities of each fault in the seeded world. Mutually exclusive.
DEFAULT_CRASH_FRACTION = 0.08              # process dies between earn-commit and publish
DEFAULT_AMBIGUOUS_TIMEOUT_FRACTION = 0.06  # downstream issued, caller saw a timeout
DEFAULT_HARD_FAILURE_FRACTION = 0.03       # downstream rejects on every attempt

_SYNTHETIC_LABEL = (
    "[SYNTHETIC] per-earn fault probability. Real incident rates are unobservable from "
    "outside; these exist only so the mechanism is bit-for-bit replayable — labelled "
    "exactly like the engine's '~18% omit cc_bin' synthetic. No Rokt-internal number "
    "is asserted."
)


class RewardStatus(str, Enum):
    """Whole-value for Case B (the §2.2 fix): the lifecycle stage is stamped in the
    type, so "reward" can never hide WHICH of the three states you hold. The TYPE
    names the full lifecycle; the reconciler PROVES only earned ⇒ issued —
    REDEEMABLE's expiry/clawback rules would need a third aggregate this module
    refuses to fake, so no invariant over it is claimed."""

    EARNED = "earned"          # the shopper qualified — a fact in BC-4 Loyalty
    ISSUED = "issued"          # the reward is materialized — a booked liability in Fulfilment
    REDEEMABLE = "redeemable"  # currently usable (not expired / clawed back) — named, not proven


class Strategy(str, Enum):
    DUAL_WRITE = "dual_write"  # the bug: earn and issue-intent in separate steps
    OUTBOX = "outbox"          # the fix the repo ships: atomic intent + drained worker


class FaultKind(str, Enum):
    NONE = "none"
    CRASH_AFTER_EARN = "crash_after_earn"
    AMBIGUOUS_TIMEOUT = "ambiguous_timeout"
    DOWNSTREAM_HARD_FAILURE = "downstream_hard_failure"


class ReconClass(str, Enum):
    """The reconciler's verdict for one earn's lifecycle."""

    CONSISTENT = "consistent"                  # exactly one issue — the invariant holds
    ORPHANED_EARN = "orphaned_earn"            # SILENT: qualified, never received
    DOUBLE_ISSUE = "double_issue"              # SILENT: one earn, two liabilities
    VISIBLE_DEAD_LETTER = "visible_dead_letter"  # divergent but VISIBLE — actionable
    ISSUE_WITHOUT_EARN = "issue_without_earn"  # should be impossible; checked anyway


SILENT_CLASSES = (ReconClass.ORPHANED_EARN, ReconClass.DOUBLE_ISSUE)

# Fact names are past-tense domain events (the doc-27 §5 catalog style).
EARNED_FACT = "REWARD_EARNED"
INTENT_FACT = "ISSUE_INTENT_WRITTEN"   # outbox only — atomic with the earn
ISSUED_FACT = "REWARD_ISSUED"
DEAD_LETTER_FACT = "ISSUE_DEAD_LETTERED"


@dataclass(frozen=True)
class LifecycleEvent:
    """One past-tense fact in a reward lifecycle. Frozen — events are history."""

    earn_id: str
    fact: str
    strategy: Strategy


# --------------------------------------------------------------------------- #
# The seeded fault world (reuses the sessions.py seeding discipline)
# --------------------------------------------------------------------------- #
def generate_fault_world(
    seed: int,
    count: int,
    crash_fraction: float = DEFAULT_CRASH_FRACTION,
    ambiguous_timeout_fraction: float = DEFAULT_AMBIGUOUS_TIMEOUT_FRACTION,
    hard_failure_fraction: float = DEFAULT_HARD_FAILURE_FRACTION,
) -> list[FaultKind]:
    """Deterministic per-earn fault assignment. Same (seed, count, fractions) →
    identical world → replayable. The SAME world is fed to both strategies, so the
    only variable is the integration pattern — counterfactual isolation."""
    if crash_fraction + ambiguous_timeout_fraction + hard_failure_fraction > 1.0:
        raise ValueError("fault fractions must sum to at most 1.0")
    rng = random.Random(seed)
    world: list[FaultKind] = []
    for _ in range(count):
        r = rng.random()
        if r < crash_fraction:
            world.append(FaultKind.CRASH_AFTER_EARN)
        elif r < crash_fraction + ambiguous_timeout_fraction:
            world.append(FaultKind.AMBIGUOUS_TIMEOUT)
        elif r < crash_fraction + ambiguous_timeout_fraction + hard_failure_fraction:
            world.append(FaultKind.DOWNSTREAM_HARD_FAILURE)
        else:
            world.append(FaultKind.NONE)
    return world


# --------------------------------------------------------------------------- #
# The two lifecycles over the same world
# --------------------------------------------------------------------------- #
def run_lifecycle(strategy: Strategy, world: Sequence[FaultKind]) -> list[LifecycleEvent]:
    """Replay every earn through the chosen integration strategy and emit the
    past-tense facts that actually become durable. What is NOT emitted is the point:
    dual-write's lost intents leave no trace — that is what "silent" means."""
    events: list[LifecycleEvent] = []
    for i, fault in enumerate(world):
        earn_id = f"earn-{i:04d}"

        def emit(fact: str) -> None:
            events.append(LifecycleEvent(earn_id=earn_id, fact=fact, strategy=strategy))

        # The earn transaction commits in BOTH strategies — the divergence is
        # entirely in how the issue intent crosses to the Fulfilment aggregate.
        emit(EARNED_FACT)

        if strategy is Strategy.DUAL_WRITE:
            if fault is FaultKind.CRASH_AFTER_EARN:
                # The intent lived only in process memory. The crash erases it.
                continue
            if fault is FaultKind.AMBIGUOUS_TIMEOUT:
                # Downstream issued, the caller saw a timeout and retried blindly
                # (no idempotency key) → two booked liabilities for one earn.
                emit(ISSUED_FACT)
                emit(ISSUED_FACT)
                continue
            if fault is FaultKind.DOWNSTREAM_HARD_FAILURE:
                # In-process retries exhaust; the process moves on. Nothing durable
                # records that an issue was ever owed.
                continue
            emit(ISSUED_FACT)
        else:  # Strategy.OUTBOX
            # The intent is written in the SAME transaction as the earn — it
            # survives any crash by construction (outbox.enqueue [REPO]).
            emit(INTENT_FACT)
            if fault is FaultKind.CRASH_AFTER_EARN:
                # The worker finds the durable intent after restart and issues.
                emit(ISSUED_FACT)
                continue
            if fault is FaultKind.AMBIGUOUS_TIMEOUT:
                # The retry hits an idempotent consumer keyed on earn_id (the
                # conversions.py dedup discipline) → exactly one issue.
                emit(ISSUED_FACT)
                continue
            if fault is FaultKind.DOWNSTREAM_HARD_FAILURE:
                # MAX_ATTEMPTS capped-backoff retries, then a VISIBLE dead-letter
                # (outbox.drain_once [REPO]) — divergent, but never silent.
                emit(DEAD_LETTER_FACT)
                continue
            emit(ISSUED_FACT)
    return events


# --------------------------------------------------------------------------- #
# The Reconciliation Process — the process manager that closes the invariant
# --------------------------------------------------------------------------- #
_EXAMPLE_CAP = 12  # bounded per-class examples so a 5000-earn audit stays small


def reconcile(events: Sequence[LifecycleEvent]) -> dict:
    """Consume the event stream and classify every earn's lifecycle against the
    invariant. This is the piece Vernon says must exist for a cross-aggregate rule:
    a separate process that closes eventual consistency, not a shared field."""
    earned: dict[str, int] = {}
    issued: dict[str, int] = {}
    dead: dict[str, int] = {}
    order: list[str] = []
    for e in events:
        if e.fact == EARNED_FACT:
            if e.earn_id not in earned:
                order.append(e.earn_id)
            earned[e.earn_id] = earned.get(e.earn_id, 0) + 1
        elif e.fact == ISSUED_FACT:
            issued[e.earn_id] = issued.get(e.earn_id, 0) + 1
        elif e.fact == DEAD_LETTER_FACT:
            dead[e.earn_id] = dead.get(e.earn_id, 0) + 1

    classes: dict[str, int] = {c.value: 0 for c in ReconClass}
    examples: dict[str, list[str]] = {c.value: [] for c in ReconClass}

    def classify(earn_id: str, cls: ReconClass) -> None:
        classes[cls.value] += 1
        if len(examples[cls.value]) < _EXAMPLE_CAP:
            examples[cls.value].append(earn_id)

    for earn_id in order:
        n_issued = issued.get(earn_id, 0)
        if n_issued == 1:
            classify(earn_id, ReconClass.CONSISTENT)
        elif n_issued > 1:
            classify(earn_id, ReconClass.DOUBLE_ISSUE)
        elif dead.get(earn_id, 0) > 0:
            classify(earn_id, ReconClass.VISIBLE_DEAD_LETTER)
        else:
            classify(earn_id, ReconClass.ORPHANED_EARN)

    # An issue with no matching earn should be structurally impossible; a real
    # reconciler checks anyway — trusting "impossible" is how ledgers drift.
    for earn_id in issued:
        if earn_id not in earned:
            classify(earn_id, ReconClass.ISSUE_WITHOUT_EARN)

    silent = sum(classes[c.value] for c in SILENT_CLASSES) + classes[
        ReconClass.ISSUE_WITHOUT_EARN.value
    ]
    return {
        "total_earns": len(order),
        "classes": classes,
        "examples": {k: v for k, v in examples.items() if v},
        "silent_divergence": silent,
        "visible_divergence": classes[ReconClass.VISIBLE_DEAD_LETTER.value],
        "invariant_holds": silent == 0,
    }


# --------------------------------------------------------------------------- #
# The audit: same world, both strategies, reconciled side by side
# --------------------------------------------------------------------------- #
def audit_reconciliation(
    seed: int,
    count: int,
    crash_fraction: float = DEFAULT_CRASH_FRACTION,
    ambiguous_timeout_fraction: float = DEFAULT_AMBIGUOUS_TIMEOUT_FRACTION,
    hard_failure_fraction: float = DEFAULT_HARD_FAILURE_FRACTION,
) -> dict:
    """Run the SAME seeded fault world through both integration strategies and
    reconcile each. The delta in SILENT divergence is the entire argument for the
    transactional outbox — a real number from real code, not asserted."""
    world = generate_fault_world(
        seed, count, crash_fraction, ambiguous_timeout_fraction, hard_failure_fraction
    )
    fault_census = {k.value: 0 for k in FaultKind}
    for f in world:
        fault_census[f.value] += 1

    reports = {
        s.value: reconcile(run_lifecycle(s, world))
        for s in (Strategy.DUAL_WRITE, Strategy.OUTBOX)
    }
    dual = reports[Strategy.DUAL_WRITE.value]
    outb = reports[Strategy.OUTBOX.value]

    return {
        "invariant": INVARIANT,
        "pattern": PATTERN,
        "boundary": BOUNDARY,
        "seed": seed,
        "count": count,
        "fault_census": fault_census,
        "strategies": reports,
        "delta": {
            "silent_divergence_dual_write": dual["silent_divergence"],
            "silent_divergence_outbox": outb["silent_divergence"],
            "caught_by_reconciliation": dual["silent_divergence"],
            "made_visible_by_outbox": outb["visible_divergence"],
        },
        "synthetic_inputs": [
            {"name": "crash_fraction", "value": crash_fraction, "label": _SYNTHETIC_LABEL},
            {
                "name": "ambiguous_timeout_fraction",
                "value": ambiguous_timeout_fraction,
                "label": _SYNTHETIC_LABEL,
            },
            {
                "name": "hard_failure_fraction",
                "value": hard_failure_fraction,
                "label": _SYNTHETIC_LABEL,
            },
        ],
        "grounding": GROUNDING,
        "note": (
            f"Same {count} earns, same seeded faults, two integration patterns. "
            f"Dual-write leaves {dual['silent_divergence']} earns silently diverged "
            f"({dual['classes'][ReconClass.ORPHANED_EARN.value]} orphaned, "
            f"{dual['classes'][ReconClass.DOUBLE_ISSUE.value]} double-issued); the "
            f"transactional outbox leaves {outb['silent_divergence']} — its "
            f"{outb['visible_divergence']} failures are dead-letters a human can see. "
            "The outbox mechanism is [REPO]; the reward application is [HYPOTHESIS]; "
            "the fault fractions are [SYNTHETIC] and labelled. Computed live, not "
            "asserted."
        ),
    }


# --------------------------------------------------------------------------- #
# The REAL-data lane: reconcile the actual replay-job fan-out (read-only)
# --------------------------------------------------------------------------- #
# Must stay in lockstep with outbox.events_for_job — asserted equal in tests.
EXPECTED_FANOUT: tuple[tuple[str, str], ...] = (
    ("analytics", "REPLAY_COMPLETED"),
    ("billing", "VERDICT_ISSUED"),
    ("partner", "VERDICT_ISSUED"),
)

FANOUT_CONSISTENT = "consistent"
FANOUT_IN_FLIGHT = "in_flight"
FANOUT_DEAD_LETTER = "visible_dead_letter"
FANOUT_MISSING = "missing_event"


def reconcile_fanout(jobs: Sequence[dict], events: Sequence[dict]) -> dict:
    """The same process-manager move over REAL rows: prove every completed replay
    job's fan-out (analytics/billing/partner) is complete and in a legal state.
    MISSING_EVENT is the dual-write ghost — with the transactional outbox it is
    structurally impossible unless rows were deleted, which is exactly why checking
    for it is the proof and not paranoia. Inputs are plain dicts (job: id, verdict;
    event: job_id, event_type, target, status) so this stays pure."""
    by_job: dict[str, list[dict]] = {}
    for e in events:
        by_job.setdefault(e["job_id"], []).append(e)

    classes = {
        FANOUT_CONSISTENT: 0,
        FANOUT_IN_FLIGHT: 0,
        FANOUT_DEAD_LETTER: 0,
        FANOUT_MISSING: 0,
    }
    job_reports: list[dict] = []
    for job in jobs:
        rows = by_job.get(job["id"], [])
        present = {(r["target"], r["event_type"]) for r in rows}
        missing = [f"{t}:{et}" for (t, et) in EXPECTED_FANOUT if (t, et) not in present]
        statuses = [r["status"] for r in rows]
        if missing:
            cls = FANOUT_MISSING
        elif any(s == "DEAD_LETTER" for s in statuses):
            cls = FANOUT_DEAD_LETTER
        elif any(s == "PENDING" for s in statuses):
            cls = FANOUT_IN_FLIGHT
        else:
            cls = FANOUT_CONSISTENT
        classes[cls] += 1
        job_reports.append(
            {
                "job_id": job["id"],
                "verdict": job.get("verdict"),
                "class": cls,
                "missing": missing,
                "event_statuses": sorted(statuses),
            }
        )

    silent = classes[FANOUT_MISSING]
    return {
        "invariant": (
            "every completed replay job has its full outbox fan-out "
            "(analytics + billing + partner), each row PENDING, PUBLISHED or a "
            "VISIBLE dead-letter — never absent"
        ),
        "pattern": PATTERN,
        "total_jobs": len(jobs),
        "classes": classes,
        "jobs": job_reports,
        "silent_divergence": silent,
        "invariant_holds": silent == 0,
        "grounding": (
            "Read-only over the real replay_jobs and outbox_events tables — the rows "
            "the shipped engine actually wrote (outbox.py, routers/replay.py). This "
            "lane contains no synthetic input at all."
        ),
    }

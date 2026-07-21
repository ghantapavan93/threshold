"""Counterexample Forge — a standing adversarial harness over the engine.

The strongest AI addition in the Builder Vision, kept honest. A PROPOSER enumerates
adversarial candidate fixtures — each crafted to probe one invariant class — and the
real deterministic Threshold engine JUDGES every one. The proposer only *suggests*
what to try; it never rules on pass/fail. That split is the whole point: an LLM (or,
here, a reproducible seeded enumerator) can broaden the search for failure modes, but
only the deterministic engine may decide safety, so the harness stays bit-for-bit
replayable and CI-safe — no model in the critical path.

Honest labels (the Vision's truth discipline):
  - The proposer today is a DETERMINISTIC enumerator (MODELED), not an LLM, so every
    run reproduces exactly. An LLM proposer is a labelled future extension (HYPOTHESIS).
  - The judge is the PRODUCTION engine (LIVE): evaluate / evaluate_constraints /
    failclosed.prove. Nothing here re-implements a decision.

Per-candidate outcome:
  CONTAINED — a hard guard fired (a constraint FAIL) or a fault fell closed to
              No Offer Rendered. The adversarial attempt was blocked.
  SURFACED  — a visible, non-gating signal (INFO/WARN): seen and routed, not blocked
              (e.g. a deliberate, visible eligibility widening — the holdout's job).
  SAFE      — no guard needed; the engine's own semantics already prevent harm
              (e.g. an absent attribute can only narrow, never widen).
  GAP       — real harm with NO guard: a genuine bug.

GAP is not decorative. For the missing-attribute family a GROUND-TRUTH ORACLE —
computed by direct simulation, independent of the guard code — reports which
absent-attribute sessions were silently widened. If the oracle sees harm and the
guard did NOT fire, the forge emits GAP. On a correct engine the two always agree
(guard fires -> CONTAINED); the instant the guard regresses, the oracle still sees
the harm and the GAP surfaces. This is exactly the class of bug that the
rename-evasion fail-open once was.
"""
from __future__ import annotations

from dataclasses import dataclass

from . import failclosed
from .constraints import evaluate_constraints
from .diff import diff_policies
from .evaluator import _present, evaluate
from .policy import Policy, Rule
from .sessions import generate_sessions


@dataclass(frozen=True)
class Candidate:
    id: str
    category: str          # the invariant class being probed
    target: str            # the specific guard / behaviour it attacks
    rationale: str         # why this fixture is adversarial (the proposer's reasoning)
    outcome: str           # CONTAINED | SURFACED | SAFE | GAP
    guard: str | None      # which guard actually responded, if any
    evidence: str          # what the engine returned, in one line

    def as_dict(self) -> dict:
        return {
            "id": self.id,
            "category": self.category,
            "target": self.target,
            "rationale": self.rationale,
            "outcome": self.outcome,
            "guard": self.guard,
            "evidence": self.evidence,
        }


def _classify(guard_fired: bool, soft_signal: bool, harm_present: bool) -> str:
    """The whole ruling, in four lines. Guard beats everything; real harm with no
    guard is a GAP; a visible non-gating signal is SURFACED; otherwise SAFE."""
    if guard_fired:
        return "CONTAINED"
    if harm_present:
        return "GAP"
    if soft_signal:
        return "SURFACED"
    return "SAFE"


def _decisions(base: Policy, proposed: Policy, sessions: list[dict]):
    bd = {s["session_id"]: evaluate(s["attributes"], base) for s in sessions}
    pd = {s["session_id"]: evaluate(s["attributes"], proposed) for s in sessions}
    return bd, pd


def _judge_constraints(base: Policy, proposed: Policy, sessions: list[dict]):
    bd, pd = _decisions(base, proposed, sessions)
    results, viol = evaluate_constraints(base, proposed, sessions, bd, pd, diff_policies(base, proposed))
    return {c.key: c for c in results}, viol


def missing_attr_harm(base: Policy, proposed: Policy, sessions: list[dict], attr: str) -> list[str]:
    """GROUND TRUTH, independent of any guard: sessions MISSING `attr` that flip
    base=no_offer -> proposed=offer. A non-empty result means the change widened
    eligibility for absent-data sessions — precisely the harm the trap must catch."""
    out: list[str] = []
    for s in sessions:
        a = s["attributes"]
        if _present(a, attr):
            continue  # only absent-attribute sessions can be silently widened
        if evaluate(a, base).decision == "no_offer" and evaluate(a, proposed).decision == "offer":
            out.append(s["session_id"])
    return out


def _mutate(base: Policy, **changes) -> Policy:
    p = base.model_copy(deep=True)
    for k, v in changes.items():
        setattr(p, k, v)
    p.policy_version = base.policy_version + "-adv"
    return p


def _with_rules(base: Policy, rules: list[Rule]) -> Policy:
    return _mutate(base, eligibility_rules=rules)


def _set_op(rules: list[Rule], rule_id: str, op: str, value=None) -> list[Rule]:
    out = []
    for r in rules:
        if r.id == rule_id:
            out.append(r.model_copy(update={"op": op, **({"value": value} if value is not None else {})}))
        else:
            out.append(r.model_copy(deep=True))
    return out


# ── The proposer: adversarial candidates, each targeting one invariant class ──
# Each entry builds an adversarial `proposed` policy (and/or a crafted session),
# then the JUDGE runs the real engine and classifies. The proposer supplies only
# the fixture + its reasoning; it asserts nothing about the outcome.

def forge(base: Policy, session_seed: int = 42, session_count: int = 200) -> dict:
    sessions = generate_sessions(session_seed, session_count)
    base_rules = base.eligibility_rules
    cc = "customer.cc_bin"
    candidates: list[Candidate] = []

    def constraint_probe(cid, category, target, rationale, proposed, *, guard_key,
                         hard=True, harm_attr=None):
        by, viol = _judge_constraints(base, proposed, sessions)
        g = by.get(guard_key)
        res = g.result if g else "PASS"
        guard_fired = res == "FAIL"
        soft_signal = res in ("INFO", "WARN")
        harm = bool(missing_attr_harm(base, proposed, sessions, harm_attr)) if harm_attr else False
        outcome = _classify(guard_fired and hard, soft_signal, harm)
        n = len(missing_attr_harm(base, proposed, sessions, harm_attr)) if harm_attr else 0
        ev = (f"{guard_key}={res}"
              + (f"; {n} absent-'{harm_attr}' sessions widened" if harm_attr else "")
              + (f"; violations={len(viol)}" if viol else ""))
        candidates.append(Candidate(cid, category, target, rationale, outcome,
                                    guard_key if (guard_fired or soft_signal) else None, ev))

    # 1) The star trap, spelled three ways — all must be CONTAINED (id-independent).
    flip = _with_rules(base, _set_op(base_rules, "r4", "exclude_is_in"))
    constraint_probe("operator_flip", "missing_value_semantics", "missing_attribute_semantics",
                     "Flip r4 include_is_not_in -> exclude_is_in in place: absent-cc_bin sessions "
                     "silently become eligible.", flip,
                     guard_key="missing_attribute_semantics", harm_attr=cc)

    renamed = _with_rules(base, [r.model_copy(deep=True) for r in base_rules if r.id != "r4"]
                          + [Rule(id="r9", attribute=cc, op="exclude_is_in", value=["411111", "511111"])])
    constraint_probe("rename_evasion", "missing_value_semantics", "missing_attribute_semantics",
                     "Same silent widening, but the flipped rule is RENAMED (r4 removed, r9 added) "
                     "to dodge a same-id diff. Attribute-level detection must still catch it.", renamed,
                     guard_key="missing_attribute_semantics", harm_attr=cc)

    removed = _with_rules(base, [r.model_copy(deep=True) for r in base_rules if r.id != "r4"])
    constraint_probe("remove_guard", "missing_value_semantics", "missing_attribute_semantics",
                     "Delete the cc_bin guard entirely — absent-cc_bin sessions are no longer "
                     "excluded. Removal is just a rename to nothing; still a silent widening.", removed,
                     guard_key="missing_attribute_semantics", harm_attr=cc)

    # 2) A VISIBLE, deliberate widening — must be SURFACED (not blocked, not a gap).
    lowered = _with_rules(base, _set_op(base_rules, "r2", "gte", 18))
    constraint_probe("visible_widening", "deliberate_scope", "eligibility_scope",
                     "Lower the age gate 25 -> 18: a real, visible widening. The gate must SURFACE "
                     "it and route it to the holdout — never silently pass it, never wrongly block it.",
                     lowered, guard_key="eligibility_scope", hard=False)

    # 3) Hard-constraint attacks — each a documented Rokt guard; all CONTAINED.
    sensitive = _with_rules(base, base_rules + [Rule(id="r5", attribute="customer.health_flag",
                                                     op="equals", value="diabetic", sensitive=True,
                                                     consent_required=False)])
    constraint_probe("consent_gap", "privacy", "consent",
                     "Target a sensitive attribute (health_flag) without consent_required.",
                     sensitive, guard_key="consent")

    gambling = _mutate(base, offer=base.offer.model_copy(update={"category": "gambling"}),
                       eligibility_rules=[r.model_copy(deep=True) for r in base_rules if r.id != "r2"])
    constraint_probe("brand_safety", "brand_safety", "brand_safety",
                     "Switch the offer to a prohibited category (gambling) AND drop the age gate — "
                     "a prohibited category with no age gate must be refused.",
                     gambling, guard_key="brand_safety")

    country = _mutate(base, country="CA")
    constraint_probe("immutable_country", "campaign_integrity", "immutable_field_guard",
                     "Edit an immutable field (country US -> CA) that Rokt requires a NEW campaign for.",
                     country, guard_key="immutable_field_guard")

    fatfinger = _with_rules(base, _set_op(base_rules, "r2", "gte", 2))
    constraint_probe("fat_finger_age", "data_entry", "plausibility",
                     "Fat-finger the age gate to 2 — a data-entry error the plausibility guard catches "
                     "before subtler checks.", fatfinger, guard_key="plausibility")

    latency = _mutate(base, latency_budget_ms=5000)
    constraint_probe("latency_blowout", "latency", "latency_budget",
                     "Raise the latency budget to 5000ms, far past the 500ms ceiling.",
                     latency, guard_key="latency_budget")

    nohold = _mutate(base, requires_holdout=False)
    constraint_probe("holdout_bypass", "experiment_discipline", "holdout_required",
                     "Drop the mandatory holdout so the change could ship without a control group.",
                     nohold, guard_key="holdout_required")

    freq = _mutate(base, frequency_cap=base.frequency_cap.model_copy(update={"max_impressions": 10}))
    constraint_probe("frequency_spike", "fatigue", "frequency_cap",
                     "Raise the impression cap 1 -> 10, increasing exposure/fatigue risk.",
                     freq, guard_key="frequency_cap", hard=False)

    # 4) Fault injections — the offer subsystem fails; the engine must fall closed.
    sample = next((s["attributes"] for s in sessions
                   if s["attributes"].get("purchase.seat_type") == "premium"),
                  sessions[0]["attributes"])
    for kind, why in [
        ("timeout", "The decision exceeds its latency budget."),
        ("stale_identity", "Identity cannot be resolved at event time."),
        ("invalid_output", "The placement response is malformed."),
    ]:
        proof = failclosed.prove(kind, sample, base)
        outcome = "CONTAINED" if proof["proof_valid"] else "GAP"
        candidates.append(Candidate(
            f"fault_{kind}", "fault_containment", "fail_closed",
            f"{why} The optional experience must vanish; the checkout must survive.",
            outcome, "fail_closed" if proof["proof_valid"] else None,
            f"decision={proof['decision']}, checkout_preserved={proof['checkout_preserved']}, "
            f"offer_state_created={proof['offer_state_created']}"))

    # 5) Poisoned type — a non-numeric age must fail the rule CLOSED, not raise.
    poison = evaluate({"purchase.seat_type": "premium", "customer.age": "twenty",
                       "customer.loyalty_segment": "guest"}, base)
    poison_ok = poison.decision == "no_offer" and poison.fallback_reason == "invalid_comparison"
    candidates.append(Candidate(
        "poison_type", "input_validation", "evaluate_totality",
        "Feed a gte rule a non-numeric age ('twenty'). The pure core must fail the rule "
        "closed and stay total, never letting the exception escape.",
        "CONTAINED" if poison_ok else "GAP", "evaluate_totality" if poison_ok else None,
        f"decision={poison.decision}, fallback_reason={poison.fallback_reason}"))

    # 6) Point-in-time control — a rule on a NEVER-LOGGED attribute. Absent data can
    #    only narrow, so this must be SAFE (no false alarm), never a GAP.
    future_attr = "customer.credit_score_v2"  # a field no event-time session has
    late = _with_rules(base, base_rules + [Rule(id="r6", attribute=future_attr, op="gte", value=700)])
    by, viol = _judge_constraints(base, late, sessions)
    late_harm = bool(missing_attr_harm(base, late, sessions, future_attr))
    late_outcome = _classify(False, False, late_harm)  # no guard should fire; no harm expected
    candidates.append(Candidate(
        "late_attribute", "point_in_time", "reads_only_referenced_attributes",
        "Add a rule on a field introduced AFTER the events (credit_score_v2, absent from every "
        "session). Adding a condition can only narrow; a missing later field must not read as a "
        "widening — the anti-false-alarm case.",
        late_outcome, None,
        f"missing_attribute_semantics={by['missing_attribute_semantics'].result}, "
        f"widened_absent_sessions={len(missing_attr_harm(base, late, sessions, future_attr))}"))

    by_outcome = {"CONTAINED": 0, "SURFACED": 0, "SAFE": 0, "GAP": 0}
    for c in candidates:
        by_outcome[c.outcome] += 1

    return {
        "base_version": base.policy_version,
        "session_seed": session_seed,
        "session_count": session_count,
        "candidates": [c.as_dict() for c in candidates],
        "summary": {
            "total": len(candidates),
            **{k.lower(): v for k, v in by_outcome.items()},
            # The meta-invariant, made explicit: a correct engine leaves NO gaps.
            "no_gaps": by_outcome["GAP"] == 0,
        },
        "proposer": "deterministic_enumerator",  # MODELED, reproducible; LLM proposer is a HYPOTHESIS
        "note": ("The proposer enumerates adversarial fixtures; the deterministic engine judges "
                 "them. GAP is real: an independent ground-truth oracle detects silent widening "
                 "even if a guard regresses. On a correct engine, the GAP set is empty."),
    }

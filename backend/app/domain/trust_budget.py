"""Trust Budget — attention as a scarce, deterministic budget.

A single offer can look relevant in isolation yet become irritating after repeated
exposures and rejections. Trust Budget treats a customer's attention as a budget
that DEPLETES with exposures (and much faster with dismissals), RECOVERS as time
passes, and gates every optional experience behind one deterministic decision:

    SHOW     — budget available; this offer earns its exposure.
    DEFER    — not now, but eligible again after a cooldown (returns defer_until).
    SUPPRESS — attention withdrawn; "no experience" is the intentional decision.

The law: an optional experience must earn the right to consume attention.

Kept in the Threshold discipline: a PURE function of (history, candidate, context,
policy) — no wall-clock (event-time is passed in), no RNG, no network, no LLM. So
it is bit-for-bit replayable and can be property-tested. An LLM might *rank* which
candidate is most relevant (a HYPOTHESIS extension); it never decides whether
attention may be spent — that stays deterministic and auditable.

Privacy by construction: the decision reads only interaction COUNTS and TIMINGS
inside a bounded rolling window — no offer content, no PII. Interactions older than
the window fall out entirely, so the state is ephemeral, transaction-scoped, and
self-expiring (data minimization is the window, not a policy promise).
"""
from __future__ import annotations

from dataclasses import dataclass, field

# Interaction actions we recognise in the history. Anything else is ignored (total).
_SHOWN, _DISMISSED, _ENGAGED = "shown", "dismissed", "engaged"

# Ordering by "showiness" — used by the monotonicity law: more frustration must
# never move a decision UP this ladder.
SHOWINESS = {"SUPPRESS": 0, "DEFER": 1, "SHOW": 2}


@dataclass(frozen=True)
class BudgetPolicy:
    max_budget: float = 100.0
    cost_shown: float = 12.0        # an impression consumes some attention
    cost_dismissed: float = 45.0    # a rejection consumes much more — it signals irritation
    credit_engaged: float = 20.0    # engagement earns trust back (offers are welcome)
    base_show_cost: float = 20.0    # the price of showing THIS candidate, before adjustments
    window_seconds: int = 1800      # rolling attention window (~a session)
    frustration_window: int = 900   # dismissals inside this shorter window count as frustration
    frustration_cap: int = 2        # this many recent dismissals -> attention withdrawn
    category_cap: int = 2           # same category shown this many times recently -> fatigue
    category_penalty: float = 0.5   # each prior same-category impression makes this one costlier
    sensitivity_weight: float = 0.4  # a sensitive transaction shrinks the available budget


@dataclass(frozen=True)
class Candidate:
    category: str
    confidence: float = 0.7   # 0..1 — a high-confidence relevant offer costs less to show
    urgency: float = 0.0      # 0..1 — a time-sensitive offer gets a small allowance


@dataclass(frozen=True)
class Context:
    now: int                          # event-time (seconds); NEVER wall-clock
    transaction_sensitivity: float = 0.0  # 0..1 — protect a high-value/sensitive checkout


@dataclass(frozen=True)
class Decision:
    action: str                 # SHOW | DEFER | SUPPRESS
    reason: str
    available: float            # attention budget left before charging this candidate
    candidate_cost: float       # what showing this candidate would cost
    spent: float                # attention already consumed in the window
    frustration: int            # recent dismissals
    category_recent: int        # recent impressions of this candidate's category
    defer_until: int | None = None

    def as_dict(self) -> dict:
        return {
            "action": self.action,
            "reason": self.reason,
            "available": round(self.available, 2),
            "candidate_cost": round(self.candidate_cost, 2),
            "spent": round(self.spent, 2),
            "frustration": self.frustration,
            "category_recent": self.category_recent,
            "defer_until": self.defer_until,
        }


def _clamp(x: float, lo: float, hi: float) -> float:
    return lo if x < lo else hi if x > hi else x


def _in_window(history: list[dict], now: int, window: int) -> list[dict]:
    lo = now - window
    return [h for h in history if lo <= h.get("event_time", now) <= now]


def _spent(recent: list[dict], p: BudgetPolicy) -> float:
    total = 0.0
    for h in recent:
        a = h.get("action")
        if a == _SHOWN:
            total += p.cost_shown
        elif a == _DISMISSED:
            total += p.cost_dismissed
        elif a == _ENGAGED:
            total -= p.credit_engaged
    return max(0.0, total)


def candidate_cost(cand: Candidate, category_recent: int, p: BudgetPolicy) -> float:
    conf = _clamp(cand.confidence, 0.0, 1.0)
    urg = _clamp(cand.urgency, 0.0, 1.0)
    # low confidence -> up to 1.5x; high confidence -> 0.5x. Category repetition escalates.
    cost = p.base_show_cost * (1.5 - conf)
    cost *= 1.0 + p.category_penalty * category_recent
    cost *= 1.0 - 0.2 * urg   # a small allowance for genuinely time-sensitive offers
    return max(0.0, cost)


def decide(history: list[dict], cand: Candidate, ctx: Context, p: BudgetPolicy = BudgetPolicy()) -> Decision:
    """The whole ruling. Deterministic and total: any history shape is handled."""
    recent = _in_window(history, ctx.now, p.window_seconds)
    spent = _spent(recent, p)
    sens = _clamp(ctx.transaction_sensitivity, 0.0, 1.0)
    available = p.max_budget * (1.0 - p.sensitivity_weight * sens) - spent

    frustration = sum(
        1 for h in recent
        if h.get("action") == _DISMISSED and h.get("event_time", ctx.now) >= ctx.now - p.frustration_window
    )
    same_cat = [h for h in recent if h.get("action") == _SHOWN and h.get("category") == cand.category]
    category_recent = len(same_cat)
    cost = candidate_cost(cand, category_recent, p)

    def build(action: str, reason: str, defer_until: int | None = None) -> Decision:
        return Decision(action, reason, available, cost, spent, frustration, category_recent, defer_until)

    # 1) Recent rejections withdraw attention outright — the strongest signal.
    if frustration >= p.frustration_cap:
        # Recovers on its own: the oldest frustrating dismissal exits its window.
        oldest = min((h["event_time"] for h in recent if h.get("action") == _DISMISSED), default=ctx.now)
        return build("SUPPRESS",
                     f"{frustration} recent dismissals (cap {p.frustration_cap}) — attention withdrawn.",
                     defer_until=oldest + p.frustration_window)

    # 2) Category fatigue — this category has been shown too many times recently.
    if category_recent >= p.category_cap:
        oldest_cat = min(h["event_time"] for h in same_cat)
        return build("DEFER",
                     f"'{cand.category}' shown {category_recent}x (cap {p.category_cap}) — defer to avoid fatigue.",
                     defer_until=oldest_cat + p.window_seconds)

    # 3) Enough budget — the offer earns its exposure.
    if available >= cost:
        return build("SHOW", "Budget available; the offer earns its exposure.")

    # 4) Not enough now. If the window will free enough as it slides, DEFER; else SUPPRESS.
    full_recovery = p.max_budget * (1.0 - p.sensitivity_weight * sens)
    if recent and full_recovery >= cost:
        next_expiry = min(h.get("event_time", ctx.now) for h in recent) + p.window_seconds
        return build("DEFER",
                     f"Insufficient attention now ({available:.0f} < {cost:.0f}); eligible after cooldown.",
                     defer_until=next_expiry)
    return build("SUPPRESS",
                 f"Attention exhausted and the candidate is too costly ({cost:.0f}) to ever fit — suppress.")


# ── Scenario runner — thread the decision through an arriving stream of offers ──
# Each arrival is judged; if SHOWN, the impression AND the customer's scripted
# reaction are appended to history, so the budget depletes/recovers across the
# session. SUPPRESS/DEFER add nothing — "no experience" leaves no footprint.

def run_scenario(arrivals: list[dict], p: BudgetPolicy = BudgetPolicy(),
                 transaction_sensitivity: float = 0.0) -> list[dict]:
    history: list[dict] = []
    steps: list[dict] = []
    for a in arrivals:
        t = int(a["event_time"])
        cand = Candidate(a["category"], float(a.get("confidence", 0.7)), float(a.get("urgency", 0.0)))
        ctx = Context(now=t, transaction_sensitivity=transaction_sensitivity)
        d = decide(history, cand, ctx, p)
        if d.action == "SHOW":
            history.append({"event_time": t, "category": cand.category, "action": _SHOWN})
            reaction = a.get("reaction")
            if reaction in (_DISMISSED, _ENGAGED):
                history.append({"event_time": t + 1, "category": cand.category, "action": reaction})
        steps.append({
            "event_time": t,
            "category": cand.category,
            "confidence": cand.confidence,
            "urgency": cand.urgency,
            "reaction": a.get("reaction"),
            "decision": d.as_dict(),
        })
    return steps


# A few curated, deterministic scenarios that each teach one behaviour.
SCENARIOS: dict[str, dict] = {
    "healthy": {
        "label": "Healthy engager",
        "blurb": "Varied categories, the customer engages — attention stays funded, offers keep earning it.",
        "transaction_sensitivity": 0.0,
        "arrivals": [
            {"event_time": 0, "category": "parking", "confidence": 0.9, "reaction": _ENGAGED},
            {"event_time": 300, "category": "dining", "confidence": 0.85, "reaction": _ENGAGED},
            {"event_time": 700, "category": "insurance", "confidence": 0.8, "reaction": _ENGAGED},
            {"event_time": 1100, "category": "parking", "confidence": 0.88, "reaction": _ENGAGED},
        ],
    },
    "serial_dismisser": {
        "label": "Serial dismisser",
        "blurb": "The customer rejects everything — after the frustration cap, attention is withdrawn (SUPPRESS).",
        "transaction_sensitivity": 0.0,
        "arrivals": [
            {"event_time": 0, "category": "parking", "confidence": 0.8, "reaction": _DISMISSED},
            {"event_time": 120, "category": "dining", "confidence": 0.8, "reaction": _DISMISSED},
            {"event_time": 240, "category": "insurance", "confidence": 0.8, "reaction": _DISMISSED},
            {"event_time": 360, "category": "travel", "confidence": 0.8, "reaction": _DISMISSED},
        ],
    },
    "category_spam": {
        "label": "Category fatigue",
        "blurb": "The same category keeps arriving — once the category cap is hit, further ones DEFER.",
        "transaction_sensitivity": 0.0,
        "arrivals": [
            {"event_time": 0, "category": "parking", "confidence": 0.85, "reaction": _ENGAGED},
            {"event_time": 200, "category": "parking", "confidence": 0.85, "reaction": _ENGAGED},
            {"event_time": 400, "category": "parking", "confidence": 0.85, "reaction": _ENGAGED},
            {"event_time": 600, "category": "parking", "confidence": 0.85, "reaction": _ENGAGED},
        ],
    },
    "sensitive_checkout": {
        "label": "Sensitive checkout",
        "blurb": "A high-value, sensitive transaction shrinks the budget — the bar to spend attention rises.",
        "transaction_sensitivity": 0.8,
        "arrivals": [
            {"event_time": 0, "category": "parking", "confidence": 0.6, "reaction": _DISMISSED},
            {"event_time": 150, "category": "dining", "confidence": 0.55, "reaction": _DISMISSED},
            {"event_time": 300, "category": "insurance", "confidence": 0.5},
        ],
    },
    "recovery": {
        "label": "Recovery after a gap",
        "blurb": "A dismissal burst withdraws attention — then a long gap lets the window clear and SHOW returns.",
        "transaction_sensitivity": 0.0,
        "arrivals": [
            {"event_time": 0, "category": "parking", "confidence": 0.8, "reaction": _DISMISSED},
            {"event_time": 120, "category": "dining", "confidence": 0.8, "reaction": _DISMISSED},
            {"event_time": 240, "category": "travel", "confidence": 0.8},           # SUPPRESS (frustration)
            {"event_time": 2400, "category": "insurance", "confidence": 0.8},        # gap > window -> SHOW again
        ],
    },
}


def run_named_scenario(name: str, p: BudgetPolicy = BudgetPolicy()) -> dict:
    spec = SCENARIOS.get(name)
    if spec is None:
        raise KeyError(name)
    steps = run_scenario(spec["arrivals"], p, spec["transaction_sensitivity"])
    counts = {"SHOW": 0, "DEFER": 0, "SUPPRESS": 0}
    for s in steps:
        counts[s["decision"]["action"]] += 1
    return {
        "scenario": name,
        "label": spec["label"],
        "blurb": spec["blurb"],
        "transaction_sensitivity": spec["transaction_sensitivity"],
        "steps": steps,
        "summary": {"total": len(steps), **{k.lower(): v for k, v in counts.items()}},
        "law": "An optional experience must earn the right to consume attention.",
        "policy": {
            "max_budget": p.max_budget, "window_seconds": p.window_seconds,
            "frustration_cap": p.frustration_cap, "category_cap": p.category_cap,
        },
        "note": ("Deterministic: attention is a budget that depletes with exposure, depletes faster "
                 "with rejection, and recovers as the window slides. The decision is a pure function "
                 "of (history, candidate, context) — no LLM in the path. 'No experience' is a decision, "
                 "not an absence."),
    }

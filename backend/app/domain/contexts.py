"""Bounded-context (tactical-DDD) semantic delta — PURE, deterministic, no I/O/LLM.

Given two immutable Policy documents, this derives a fixed bounded-context graph
from the attribute namespaces (`purchase.*`, `customer.*`, `offer.*`) plus policy
field groups (delivery / governance), rolls the structural diff up into per-context
semantic severity, and flags the verified missing-attribute operator inversion —
all WITHOUT sessions (the static Compiler can only *flag* the trap; the Simulator's
counterfactual in constraints.py proves the blast radius). See
docs/MOMENT_FORGE_ARCHITECTURE.md §2.0 and docs/MOMENT_FORGE_ALGORITHMS.md §2.
"""
from __future__ import annotations

from .diff import diff_policies
from .policy import Policy

# Fixed bounded contexts. `match` classifies an attribute by namespace; `fields`
# classifies a policy-level scalar path. The order here is the deterministic order
# contexts are emitted in the context map.
CONTEXTS = [
    {"id": "purchase", "label": "Purchase", "match": lambda a: a.startswith("purchase.")},
    {"id": "customer", "label": "Customer", "match": lambda a: a.startswith("customer.")},
    {"id": "offer", "label": "Offer", "match": lambda a: a.startswith("offer.")},
    {"id": "delivery", "label": "Delivery",
     "fields": ["latency_budget_ms", "fallback_action", "frequency_cap"]},
    {"id": "governance", "label": "Governance",
     "fields": ["requires_holdout", "disclaimers", "objective", "country",
                "language", "timezone", "consent"]},
]

CONTEXT_IDS = [c["id"] for c in CONTEXTS]
_CONTEXT_LABEL = {c["id"]: c["label"] for c in CONTEXTS}

# Static DDD relations between contexts — deterministic, independent of the diff.
CONTEXT_EDGES = [
    {"from": "customer", "to": "offer", "relation": "eligibility_gate"},
    {"from": "purchase", "to": "offer", "relation": "eligibility_gate"},
    {"from": "delivery", "to": "offer", "relation": "serving_guard"},
    {"from": "governance", "to": "*", "relation": "policy_gate"},
]

# Deterministic map from a diff `risk` tag to a semantic severity.
SEVERITY = {
    "missing_attribute_flip": "critical",
    "eligibility_widened": "warning",
    "eligibility_narrowed": "info",
    "frequency_increase": "warning",
    "latency_increase": "warning",
    None: "info",
}

_SEVERITY_RANK = {"info": 0, "warning": 1, "critical": 2}


def _severity_for(risk: str | None) -> str:
    return SEVERITY.get(risk, "info")


def _max_severity(a: str, b: str) -> str:
    return a if _SEVERITY_RANK[a] >= _SEVERITY_RANK[b] else b


def context_for_attribute(attribute: str) -> str:
    """Map a rule attribute to its bounded context by namespace."""
    for c in CONTEXTS:
        match = c.get("match")
        if match and match(attribute):
            return c["id"]
    # Namespaced attributes always match above; anything else is policy governance.
    return "governance"


def _context_for_field(field: str) -> str:
    for c in CONTEXTS:
        if field in c.get("fields", []):
            return c["id"]
    if field == "offer":
        return "offer"
    return "governance"


def _context_for_change(change: dict, base: Policy, proposed: Policy) -> str:
    path = change["path"]
    if path.startswith("eligibility_rules."):
        rid = path.split(".")[1]
        rule = proposed.rule_by_id(rid) or base.rule_by_id(rid)
        if rule is not None:
            return context_for_attribute(rule.attribute)
        return "governance"
    return _context_for_field(path.split(".")[0])


def _short_attr(attribute: str) -> str:
    return attribute.split(".")[-1]


def _semantics_for(change: dict, attribute: str | None) -> tuple[str, str]:
    """Human-readable before/after *meaning* strings for a change."""
    risk = change.get("risk")
    if risk == "missing_attribute_flip":
        return "MISSING → EXCLUDED", "MISSING → INCLUDED"
    if risk == "eligibility_narrowed":
        return "MISSING → INCLUDED", "MISSING → EXCLUDED"
    return f"{change.get('before')!r}", f"{change.get('after')!r}"


def _explanation_for(change: dict, attribute: str | None) -> tuple[str, str]:
    """Return (explanation, grounding) for a meaning change."""
    risk = change.get("risk")
    attr = _short_attr(attribute) if attribute else "the attribute"
    if risk == "missing_attribute_flip":
        return (
            f"Every session with no {attr} flips from excluded to eligible.",
            "Rokt Audience targeting: 'Include (is not in)' vs 'Exclude (is in)' "
            "differ only on MISSING values.",
        )
    if risk == "eligibility_narrowed":
        return (
            f"Operator reverted so missing {attr} sessions become excluded again.",
            "Rokt Audience targeting: 'Exclude (is in)' vs 'Include (is not in)' "
            "differ only on MISSING values.",
        )
    if risk == "eligibility_widened":
        return (
            "Threshold loosened / rule removed — more sessions become eligible.",
            "Loosening a numeric gate or removing a rule widens the eligible audience.",
        )
    if risk == "frequency_increase":
        return (
            "Impression cap raised — the same customer can be shown the offer more often.",
            "Rokt frequency management: raising impression caps increases exposure/fatigue.",
        )
    if risk == "latency_increase":
        return (
            "Latency budget raised — slower decisions before the fail-closed fallback.",
            "Rokt publishes sub-200ms latency; a higher budget risks the fallback timeout.",
        )
    return (
        "Value changed without altering the missing-value semantics of the rule.",
        "Structural change surfaced by the deterministic diff.",
    )


def _is_meaning_change(change: dict) -> bool:
    """A change carries a *meaning* shift if it is risk-tagged or is a rule op change."""
    if change.get("risk") is not None:
        return True
    return change["path"].startswith("eligibility_rules.") and change["path"].endswith(".op")


def detect_missing_attribute_inversion(changes: list[dict], base: Policy,
                                       proposed: Policy) -> dict | None:
    """Detect the include_is_not_in→exclude_is_in inversion PURELY from the
    `missing_attribute_flip` risk tag emitted by diff.py — no sessions needed."""
    for c in changes:
        if c.get("risk") == "missing_attribute_flip" and c["path"].endswith(".op"):
            rid = c["path"].split(".")[1]
            rule = proposed.rule_by_id(rid) or base.rule_by_id(rid)
            attribute = rule.attribute if rule is not None else None
            return {
                "detected": True,
                "rule_id": rid,
                "attribute": attribute,
                "direction": "include_is_not_in→exclude_is_in",
                "effect": "missing values silently become eligible",
            }
    return None


def build_semantic_delta(base: Policy, proposed: Policy,
                         muted_contexts: list[str] | tuple[str, ...] = ()) -> dict:
    """Compile the semantic delta: structural changes + bounded-context rollup +
    meaning-change cards + the missing-attribute inversion flag. Pure function of
    (base, proposed) — `muted_contexts` only annotates the `muted` flag on contexts
    (the caller has already dropped those rules before diffing)."""
    diff = diff_policies(base, proposed)
    changes = diff["changes"]
    muted_set = set(muted_contexts)

    # Per-context rule membership from the union of base+proposed rule ids.
    rules_by_id: dict[str, str] = {}
    for r in base.eligibility_rules:
        rules_by_id[r.id] = r.attribute
    for r in proposed.eligibility_rules:
        rules_by_id[r.id] = r.attribute
    context_rule_ids: dict[str, list[str]] = {cid: [] for cid in CONTEXT_IDS}
    for rid in sorted(rules_by_id):
        context_rule_ids[context_for_attribute(rules_by_id[rid])].append(rid)

    # Roll the diff up per context: change_count + max_severity.
    change_count: dict[str, int] = {cid: 0 for cid in CONTEXT_IDS}
    max_severity: dict[str, str] = {cid: "info" for cid in CONTEXT_IDS}
    for c in changes:
        cid = _context_for_change(c, base, proposed)
        change_count[cid] += 1
        max_severity[cid] = _max_severity(max_severity[cid], _severity_for(c.get("risk")))

    contexts = [
        {
            "id": cid,
            "label": _CONTEXT_LABEL[cid],
            "rule_ids": context_rule_ids[cid],
            "change_count": change_count[cid],
            "max_severity": max_severity[cid],
            "muted": cid in muted_set,
        }
        for cid in CONTEXT_IDS
    ]

    meaning_changes = []
    for c in changes:
        if not _is_meaning_change(c):
            continue
        cid = _context_for_change(c, base, proposed)
        attribute = None
        if c["path"].startswith("eligibility_rules."):
            rid = c["path"].split(".")[1]
            rule = proposed.rule_by_id(rid) or base.rule_by_id(rid)
            attribute = rule.attribute if rule is not None else None
        before_sem, after_sem = _semantics_for(c, attribute)
        explanation, grounding = _explanation_for(c, attribute)
        meaning_changes.append({
            "path": c["path"],
            "risk": c.get("risk"),
            "context": cid,
            "severity": _severity_for(c.get("risk")),
            "before_semantics": before_sem,
            "after_semantics": after_sem,
            "explanation": explanation,
            "grounding": grounding,
        })

    inversion = detect_missing_attribute_inversion(changes, base, proposed)

    return {
        "changes": changes,
        "summary": diff["summary"],
        "context_map": {"contexts": contexts, "edges": list(CONTEXT_EDGES)},
        "meaning_changes": meaning_changes,
        "missing_attribute_inversion": inversion,
    }

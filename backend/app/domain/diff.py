"""Deterministic policy diff between a base and a proposed version."""
from __future__ import annotations

from .policy import Policy


def _risk_for_rule_change(before: dict, after: dict) -> str | None:
    if before.get("op") == "include_is_not_in" and after.get("op") == "exclude_is_in":
        return "missing_attribute_flip"
    if before.get("op") == "exclude_is_in" and after.get("op") == "include_is_not_in":
        return "eligibility_narrowed"
    # a numeric threshold loosened (gte lowered / lte raised) widens eligibility
    if before.get("op") == after.get("op") and before.get("op") in {"gte", "lte"}:
        try:
            b, a = float(before["value"]), float(after["value"])
            if before["op"] == "gte" and a < b:
                return "eligibility_widened"
            if before["op"] == "lte" and a > b:
                return "eligibility_widened"
        except (TypeError, ValueError):
            return None
    # a membership list changed without changing the op: growing an `in` list, or
    # SHRINKING an exclude/include list, both admit more sessions -> widening.
    if before.get("op") == after.get("op") and before.get("op") in {"in", "include_is_not_in", "exclude_is_in"}:
        try:
            bset, aset = set(before["value"]), set(after["value"])
        except TypeError:
            return None
        if before["op"] == "in":
            if aset > bset:  # more values now match -> more eligible
                return "eligibility_widened"
        elif aset < bset:  # include_is_not_in / exclude_is_in: shorter list -> fewer excluded
            return "eligibility_widened"
        return None
    return None


def diff_policies(base: Policy, proposed: Policy) -> dict:
    changes: list[dict] = []

    # scalar fields
    scalars = [
        ("latency_budget_ms", base.latency_budget_ms, proposed.latency_budget_ms,
         "latency_increase" if proposed.latency_budget_ms > base.latency_budget_ms else None),
        ("fallback_action", base.fallback_action, proposed.fallback_action, None),
        ("requires_holdout", base.requires_holdout, proposed.requires_holdout, None),
        ("frequency_cap.max_impressions", base.frequency_cap.max_impressions,
         proposed.frequency_cap.max_impressions,
         "frequency_increase" if proposed.frequency_cap.max_impressions > base.frequency_cap.max_impressions else None),
        ("offer.category", base.offer.category, proposed.offer.category, None),
    ]
    for path, b, a, risk in scalars:
        if b != a:
            changes.append({"path": path, "kind": "modified", "before": b, "after": a, "risk": risk})

    # rules by id
    base_rules = {r.id: r for r in base.eligibility_rules}
    prop_rules = {r.id: r for r in proposed.eligibility_rules}
    for rid in sorted(set(base_rules) | set(prop_rules)):
        b_rule = base_rules.get(rid)
        p_rule = prop_rules.get(rid)
        if b_rule and not p_rule:
            changes.append({"path": f"eligibility_rules.{rid}", "kind": "removed",
                            "before": b_rule.model_dump(), "after": None, "risk": "eligibility_widened"})
        elif p_rule and not b_rule:
            changes.append({"path": f"eligibility_rules.{rid}", "kind": "added",
                            "before": None, "after": p_rule.model_dump(), "risk": None})
        else:
            bd, ad = b_rule.model_dump(), p_rule.model_dump()
            if bd != ad:
                # surface the operator change specifically (the star)
                if bd.get("op") != ad.get("op"):
                    changes.append({"path": f"eligibility_rules.{rid}.op", "kind": "modified",
                                    "before": bd["op"], "after": ad["op"],
                                    "risk": _risk_for_rule_change(bd, ad)})
                for field in ("value", "sensitive", "consent_required"):
                    if bd.get(field) != ad.get(field):
                        changes.append({"path": f"eligibility_rules.{rid}.{field}", "kind": "modified",
                                        "before": bd.get(field), "after": ad.get(field),
                                        "risk": _risk_for_rule_change(bd, ad) if field == "value" else None})

    summary = {
        "added": sum(1 for c in changes if c["kind"] == "added"),
        "removed": sum(1 for c in changes if c["kind"] == "removed"),
        "modified": sum(1 for c in changes if c["kind"] == "modified"),
    }
    return {"changes": changes, "summary": summary}

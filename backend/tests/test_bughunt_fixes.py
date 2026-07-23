"""Regressions for three bugs found in the backend deep review:
  1. the persisting /replay-jobs endpoint accepted unknown injection kinds and
     produced a spurious fail-closed proof + wrong persisted verdict;
  2. a value-swap membership change (add+remove) was not tagged as widening;
  3. the conversion dedup key collided for distinct (type, ref) pairs.
"""
from app.domain.diff import _risk_for_rule_change

M = "/api/v1/merchants/aurora-tickets"


def test_replay_rejects_unknown_injection(client):
    r = client.post(
        f"{M}/replay-jobs",
        json={"base_version": "V17", "proposed_version": "V18", "session_count": 50, "injections": ["bogus"]},
    )
    assert r.status_code == 422
    assert "bogus" in r.text
    # a valid injection still runs
    ok = client.post(
        f"{M}/replay-jobs",
        json={"base_version": "V17", "proposed_version": "V18", "session_count": 50, "injections": ["timeout"]},
    )
    assert ok.status_code in (200, 201)


def test_widening_detected_on_value_swap():
    # `in` list swaps in a new value -> widening, even though it also drops one
    assert _risk_for_rule_change({"op": "in", "value": ["A", "B"]}, {"op": "in", "value": ["B", "C"]}) == "eligibility_widened"
    # include_is_not_in: dropping a value from the list excludes fewer -> widening
    assert _risk_for_rule_change(
        {"op": "include_is_not_in", "value": ["A", "B"]}, {"op": "include_is_not_in", "value": ["B", "C"]}
    ) == "eligibility_widened"
    # pure narrowing (only removing matches from an `in` list) is NOT widening
    assert _risk_for_rule_change({"op": "in", "value": ["A", "B"]}, {"op": "in", "value": ["A"]}) is None


def test_conversion_dedup_key_is_injective(client):
    # ("purchase", "A:B") and ("purchase:A", "B") collide under raw "type:ref" concat
    a = client.post(f"{M}/conversions", json={"conversiontype": "purchase", "confirmationref": "A:B"})
    b = client.post(f"{M}/conversions", json={"conversiontype": "purchase:A", "confirmationref": "B"})
    assert a.status_code == 201
    assert b.status_code == 201  # distinct — must NOT be deduplicated
    assert a.json()["conversion_id"] != b.json()["conversion_id"]

"""Moment Forge endpoint + contexts.py tests.

Covers the §6 404/422 matrix, determinism (identical bytes across two calls), the
READ-ONLY no-write guarantee (row counts unchanged after N calls), the trap →
BLOCKED + inversion / safe → ELIGIBLE_FOR_HOLDOUT verdicts, thin-support →
INSUFFICIENT_EVIDENCE, and unit tests for the pure `contexts.py` module.
"""
import json
from pathlib import Path

import pytest

from app.domain.contexts import (
    CONTEXT_IDS,
    build_semantic_delta,
    context_for_attribute,
    detect_missing_attribute_inversion,
)
from app.domain.policy import Policy

M = "/api/v1/merchants/aurora-tickets"
SEED_DIR = Path(__file__).resolve().parent.parent / "seed" / "policies"


def _load(name: str) -> Policy:
    return Policy.model_validate(json.loads((SEED_DIR / name).read_text()))


# ---------------------------------------------------------------- contexts.py --
def test_context_for_attribute_namespaces():
    assert context_for_attribute("purchase.seat_type") == "purchase"
    assert context_for_attribute("customer.age") == "customer"
    assert context_for_attribute("offer.foo") == "offer"


def test_semantic_delta_context_rollup_and_severity():
    delta = build_semantic_delta(_load("aurora_v17.json"), _load("aurora_v18.json"))
    by_id = {c["id"]: c for c in delta["context_map"]["contexts"]}
    # all five fixed contexts always present, in fixed order
    assert [c["id"] for c in delta["context_map"]["contexts"]] == CONTEXT_IDS
    # customer holds the age/loyalty/cc_bin rules
    assert by_id["customer"]["rule_ids"] == ["r2", "r3", "r4"]
    assert by_id["purchase"]["rule_ids"] == ["r1"]
    # the op flip rolls customer up to critical severity
    assert by_id["customer"]["max_severity"] == "critical"
    assert delta["context_map"]["edges"]  # static DDD edges present


def test_semantic_delta_detects_inversion_on_trap():
    delta = build_semantic_delta(_load("aurora_v17.json"), _load("aurora_v18.json"))
    inv = delta["missing_attribute_inversion"]
    assert inv is not None and inv["detected"] is True
    assert inv["rule_id"] == "r4"
    assert inv["attribute"] == "customer.cc_bin"
    assert inv["direction"] == "include_is_not_in→exclude_is_in"
    # a critical meaning-change card exists for the flip
    flip = [m for m in delta["meaning_changes"] if m["risk"] == "missing_attribute_flip"]
    assert flip and flip[0]["severity"] == "critical"
    assert flip[0]["before_semantics"] == "MISSING → EXCLUDED"
    assert flip[0]["after_semantics"] == "MISSING → INCLUDED"


def test_semantic_delta_no_inversion_on_safe():
    delta = build_semantic_delta(_load("aurora_v17.json"), _load("aurora_v18_safe.json"))
    assert delta["missing_attribute_inversion"] is None
    assert detect_missing_attribute_inversion(
        delta["changes"], _load("aurora_v17.json"), _load("aurora_v18_safe.json")) is None


def test_semantic_delta_muted_flag():
    delta = build_semantic_delta(
        _load("aurora_v17.json"), _load("aurora_v18.json"), muted_contexts=["delivery"])
    by_id = {c["id"]: c for c in delta["context_map"]["contexts"]}
    assert by_id["delivery"]["muted"] is True
    assert by_id["customer"]["muted"] is False


# ------------------------------------------------------- semantic-compile API --
def test_compile_trap_flags_inversion(client):
    r = client.post(f"{M}/semantic-compile",
                    json={"base_version": "V17", "proposed_version": "V18"})
    assert r.status_code == 200
    body = r.json()
    assert body["base_version"] == "V17" and body["proposed_version"] == "V18"
    assert body["missing_attribute_inversion"]["detected"] is True
    assert any(c["risk"] == "missing_attribute_flip" for c in body["changes"])
    # eligibility_narrowed enum passthrough is possible (R2) — never crashes here.


def test_compile_accepts_inline_document(client):
    doc = json.loads((SEED_DIR / "aurora_v18.json").read_text())
    r = client.post(f"{M}/semantic-compile",
                    json={"base_version": "V17", "proposed_document": doc})
    assert r.status_code == 200
    assert r.json()["missing_attribute_inversion"]["detected"] is True


def test_compile_404_unknown_base(client):
    r = client.post(f"{M}/semantic-compile",
                    json={"base_version": "NOPE", "proposed_version": "V18"})
    assert r.status_code == 404
    assert r.json()["error"]["request_id"]


def test_compile_404_unknown_proposed(client):
    r = client.post(f"{M}/semantic-compile",
                    json={"base_version": "V17", "proposed_version": "NOPE"})
    assert r.status_code == 404


def test_compile_422_neither_proposed(client):
    r = client.post(f"{M}/semantic-compile", json={"base_version": "V17"})
    assert r.status_code == 422


def test_compile_422_both_proposed(client):
    doc = json.loads((SEED_DIR / "aurora_v18.json").read_text())
    r = client.post(f"{M}/semantic-compile",
                    json={"base_version": "V17", "proposed_version": "V18",
                          "proposed_document": doc})
    assert r.status_code == 422


def test_compile_422_malformed_document(client):
    r = client.post(f"{M}/semantic-compile",
                    json={"base_version": "V17",
                          "proposed_document": {"policy_version": "bad"}})
    assert r.status_code == 422


def test_compile_422_unknown_muted_context(client):
    r = client.post(f"{M}/semantic-compile",
                    json={"base_version": "V17", "proposed_version": "V18",
                          "muted_contexts": ["not_a_context"]})
    assert r.status_code == 422


def test_compile_determinism_identical_bytes(client):
    body = {"base_version": "V17", "proposed_version": "V18"}
    a = client.post(f"{M}/semantic-compile", json=body)
    b = client.post(f"{M}/semantic-compile", json=body)
    assert a.status_code == 200 and b.status_code == 200
    assert a.content == b.content


# ------------------------------------------------------------- simulations API --
def test_simulate_trap_blocked_with_inversion(client):
    r = client.post(f"{M}/simulations",
                    json={"base_version": "V17",
                          "proposed": {"from_version": "V18"},
                          "session_seed": 42, "session_count": 200})
    assert r.status_code == 200
    body = r.json()
    assert body["verdict"]["value"] == "BLOCKED"
    assert body["semantic_delta"]["missing_attribute_inversion"]["detected"] is True
    assert any(c["key"] == "missing_attribute_semantics" and c["result"] == "FAIL"
               for c in body["constraint_results"])
    assert body["replay_summary"]["constraint_violation"] > 0
    # inline audit matches audit.as_list() shape exactly (no created_at, R1).
    # prev_hmac is part of the shape now — the log is hash-chained, not just
    # per-record HMAC'd, so deletion/reorder is detectable.
    assert body["audit"] and set(body["audit"][0].keys()) == {
        "seq", "event_type", "payload", "prev_hmac", "content_hmac"}


def test_simulate_safe_eligible(client):
    r = client.post(f"{M}/simulations",
                    json={"base_version": "V17",
                          "proposed": {"from_version": "V18-safe"},
                          "session_seed": 42, "session_count": 200})
    assert r.status_code == 200
    body = r.json()
    assert body["verdict"]["value"] == "ELIGIBLE_FOR_HOLDOUT"
    assert body["verdict"]["holdout_config"]["control_pct"] == 5
    assert body["semantic_delta"]["missing_attribute_inversion"] is None


def test_simulate_rule_override_reverts_trap(client):
    # Override r4 back to include_is_not_in on top of V18 → no inversion → not BLOCKED
    # for the missing-attribute reason.
    r = client.post(f"{M}/simulations",
                    json={"base_version": "V17",
                          "proposed": {"from_version": "V18",
                                       "rule_overrides": [{"id": "r4", "op": "include_is_not_in"}]},
                          "session_seed": 42, "session_count": 200})
    assert r.status_code == 200
    body = r.json()
    assert body["semantic_delta"]["missing_attribute_inversion"] is None
    assert not any(c["key"] == "missing_attribute_semantics" and c["result"] == "FAIL"
                   for c in body["constraint_results"])


def test_simulate_422_duplicate_rule_ids_with_overrides(client):
    # Duplicate rule ids in the proposed document must FAIL CLOSED (F3) even when
    # rule_overrides are present. The id-indexed patch must not silently collapse
    # the duplicates and run the sim on a policy the operator never authored.
    doc = client.get(f"{M}/policies/V17").json()
    first = doc["eligibility_rules"][0]
    doc["eligibility_rules"].append(dict(first))  # duplicate id, otherwise valid
    r = client.post(f"{M}/simulations",
                    json={"base_version": "V17",
                          "proposed": {"document": doc,
                                       "rule_overrides": [{"id": first["id"], "op": first["op"]}]}})
    assert r.status_code == 422


def test_simulate_muted_contexts_applied(client):
    r = client.post(f"{M}/simulations",
                    json={"base_version": "V17",
                          "proposed": {"from_version": "V18", "muted_contexts": ["customer"]},
                          "session_seed": 42, "session_count": 200})
    assert r.status_code == 200
    body = r.json()
    assert body["context_toggles_applied"] == ["customer"]
    # customer rules dropped → r4 flip gone → no inversion
    assert body["semantic_delta"]["missing_attribute_inversion"] is None


def test_simulate_thin_support_insufficient_evidence(client):
    r = client.post(f"{M}/simulations",
                    json={"base_version": "V17",
                          "proposed": {"from_version": "V18-safe"},
                          "session_seed": 42, "session_count": 40})
    assert r.status_code == 200
    body = r.json()
    assert body["verdict"]["value"] == "INSUFFICIENT_EVIDENCE"
    assert body["ope_prescreen"]["support"] in ("THIN", "NONE")
    assert body["ope_prescreen"]["refuses_estimate"] is True


def test_simulate_404_unknown_base(client):
    r = client.post(f"{M}/simulations",
                    json={"base_version": "NOPE", "proposed": {"from_version": "V18"}})
    assert r.status_code == 404


def test_simulate_404_unknown_from_version(client):
    r = client.post(f"{M}/simulations",
                    json={"base_version": "V17", "proposed": {"from_version": "NOPE"}})
    assert r.status_code == 404


def test_simulate_422_session_count_out_of_range(client):
    r = client.post(f"{M}/simulations",
                    json={"base_version": "V17", "proposed": {"from_version": "V18"},
                          "session_count": 99999})
    assert r.status_code == 422


def test_simulate_422_unknown_muted_context(client):
    r = client.post(f"{M}/simulations",
                    json={"base_version": "V17",
                          "proposed": {"from_version": "V18", "muted_contexts": ["nope"]}})
    assert r.status_code == 422


def test_simulate_determinism_identical_bytes(client):
    body = {"base_version": "V17", "proposed": {"from_version": "V18"},
            "session_seed": 42, "session_count": 200}
    a = client.post(f"{M}/simulations", json=body)
    b = client.post(f"{M}/simulations", json=body)
    assert a.status_code == 200 and b.status_code == 200
    assert a.content == b.content


# ---------------------------------------------------------- READ-ONLY guarantee --
def test_moment_forge_writes_no_rows(client):
    from app.db import SessionLocal
    from app.models import OutboxEventRow, PolicyVersionRow, ReplayJobRow

    def _counts():
        db = SessionLocal()
        try:
            return (db.query(PolicyVersionRow).count(),
                    db.query(ReplayJobRow).count(),
                    db.query(OutboxEventRow).count())
        finally:
            db.close()

    before = _counts()
    for _ in range(3):
        client.post(f"{M}/semantic-compile",
                    json={"base_version": "V17", "proposed_version": "V18"})
        client.post(f"{M}/simulations",
                    json={"base_version": "V17", "proposed": {"from_version": "V18"},
                          "session_seed": 42, "session_count": 200})
    after = _counts()
    assert before == after, f"Moment Forge must not write rows: {before} -> {after}"

"""Whole-value tests (W3): the type system enforces the seam.

Three layers:
 1. unit algebra — cross-kind addition RAISES; same-kind merges (the headline),
 2. the impression-fidelity seam — refuse-to-conform ACL vs blended Conformist,
 3. the endpoint — deterministic, bounded, read-only, and it really performs the
    illegal addition and reports the caught error.
"""
import pytest

from app.db import SessionLocal
from app.domain.impressions import (
    Channel,
    Impression,
    ImpressionFidelity,
    acl_count,
    audit_impressions,
    conformist_count,
    generate_impression_corpus,
)
from app.domain.reconciliation import RewardStatus
from app.domain.translation import (
    SEAM,
    ConversionEvent,
    ConversionKind,
    UnitMismatchError,
    demonstrate_unit_wall,
)
from app.models import OutboxEventRow

M = "/api/v1/merchants/aurora-tickets"


# --------------------------------------------------------------------------- #
# 1. Unit algebra — the runtime error at the seam
# --------------------------------------------------------------------------- #
def test_cross_kind_addition_raises():
    """THE W3 property: `recorded + incremental` is not a number, it is a bug —
    and with whole-values it is a loud one, not a silent copy."""
    recorded = ConversionEvent(kind=ConversionKind.RECORDED, count=10, seam=SEAM)
    incremental = ConversionEvent(kind=ConversionKind.INCREMENTAL, count=6, seam=SEAM)
    with pytest.raises(UnitMismatchError):
        recorded + incremental  # noqa: B018


def test_same_kind_addition_merges():
    a = ConversionEvent(kind=ConversionKind.RECORDED, count=10, seam=SEAM)
    b = ConversionEvent(kind=ConversionKind.RECORDED, count=5, seam=SEAM)
    merged = a + b
    assert merged.kind is ConversionKind.RECORDED
    assert merged.count == 15


def test_unit_mismatch_is_a_type_error():
    """UnitMismatchError subclasses TypeError — it is a typing failure caught at
    runtime, which is exactly the Whole Value claim."""
    assert issubclass(UnitMismatchError, TypeError)


def test_demonstrate_unit_wall_reports_real_outcome():
    wall = demonstrate_unit_wall()
    assert wall["illegal"]["raised"] is True
    assert wall["illegal"]["error"] == "UnitMismatchError"
    assert wall["legal"]["result"] == {"kind": "recorded", "count": 15}


def test_all_three_whole_values_exist():
    """W3's closing condition: every polysemic term of the critique carries its
    owning context in a type — conversion, reward, impression."""
    assert {k.value for k in ConversionKind} == {"recorded", "incremental"}
    assert {s.value for s in RewardStatus} == {"earned", "issued", "redeemable"}
    assert {f.value for f in ImpressionFidelity} == {"faithful", "degraded"}


# --------------------------------------------------------------------------- #
# 2. The impression seam
# --------------------------------------------------------------------------- #
def test_corpus_is_deterministic():
    assert generate_impression_corpus(42, 500) == generate_impression_corpus(42, 500)


def test_human_channel_is_always_faithful():
    corpus = generate_impression_corpus(7, 400)
    assert all(
        i.fidelity is ImpressionFidelity.FAITHFUL
        for i in corpus
        if i.channel is Channel.HUMAN
    )


def test_acl_refuses_exactly_the_degraded_set():
    corpus = generate_impression_corpus(42, 300)
    degraded = sum(1 for i in corpus if i.fidelity is ImpressionFidelity.DEGRADED)
    acl = acl_count(corpus)
    assert acl["refused"] == degraded
    assert acl["counted"] + acl["refused"] == conformist_count(corpus)


def test_conformist_never_undercounts():
    """The Conformist blend is always >= the ACL count: refusing units can only
    shrink the number. The delta IS the lie."""
    for seed in range(10):
        audit = audit_impressions(seed, 200)
        assert audit["conformist_result"]["count"] >= audit["acl_result"]["counted"]
        assert audit["blended_units"] == audit["acl_result"]["refused"]


def test_impression_is_frozen():
    imp = Impression(fidelity=ImpressionFidelity.FAITHFUL, channel=Channel.HUMAN)
    with pytest.raises(Exception):
        imp.fidelity = ImpressionFidelity.DEGRADED  # type: ignore[misc]


def test_audit_is_deterministic():
    assert audit_impressions(42, 300) == audit_impressions(42, 300)


# --------------------------------------------------------------------------- #
# 3. The endpoint
# --------------------------------------------------------------------------- #
def test_impression_audit_endpoint(client):
    r = client.post(f"{M}/impression-audit", json={"seed": 42, "count": 200})
    assert r.status_code == 200
    body = r.json()
    assert body["acl_result"]["counted"] + body["acl_result"]["refused"] == 200
    assert body["unit_wall"]["illegal"]["raised"] is True
    assert body["unit_wall"]["illegal"]["error"] == "UnitMismatchError"
    assert [s["name"] for s in body["synthetic_inputs"]] == [
        "agent_share", "degraded_fraction"]

    # Determinism at the HTTP layer: same body → identical payload.
    r2 = client.post(f"{M}/impression-audit", json={"seed": 42, "count": 200})
    assert r2.json() == body


def test_impression_audit_rejects_unknown_term(client):
    r = client.post(f"{M}/impression-audit", json={"term": "reward"})
    assert r.status_code == 422


def test_impression_audit_rejects_bad_bounds(client):
    assert client.post(f"{M}/impression-audit", json={"count": 0}).status_code == 422
    assert client.post(f"{M}/impression-audit",
                       json={"agent_share": 1.5}).status_code == 422


def test_impression_audit_writes_nothing(client):
    db = SessionLocal()
    try:
        before = db.query(OutboxEventRow).count()
        client.post(f"{M}/impression-audit", json={"seed": 1, "count": 500})
        assert db.query(OutboxEventRow).count() == before
    finally:
        db.close()

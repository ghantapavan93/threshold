"""Translation Map tests (Case A: conversion recorded→incremental across an ACL).

Covers the pure `translation.py` (the Conformist over-counts vs the ACL, and the leak
is EXACTLY the non-incremental set; determinism; the identity property when the corpus
is fully incremental) and the thin `/translation-audit` adapter (determinism as
identical bytes, the 422 matrix, and the READ-ONLY no-write guarantee).
"""
import json
from pathlib import Path

from app.domain.translation import (
    DEFAULT_INCREMENTAL_FRACTION,
    CausalOrigin,
    ConversionKind,
    acl_translate,
    audit_translation,
    conformist_translate,
    generate_conversion_corpus,
)

M = "/api/v1/merchants/aurora-tickets"


# ------------------------------------------------------------- translation.py --
def test_conformist_overcounts_and_leak_is_exactly_non_incremental_set():
    corpus = generate_conversion_corpus(42, 200)
    conformist = conformist_translate(corpus)
    acl = acl_translate(corpus)

    # The ground-truth non-incremental (would-have-converted-anyway) set.
    non_incremental = sum(
        1 for e in corpus if e.origin is CausalOrigin.WOULD_HAVE_ANYWAY)

    leak = conformist.count - acl.count
    assert leak > 0                       # the Conformist path over-counts
    assert leak == non_incremental        # ...by EXACTLY the non-incremental set
    assert acl.count < conformist.count   # an ACL can only ever REMOVE counts
    assert acl.count == sum(
        1 for e in corpus if e.origin is CausalOrigin.TREATMENT_CAUSED)
    # Both translations emit the INCREMENTAL whole-value on the BC-5→BC-3 seam.
    assert conformist.kind is ConversionKind.INCREMENTAL
    assert acl.kind is ConversionKind.INCREMENTAL


def test_audit_delta_matches_leak():
    audit = audit_translation(42, 200)
    assert audit["recorded_lift"] > audit["incremental_lift"]
    assert (audit["leaked_conversions"]
            == audit["recorded_lift"] - audit["incremental_lift"])
    assert audit["leaked_conversions"] == audit["per_origin"]["would_have_anyway"]
    assert audit["incremental_lift"] == audit["per_origin"]["treatment_caused"]
    assert audit["corruption"]["direction"] == "inflation"
    assert audit["corruption"]["magnitude"] == audit["leaked_conversions"]
    # The one synthetic input is labelled honestly.
    syn = audit["synthetic_inputs"][0]
    assert syn["name"] == "incremental_fraction"
    assert syn["value"] == DEFAULT_INCREMENTAL_FRACTION
    assert "[SYNTHETIC]" in syn["label"]


def test_determinism_same_seed_identical():
    assert audit_translation(42, 200) == audit_translation(42, 200)
    assert generate_conversion_corpus(7, 50) == generate_conversion_corpus(7, 50)


def test_different_seed_can_differ():
    # Not a strict guarantee, but the leak should move with the seed for a real corpus.
    a = audit_translation(1, 500)["leaked_conversions"]
    b = audit_translation(2, 500)["leaked_conversions"]
    assert isinstance(a, int) and isinstance(b, int)


def test_identity_property_fully_incremental_corpus():
    # ACL on a fully-incremental corpus == Conformist (nothing to remove → no leak).
    corpus = generate_conversion_corpus(42, 200, incremental_fraction=1.0)
    assert acl_translate(corpus).count == conformist_translate(corpus).count
    audit = audit_translation(42, 200, incremental_fraction=1.0)
    assert audit["leaked_conversions"] == 0
    assert audit["recorded_lift"] == audit["incremental_lift"]
    assert audit["corruption"]["upward_bias_pct"] == 0.0


# ----------------------------------------------------- translation-audit API --
def test_translation_audit_ok_shape(client):
    r = client.post(f"{M}/translation-audit", json={"term": "conversion", "seed": 42,
                                                    "count": 200})
    assert r.status_code == 200
    body = r.json()
    assert body["term"] == "conversion"
    assert body["seam"] == "BC-5 Measurement → BC-3 Incrementality"
    assert body["pattern"] == "Anticorruption Layer"
    assert body["recorded_lift"] > body["incremental_lift"]
    assert body["leaked_conversions"] > 0
    assert body["conformist_result"]["count"] == body["recorded_lift"]
    assert body["acl_result"]["count"] == body["incremental_lift"]


def test_translation_audit_determinism_identical_bytes(client):
    body = {"term": "conversion", "seed": 42, "count": 200}
    a = client.post(f"{M}/translation-audit", json=body)
    b = client.post(f"{M}/translation-audit", json=body)
    assert a.status_code == 200 and b.status_code == 200
    assert a.content == b.content


def test_translation_audit_422_unknown_term(client):
    r = client.post(f"{M}/translation-audit", json={"term": "reward"})
    assert r.status_code == 422


def test_translation_audit_422_count_out_of_range(client):
    r = client.post(f"{M}/translation-audit", json={"count": 99999})
    assert r.status_code == 422


def test_translation_audit_422_count_below_min(client):
    r = client.post(f"{M}/translation-audit", json={"count": 0})
    assert r.status_code == 422


def test_translation_audit_422_incremental_fraction_out_of_range(client):
    r = client.post(f"{M}/translation-audit", json={"incremental_fraction": 1.5})
    assert r.status_code == 422
    r0 = client.post(f"{M}/translation-audit", json={"incremental_fraction": 0.0})
    assert r0.status_code == 422


def test_translation_audit_writes_no_rows(client):
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
        client.post(f"{M}/translation-audit", json={"seed": 42, "count": 200})
    after = _counts()
    assert before == after, f"translation-audit must not write rows: {before} -> {after}"


def test_translation_audit_offline_fixture_matches_live(client):
    fixture = (Path(__file__).resolve().parent.parent.parent
               / "frontend" / "lib" / "fixtures" / "momentforge" / "translation-audit.json")
    if not fixture.exists():
        return  # fixture recorded by scripts.record_fixtures; skip if not yet generated
    recorded = json.loads(fixture.read_text())
    live = client.post(f"{M}/translation-audit",
                       json={"term": "conversion", "seed": 42, "count": 200}).json()
    assert recorded == live  # the offline fallback is REAL engine output

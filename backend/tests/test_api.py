"""API integration tests via TestClient (real app + DB, lifespan-seeded)."""
import uuid

M = "/api/v1/merchants/aurora-tickets"
BODY = {"base_version": "V17", "proposed_version": "V18", "session_seed": 42, "session_count": 200}


def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200 and r.json()["status"] == "ok"
    assert r.headers.get("X-Request-ID")


def test_policies_seeded(client):
    vers = {p["policy_version"] for p in client.get(f"{M}/policies").json()}
    assert {"V17", "V18", "V18-safe"} <= vers


def test_replay_blocked_and_trap(client):
    r = client.post(f"{M}/replay-jobs", headers={"Idempotency-Key": str(uuid.uuid4())}, json=BODY)
    assert r.status_code == 201
    job = r.json()
    assert job["verdict"]["value"] == "BLOCKED"
    assert any(c["key"] == "missing_attribute_semantics" and c["result"] == "FAIL"
               for c in job["constraint_results"])
    assert job["replay_summary"]["constraint_violation"] > 0


def test_replay_idempotency(client):
    key = str(uuid.uuid4())
    a = client.post(f"{M}/replay-jobs", headers={"Idempotency-Key": key}, json=BODY)
    b = client.post(f"{M}/replay-jobs", headers={"Idempotency-Key": key}, json=BODY)
    assert a.status_code == 201 and b.status_code == 200
    assert a.json()["id"] == b.json()["id"]
    # different key -> different job
    c = client.post(f"{M}/replay-jobs", headers={"Idempotency-Key": str(uuid.uuid4())}, json=BODY)
    assert c.json()["id"] != a.json()["id"]


def test_policy_diff(client):
    d = client.post(f"{M}/policy-diff", json={"base_version": "V17", "proposed_version": "V18"}).json()
    assert any(c["risk"] == "missing_attribute_flip" for c in d["changes"])


def test_conversion_dedup(client):
    conv = {"conversiontype": "Purchase", "confirmationref": "AUR-777", "amount": 10.0, "currency": "USD"}
    a = client.post(f"{M}/conversions", json=conv)
    b = client.post(f"{M}/conversions", json=conv)
    assert a.json()["status"] == "processed"
    assert b.json()["status"] == "deduplicated"
    assert a.json()["conversion_id"] == b.json()["conversion_id"]


def test_cancellation(client):
    r = client.post(f"{M}/cancellations", json={"itemReservationId": "res-1"}).json()
    assert r["state_transition"] == ["reserved", "confirmed", "canceled"]
    assert r["reversible"] is False


def test_audit_and_verify(client):
    job = client.post(f"{M}/replay-jobs", json=BODY).json()
    jid = job["id"]
    au = client.get(f"{M}/replay-jobs/{jid}/audit").json()
    assert len(au) > 0
    v = client.post(f"{M}/replay-jobs/{jid}/audit/verify").json()
    assert v["verified"] is True and v["first_tampered_seq"] is None


def test_safe_eligible(client):
    job = client.post(f"{M}/replay-jobs", json={"base_version": "V17", "proposed_version": "V18-safe"}).json()
    assert job["verdict"]["value"] == "ELIGIBLE_FOR_HOLDOUT"
    assert job["verdict"]["holdout_config"]["control_pct"] == 5


def test_404_envelope(client):
    r = client.get(f"{M}/policies/NOPE")
    assert r.status_code == 404
    body = r.json()
    assert "error" in body and body["error"]["request_id"]

"""End-to-end API smoke via TestClient (real app + DB, no network). Run: python api_smoke.py"""
import uuid

from fastapi.testclient import TestClient

from app.main import app

M = "/api/v1/merchants/aurora-tickets"


def main():
    with TestClient(app) as c:
        assert c.get("/health").json()["status"] == "ok"

        pols = c.get(f"{M}/policies").json()
        vers = {p["policy_version"] for p in pols}
        print("policies:", sorted(vers))
        assert {"V17", "V18", "V18-safe"} <= vers

        # replay V17 -> V18 (idempotent)
        key = str(uuid.uuid4())
        body = {"base_version": "V17", "proposed_version": "V18", "session_seed": 42, "session_count": 200}
        r = c.post(f"{M}/replay-jobs", headers={"Idempotency-Key": key}, json=body)
        assert r.status_code == 201, r.status_code
        job = r.json()
        jid = job["id"]
        print("V17->V18 verdict:", job["verdict"]["value"], "| request-id:", r.headers.get("X-Request-ID"))
        assert job["verdict"]["value"] == "BLOCKED"
        assert any(cr["key"] == "missing_attribute_semantics" and cr["result"] == "FAIL"
                   for cr in job["constraint_results"])

        # idempotency: same key -> same job, 200
        r2 = c.post(f"{M}/replay-jobs", headers={"Idempotency-Key": key}, json=body)
        assert r2.status_code == 200 and r2.json()["id"] == jid, "idempotency broken"

        # diff
        d = c.post(f"{M}/policy-diff", json={"base_version": "V17", "proposed_version": "V18"}).json()
        assert any(ch["risk"] == "missing_attribute_flip" for ch in d["changes"]), "diff missed the flip"

        # conversion dedup (verified keys)
        conv = {"conversiontype": "Purchase", "confirmationref": "AUR-10231", "amount": 149.99, "currency": "USD"}
        c1 = c.post(f"{M}/conversions", json=conv).json()
        c2 = c.post(f"{M}/conversions", json=conv).json()
        print("conversion:", c1["status"], "->", c2["status"])
        assert c1["status"] == "processed" and c2["status"] == "deduplicated"

        # cancellation transition
        cx = c.post(f"{M}/cancellations", json={"itemReservationId": "res-8842"}).json()
        assert cx["state_transition"] == ["reserved", "confirmed", "canceled"]

        # audit + verify
        au = c.get(f"{M}/replay-jobs/{jid}/audit").json()
        v = c.post(f"{M}/replay-jobs/{jid}/audit/verify").json()
        print("audit records:", len(au), "| verify:", v)
        assert v["verified"] is True and len(au) > 0

        # safe proposal -> eligible
        r3 = c.post(f"{M}/replay-jobs", json={"base_version": "V17", "proposed_version": "V18-safe"}).json()
        print("V17->V18-safe verdict:", r3["verdict"]["value"])
        assert r3["verdict"]["value"] == "ELIGIBLE_FOR_HOLDOUT"
        assert r3["verdict"]["holdout_config"]["control_pct"] == 5

        # 404 envelope
        nf = c.get(f"{M}/policies/DOES-NOT-EXIST")
        assert nf.status_code == 404 and "error" in nf.json()

    print("\nAPI SMOKE PASSED")


if __name__ == "__main__":
    main()

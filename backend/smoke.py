"""Quick engine smoke test (no DB, no server). Run: python smoke.py"""
import json
from pathlib import Path

from app.domain.audit import verify
from app.domain.policy import Policy
from app.domain.replay import run_replay

SEED_DIR = Path(__file__).parent / "seed" / "policies"
SECRET = "dev-threshold-secret"


def load(name: str) -> Policy:
    return Policy.model_validate(json.loads((SEED_DIR / name).read_text()))


def run(base_name, prop_name):
    base, prop = load(base_name), load(prop_name)
    job = run_replay(base, prop, session_seed=42, session_count=200,
                     injections=["timeout", "invalid_output", "stale_identity"], audit_secret=SECRET)
    v = verify(job["_audit"], SECRET)
    print(f"\n=== {base.policy_version} -> {prop.policy_version} ===")
    print("verdict     :", job["verdict"]["value"])
    for r in job["verdict"]["reasons"]:
        print("   reason   :", r)
    print("summary     :", job["replay_summary"])
    for c in job["constraint_results"]:
        print(f"   [{c['result']:4}] {c['key']}: {c['detail']}")
    print("failclosed  :", all(p["proof_valid"] for p in job["failclosed_proofs"]),
          "->", [p["injection"] for p in job["failclosed_proofs"]])
    print("audit verify:", v)
    return job


if __name__ == "__main__":
    j1 = run("aurora_v17.json", "aurora_v18.json")
    j2 = run("aurora_v17.json", "aurora_v18_safe.json")
    assert j1["verdict"]["value"] == "BLOCKED", j1["verdict"]
    assert any(c["key"] == "missing_attribute_semantics" and c["result"] == "FAIL"
               for c in j1["constraint_results"]), "trap not caught"
    assert j2["verdict"]["value"] == "ELIGIBLE_FOR_HOLDOUT", j2["verdict"]
    assert verify(j1["_audit"], SECRET)["verified"] is True
    print("\nALL SMOKE ASSERTIONS PASSED")

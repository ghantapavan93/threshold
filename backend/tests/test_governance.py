"""Governance vault: signed lifecycle, legal-only transitions, tamper evidence,
tenant isolation, and key rotation that history survives."""
import pytest

from app.domain.governance import GovernanceVault, Keyring, run_governance_demo


def test_demo_is_fully_trusted():
    r = run_governance_demo()
    assert r["verified"] is True
    assert r["illegal_transition_rejected"] is True
    assert r["tamper_detected"] is True
    assert r["tenant_isolation_holds"] is True
    assert r["key_rotated_mid_lifecycle"] is True
    assert r["trusted"] is True
    # the full lifecycle was walked, ending rolled_back
    stages = [t["stage"] for t in r["lineage"]]
    assert stages == ["draft", "reviewed", "approved", "signed", "shadow", "cohort", "rolled_back"]


def test_illegal_transition_is_refused():
    v = GovernanceVault(Keyring({"k": "s"}, "k"), "t", "V1")
    v.transition("draft", "a", "t0")
    with pytest.raises(ValueError):
        v.transition("live", "a", "t1")  # draft can only go to reviewed


def test_key_rotation_preserves_history():
    ring = Keyring({"k1": "one"}, "k1")
    v = GovernanceVault(ring, "t", "V1")
    v.transition("draft", "a", "t0")   # signed under k1
    ring.rotate("k2", "two")
    v.transition("reviewed", "a", "t1")  # signed under k2
    assert v.verify() is True           # both keys still verify
    assert {t.key_id for t in v.log} == {"k1", "k2"}


def test_endpoint(client):
    r = client.get("/api/v1/governance-demo").json()
    assert r["trusted"] is True

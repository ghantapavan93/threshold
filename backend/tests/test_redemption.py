"""Redemption — the third reward aggregate. Proves the part reconciliation.py left
as 'named, not proven': issued ≠ redeemable, and a redemption is legal only from a
currently-redeemable reward. An illegal redemption RAISES; it never silently wins."""
import pytest

from app.domain.redemption import (
    IllegalRedemption,
    Reward,
    RewardState,
    run_redemption_world,
)

AT, TTL = 1000, 100


def _issued() -> Reward:
    return Reward("rw-1", "earn-1").issue(AT, TTL)


# ---------- the state machine (issued ≠ redeemable) ----------

def test_earned_is_not_redeemable():
    r = Reward("rw", "e")
    assert not r.is_redeemable(AT)
    with pytest.raises(IllegalRedemption):
        r.redeem(AT + 10)  # earned ≠ redeemable


def test_issued_is_redeemable_only_inside_its_window():
    r = _issued()
    assert r.is_redeemable(AT + 50) is True
    assert r.is_redeemable(AT + TTL + 1) is False  # issued, but expired → not a right
    with pytest.raises(IllegalRedemption):
        r.redeem(AT + TTL + 1)


def test_a_right_is_exercised_once():
    r = _issued().redeem(AT + 10)
    assert r.state is RewardState.REDEEMED
    with pytest.raises(IllegalRedemption):
        r.redeem(AT + 20)  # double-redeem


def test_clawed_back_is_not_redeemable():
    r = _issued().clawback()
    assert not r.is_redeemable(AT + 10)
    with pytest.raises(IllegalRedemption):
        r.redeem(AT + 10)


def test_double_issue_is_a_double_liability_and_refused():
    r = _issued()
    with pytest.raises(IllegalRedemption):
        r.issue(AT, TTL)


def test_expire_only_after_window():
    with pytest.raises(IllegalRedemption):
        _issued().expire(AT + 10)  # not past expiry yet
    assert _issued().expire(AT + TTL + 1).state is RewardState.EXPIRED


# ---------- the seeded reconciliation ----------

def test_world_proves_issued_is_not_redeemable():
    r = run_redemption_world(24)
    ine = r["issued_ne_redeemable"]
    assert ine["issued_ever"] > ine["redeemable_at_cut"]  # strictly more issued than redeemable
    assert ine["gap"] > 0 and ine["claim_would_be_wrong"] is True


def test_world_invariant_holds_and_illegal_redeems_rejected():
    r = run_redemption_world(24)
    assert r["proof"]["holds"] is True
    assert r["proof"]["no_double_redeem"] is True
    assert r["proof"]["every_accepted_redeem_is_terminal"] is True
    # every rejected redemption names a real reason (expired / double / clawed / never-issued).
    rejected = [a for a in r["attempts"] if a["action"] == "redeem" and not a["accepted"]]
    assert rejected and all(a["reason"] != "ok" for a in rejected)
    assert r["summary"]["redeems_rejected"] >= 4  # each faulty fate contributes one


def test_world_is_deterministic():
    assert run_redemption_world(24) == run_redemption_world(24)

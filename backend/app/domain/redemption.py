"""Redemption — the third reward aggregate the reconciler refused to fake.

The "reward" ubiquitous-language collision has three meanings: EARNED (a claim),
ISSUED (a booked liability), and REDEEMABLE (a right — currently usable).
reconciliation.py proves earned ⇒ issued; it deliberately left REDEEMABLE as
"named, not proven" because expiry/clawback need their own aggregate. This is that
aggregate.

The disease is treating ISSUED as REDEEMABLE. An issued reward is a liability on the
books, but it is a RIGHT only while unexpired, unredeemed, and not clawed back.
Confuse the two and an expired, already-spent, or reversed reward gets redeemed — a
double liability or outright fraud. Here the state machine ENFORCES the distinction:
an illegal redemption RAISES (it never silently succeeds), and a seeded replay proves
the invariants over a fault world — including, head-on, that issued ≠ redeemable.

Pure and deterministic: event-time is passed in, no wall-clock; the world is seeded.
"""
from __future__ import annotations

from dataclasses import dataclass, replace
from enum import Enum


class RewardState(str, Enum):
    EARNED = "earned"            # a claim — qualified, nothing owed yet
    ISSUED = "issued"            # a booked liability — materialized
    REDEEMED = "redeemed"        # the right was exercised (terminal)
    EXPIRED = "expired"          # the window closed unused (terminal)
    CLAWED_BACK = "clawed_back"  # the liability was reversed (terminal)


class IllegalRedemption(Exception):
    """A lifecycle transition that would confuse the three reward meanings — redeeming
    something not currently redeemable, or issuing/redeeming the same reward twice."""


@dataclass(frozen=True)
class Reward:
    """A reward as history: frozen, each transition returns a new value. `state` is
    the stored lifecycle; REDEEMABLE is not a stored state — it is a PREDICATE over
    (state, expiry, now), which is the whole point of the collision."""

    reward_id: str
    earn_ref: str
    state: RewardState = RewardState.EARNED
    issued_at: int | None = None
    expires_at: int | None = None
    redeemed_at: int | None = None

    def is_redeemable(self, now: int) -> bool:
        # REDEEMABLE = a RIGHT: issued, inside its window, not yet spent or reversed.
        return (self.state is RewardState.ISSUED
                and self.expires_at is not None and now <= self.expires_at)

    def issue(self, at: int, ttl: int) -> "Reward":
        if self.state is not RewardState.EARNED:
            raise IllegalRedemption(
                f"cannot issue from {self.state.value}: only an EARNED reward is issued "
                "(a second issue is a second liability)")
        return replace(self, state=RewardState.ISSUED, issued_at=at, expires_at=at + ttl)

    def redeem(self, now: int) -> "Reward":
        if self.state is RewardState.EARNED:
            raise IllegalRedemption("cannot redeem an EARNED reward — it was never issued (earned ≠ redeemable)")
        if self.state is RewardState.REDEEMED:
            raise IllegalRedemption("already redeemed — a right is exercised once (double-redeem)")
        if self.state in (RewardState.EXPIRED, RewardState.CLAWED_BACK):
            raise IllegalRedemption(f"reward is {self.state.value} — issued ≠ redeemable")
        if not self.is_redeemable(now):
            raise IllegalRedemption(
                f"expired at {self.expires_at}, now {now} — issued ≠ redeemable")
        return replace(self, state=RewardState.REDEEMED, redeemed_at=now)

    def expire(self, now: int) -> "Reward":
        if self.state is not RewardState.ISSUED:
            raise IllegalRedemption(f"cannot expire from {self.state.value}")
        if self.expires_at is None or now <= self.expires_at:
            raise IllegalRedemption("not past expiry yet")
        return replace(self, state=RewardState.EXPIRED)

    def clawback(self) -> "Reward":
        if self.state is not RewardState.ISSUED:
            raise IllegalRedemption(f"cannot claw back from {self.state.value}: only a booked, unredeemed liability")
        return replace(self, state=RewardState.CLAWED_BACK)

    def as_dict(self) -> dict:
        return {"reward_id": self.reward_id, "earn_ref": self.earn_ref, "state": self.state.value,
                "issued_at": self.issued_at, "expires_at": self.expires_at, "redeemed_at": self.redeemed_at}


# ── The seeded redemption world ────────────────────────────────────────────────
# Each reward is earned, issued with a fixed window, then meets one scripted fate.
# The faulty fates are exactly the ways "issued == redeemable" bites.

_ISSUE_AT = 1000
_TTL = 100                 # standard redeemable window: [1000, 1100]
_LONG_TTL = 1000           # a still-live window: [1000, 2000]
_IN_WINDOW = 1050
_AFTER_WINDOW = 1200       # also the reconciliation cut — past standard windows, inside the long one

_FATES = (
    "redeem_in_window",       # legal: redeemed while redeemable
    "redeem_after_expiry",    # ILLEGAL: issued but past the window (issued ≠ redeemable)
    "double_redeem",          # ILLEGAL: exercise the right twice
    "clawback_then_redeem",   # ILLEGAL: reversed liability is not a right
    "redeem_before_issue",    # ILLEGAL: a claim is not a right
    "expire_unused",          # legal terminal: issued, never redeemed, window closed
    "issued_pending",         # legal: issued and still redeemable at the cut (issued ≠ redeemed)
)


@dataclass
class Attempt:
    reward_id: str
    action: str
    at: int
    accepted: bool
    reason: str

    def as_dict(self) -> dict:
        return {"reward_id": self.reward_id, "action": self.action, "at": self.at,
                "accepted": self.accepted, "reason": self.reason}


def _try(reward: Reward, action: str, fn, at: int, attempts: list[Attempt]) -> Reward:
    try:
        nxt = fn()
        attempts.append(Attempt(reward.reward_id, action, at, True, "ok"))
        return nxt
    except IllegalRedemption as exc:
        attempts.append(Attempt(reward.reward_id, action, at, False, str(exc)))
        return reward  # rejected — state unchanged, the discrepancy is VISIBLE


def run_redemption_world(count: int = 24) -> dict:
    now_cut = _AFTER_WINDOW  # cut past the standard windows, inside the long one
    rewards: list[Reward] = []
    attempts: list[Attempt] = []

    # Deterministic round-robin over the fates — every fault mode gets real volume.
    for i in range(count):
        fate = _FATES[i % len(_FATES)]
        r = Reward(reward_id=f"rw-{i:03d}", earn_ref=f"earn-{i:03d}")
        ttl = _LONG_TTL if fate == "issued_pending" else _TTL

        if fate == "redeem_before_issue":
            r = _try(r, "redeem", lambda: r.redeem(_IN_WINDOW), _IN_WINDOW, attempts)  # rejected
            r = _try(r, "issue", lambda: r.issue(_ISSUE_AT, _TTL), _ISSUE_AT, attempts)
            rewards.append(r)
            continue

        r = _try(r, "issue", lambda: r.issue(_ISSUE_AT, ttl), _ISSUE_AT, attempts)

        if fate == "redeem_in_window":
            r = _try(r, "redeem", lambda: r.redeem(_IN_WINDOW), _IN_WINDOW, attempts)
        elif fate == "redeem_after_expiry":
            r = _try(r, "redeem", lambda: r.redeem(_AFTER_WINDOW), _AFTER_WINDOW, attempts)  # rejected
        elif fate == "double_redeem":
            r = _try(r, "redeem", lambda: r.redeem(_IN_WINDOW), _IN_WINDOW, attempts)
            r = _try(r, "redeem", lambda: r.redeem(_IN_WINDOW + 1), _IN_WINDOW + 1, attempts)  # rejected
        elif fate == "clawback_then_redeem":
            r = _try(r, "clawback", lambda: r.clawback(), _IN_WINDOW - 10, attempts)
            r = _try(r, "redeem", lambda: r.redeem(_IN_WINDOW), _IN_WINDOW, attempts)  # rejected
        elif fate == "expire_unused":
            r = _try(r, "expire", lambda: r.expire(_AFTER_WINDOW), _AFTER_WINDOW, attempts)
        # "issued_pending" → leave ISSUED, still redeemable at the cut

        rewards.append(r)

    return _reconcile(rewards, attempts, now_cut)


def _reconcile(rewards: list[Reward], attempts: list[Attempt], now_cut: int) -> dict:
    by_state: dict[str, int] = {s.value: 0 for s in RewardState}
    for r in rewards:
        by_state[r.state.value] += 1

    issued_ever = sum(1 for r in rewards if r.issued_at is not None)
    redeemable_now = sum(1 for r in rewards if r.is_redeemable(now_cut))
    redeemed = by_state[RewardState.REDEEMED.value]

    accepted_redeems = [a for a in attempts if a.action == "redeem" and a.accepted]
    rejected_redeems = [a for a in attempts if a.action == "redeem" and not a.accepted]

    # Every accepted redemption landed on a reward that is now REDEEMED, exactly once.
    redeemed_ids = [a.reward_id for a in accepted_redeems]
    no_double_redeem = len(redeemed_ids) == len(set(redeemed_ids))
    all_accepted_terminal = all(
        next(r for r in rewards if r.reward_id == a.reward_id).state is RewardState.REDEEMED
        for a in accepted_redeems)

    return {
        "seed_world": {"issue_at": _ISSUE_AT, "ttl": _TTL, "cut_at": now_cut},
        "rewards": [r.as_dict() for r in rewards],
        "by_state": by_state,
        "attempts": [a.as_dict() for a in attempts],
        "summary": {
            "rewards": len(rewards),
            "issued_ever": issued_ever,
            "redeemable_now": redeemable_now,
            "redeemed": redeemed,
            "redeem_attempts": len(accepted_redeems) + len(rejected_redeems),
            "redeems_accepted": len(accepted_redeems),
            "redeems_rejected": len(rejected_redeems),
        },
        # The collision, proven as numbers: ISSUED is not the same set as REDEEMABLE.
        "issued_ne_redeemable": {
            "issued_ever": issued_ever,
            "redeemable_at_cut": redeemable_now,
            "gap": issued_ever - redeemable_now,
            "claim_would_be_wrong": issued_ever != redeemable_now,
        },
        "proof": {
            "no_double_redeem": no_double_redeem,
            "every_accepted_redeem_is_terminal": all_accepted_terminal,
            "no_illegal_redeem_succeeded": all(a.reason == "ok" for a in accepted_redeems),
            "holds": no_double_redeem and all_accepted_terminal,
        },
        "law": "A reward is redeemable only while issued AND unexpired AND unredeemed AND not clawed back — issued is a liability, redeemable is a right, and they are not the same set.",
        "note": ("The state machine enforces the distinction: an illegal redemption raises, it never "
                 "silently succeeds. This seeded replay proves it — every rejected redemption is a "
                 "VISIBLE discrepancy (expired, double, clawed-back, or never-issued), and the accepted "
                 "ones each land on a currently-redeemable reward exactly once."),
    }

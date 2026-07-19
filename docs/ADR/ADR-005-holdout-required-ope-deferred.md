# ADR-005 — Holdout is mandatory; OPE is deferred (interface only)

**Status:** Accepted

**Context.** Off-policy evaluation (IPS/SNIPS/doubly-robust) is mathematically attractive but (a) needs logged action propensities with no public evidence Rokt exposes them, and (b) invites "you're skipping A/B testing" criticism if misused.

**Decision.** The only positive verdict is **`ELIGIBLE_FOR_HOLDOUT`** — never "safe to launch." Replay filters **known** violations; it does not estimate causal impact. OPE is left as a *future pre-screen* that must be able to return `INSUFFICIENT_EVIDENCE` and refuse on thin support, and can **never** replace the mandatory online holdout (Rokt's verified 5%-control Page Holdout).

**Consequences.** (+) Statistically honest; respects Rokt's experimentation maturity. (+) Keeps the MVP deterministic and defensible. (−) Less "advanced ML" surface now — intentionally, to avoid an indefensible claim.

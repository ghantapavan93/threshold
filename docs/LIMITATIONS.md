# Limitations (read this)

Honesty is a feature. The strongest thing this project can do in front of a Rokt engineer is be candid about what it is and isn't.

## What this is
A **narrow, deterministic, doc-grounded** demonstration of policy-change safety at the Transaction Moment, runnable end-to-end on synthetic data.

## What this is not
- **Not proof of real-world impact.** Synthetic sessions demonstrate the *mechanism* (a missing-attribute flip silently widens eligibility; failures resolve to No Offer Rendered). They cannot establish *efficacy* or *causal safety*. Only a controlled online **holdout** can — which is exactly why the only positive verdict is `ELIGIBLE_FOR_HOLDOUT`.
- **Not a claim that Rokt lacks this.** Rokt almost certainly has internal deployment safety, experimentation, and policy tooling that are not public. Threshold is framed as *adjacent homework*, not a gap.
- **Not production-scale.** The MVP processes a replay synchronously in a single transaction (fine for a few hundred sessions). At Rokt scale this becomes an async worker + transactional outbox + batching + read replicas (documented, not built).

## The load-bearing assumption
That a decision-platform/partner engineer has a **change-management workflow** where a pre-release safety gate fits. Public evidence for the *shape* of this workflow is partial (One Platform config/publish, "Only Rokt staff can edit custom rules," sandbox, holdouts, Integration Monitor) — see `research/rokt/20_CHANGE_MANAGEMENT_DEEPDIVE.md`. It is a **plausible, partially-verified** premise, not a proven one; the framing reflects that.

## Pitfalls we deliberately avoided
Other tools (and earlier drafts) produced confident-sounding fabrications. We verified against primary docs and **kept these out**:
- Invented SDK enums (`TIMEOUT`, `NO_OFFERS`, `NETWORK_ERROR`, `NO_WIDGET`) — the real API is `Selection.on` + `PLACEMENT_FAILURE`.
- A `SHOW_NOTHING` code constant — it is a documented *behavior*, so we call the outcome "No Offer Rendered."
- "Thousands of signals" — the published figure is "30+".
- Per-transaction "$7-of-$8" settlement — that is aggregate PR, not a documented subsystem; we model **no** money math.
- A refund endpoint — none exists publicly; we model cancellation only.

## Known smaller gaps
- Auth is a demo header (`X-Threshold-User`); real deployment needs proper auth + per-tenant authorization.
- Next.js is at **14.2.35** — the final patch of the 14.x line (bumped from 14.2.15 on 2026-07-19). `npm audit` still reports advisories whose only fix is the breaking Next 16 major. We reviewed each: they target middleware, `next/image` optimization, i18n routing, WebSocket upgrades, CSP nonces, and `beforeInteractive` scripts — **none of which this app uses**, and every route is statically prerendered. Acceptable for a demo; a real deployment should do the Next 15/16 migration rather than accept the residual.
- The frontend "compare outcomes / self-driving demo" polish is an enhancement layer on top of the verified golden path.

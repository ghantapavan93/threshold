# Product Thesis (frozen)

## One sentence
Before a placement-policy change reaches a single real customer, **Threshold** proves it fails closed to *No Offer Rendered*, preserves the merchant's checkout, respects hard constraints, handles duplicate/cancelled conversions safely, and is eligible **only** for a controlled online holdout.

## Primary user & job
A **decision-platform / partner-integration engineer** preparing an **eligibility-policy change** for the Transaction Moment. Their job-to-be-done: *"prove this change can't harm checkout, can't silently widen eligibility, and can't produce an invalid state — before I even start a holdout."* (The strength of this workflow assumption is examined honestly in `research/rokt/20_CHANGE_MANAGEMENT_DEEPDIVE.md` and `LIMITATIONS.md`.)

## Threshold IS
- A **policy-change safety gate**: versioned Policy Contract → deterministic **Policy Diff Replay** → hard-constraint validation → **fail-closed proof** → append-only **tamper-evident** evidence → a release **verdict**.
- Deterministic and explainable end-to-end. Useful with the LLM (there is none in the hot path) entirely absent.

## Threshold IS NOT
- Not **Rokt Brain** or any offer-selection / relevance model. It validates the *rules around* the decision, never which offer is shown.
- Not an **experimentation platform** — it does not run A/B tests or estimate uplift; it enforces holdout *eligibility*.
- Not a **CDP / consent manager** (mParticle) — it *checks* that a policy honors consent; it does not enforce consent at serving time.
- Not a **settlement / accounting** system — it models cancellation state transitions only, with no money math.
- Not an **observability / feature-flag** product — those primitives exist elsewhere (Datadog, LaunchDarkly, Statsig).

## Why this is not a clone
| Adjacent thing | Why Threshold is distinct |
|---|---|
| **Rokt Brain** | Brain selects offers with ML; Threshold is a deterministic guard on the *policy change*, not the selection. |
| **mParticle** (Audience Agent / consent) | mParticle builds/activates audiences and enforces consent; Threshold validates a change *references* consent and doesn't silently widen a missing-attribute audience. |
| **Rebuy Monetize** | Post-purchase offers on Shopify with rented (Fluent) demand; not a pre-release policy-safety gate. |
| **LaunchDarkly / Statsig / Eppo** | Generic feature flags + experimentation. Threshold is narrow to **transaction-serving policy** with event-time replay and a fail-closed/checkout-preservation proof. |
| **Integration Monitor** | Validates live integration health post-hoc; Threshold validates a *proposed change* pre-release. |

The distinctiveness is the **combination anchored to the Transaction Moment**: event-time-bounded replay + explicit fail-closed/checkout-preservation proof + a verdict blockable by *safety*, not performance. The underlying primitives are not new — and the framing is deliberately humble about that.

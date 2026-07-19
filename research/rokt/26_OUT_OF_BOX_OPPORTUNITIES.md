# 26 — Out-of-the-Box Opportunities (non-obvious, grounded seams beyond Threshold)

**Date:** 2026-07-18 · Retrieval 2026-07-18
**Discipline:** Every item below is labeled **HYPOTHESIS**. These are *adjacent seams I'd want to explore and validate with a Rokt engineer* — never claims that Rokt has a gap. Rokt is sophisticated and almost certainly has internal thinking on all of these. The value is the *framing* (finding the non-obvious seam) and the demonstrated ability to own a problem class end-to-end.
**Relationship to prior docs:** `22_ADDITIONAL_OPPORTUNITIES.md` and `docs/FUTURE_VISION.md` already cover "apply Threshold's pre-flight to loyalty / data / agents / incrementality / integrations." This doc deliberately goes **beyond** that "same gate, new surface" pattern — each idea here is a *distinct problem class* with its own architecture, not a re-point of the policy pre-flight.

---

## Grounding: what's VERIFIED vs. what's my INFERENCE

### VERIFIED — Rokt's own public statements
| Fact | Source |
|---|---|
| "Checkout becomes the **validation layer** for AI-led journeys"; consumers "still want **confirmation, control, and transparency** at the moment of purchase." | [rokt.com/blog — How Agentic AI Is Rewriting the Role of Checkout](https://www.rokt.com/blog/how-agentic-ai-is-rewriting-the-role-of-checkout-in-ecommerce) |
| Rokt Brain "determine[s] the **next best action** for every individual" for "real-time relevance in the Transaction Moment." | Same post + [Rokt Brain & Network product page](https://www.rokt.com/products/rokt-brain-and-rokt-network) |
| **Would Have Seen (WHS) holdout:** "Once a user is deemed a member of the WHS, they're **always a member and are excluded from all future opportunities** to see any of the brand's ad via the platform." | [Rokt — Introduction to Incrementality: Meet the Would'ves](https://www.rokt.com/blog/incrementality-performance-standard-rokt-haus-transaction-moment) (WHS mechanics quoted from Rokt's incrementality resource; canonical `resources_post` URL 404'd on fetch — treat the exact wording as retrieved-via-search, the concept is Rokt-published) |
| Rokt is running **independent incrementality experiments with Haus** (AI causal marketing platform) across Rokt Ads. | [Rokt — Incrementality Is The Performance Standard](https://www.rokt.com/blog/incrementality-performance-standard-rokt-haus-transaction-moment) |
| Internal engineering: "you're **governing a fleet of agents**: setting intent, reviewing direction, enforcing standards, **watching for drift**"; "Services that … **expose contracts rather than internals** are architecturally safe for agentic development"; they measured "cycle time, review cycles, **defect rates**." | [Rokt — From Craft to Orchestration](https://www.rokt.com/blog/from-craft-to-orchestration-how-rokts-engineering-teams-learned-to-build-with-ai) |
| **Gift with Purchase / Shopper Rewards:** shoppers "unlock a reward … discount, cashback, or gift card — by completing a simple action during checkout"; Rokt Brain analyzes "more than 1.95 trillion data points per year." | [Rokt — Boosting Conversion and Loyalty with Gift with Purchase](https://www.rokt.com/blog/boosting-conversion-and-loyalty-with-rokts-gift-with-purchase) |
| Scale: **10B+ transactions, 1.1B customers, sub-100ms decisioning.** | Rokt Brain & Network product page (also in `FUTURE_VISION.md` verified block) |

### VERIFIED — industry context (third-party, not Rokt)
| Fact | Source |
|---|---|
| **AP2 (Agent Payments Protocol):** three signed mandates — **Intent, Cart, Payment** — are W3C Verifiable Credentials that "create a **tamper-proof chain of authorization**." Donated to the **FIDO Alliance** (v0.2, April 2026). | [digitalapplied — Agentic Commerce Standards](https://www.digitalapplied.com/blog/agentic-commerce-standards-ucp-acp-ap2-2026-merchant-guide), [Applied Technology Index — protocol comparison](https://appliedtechnologyindex.com/research/2026-comparative-analysis-agentic-commerce-payment-protocols/) |
| **ACP (OpenAI/Stripe):** OpenAI **shut down Instant Checkout in March 2026** after ~5 months at "**near-zero sales**." Protocol survives; the in-chat checkout product did not. | [Applied Technology Index](https://appliedtechnologyindex.com/research/2026-comparative-analysis-agentic-commerce-payment-protocols/), [digitalapplied](https://www.digitalapplied.com/blog/agentic-commerce-standards-ucp-acp-ap2-2026-merchant-guide) |
| **UCP (Google/Shopify):** public MCP endpoint, self-serve agent onboarding from June 2026. | [digitalapplied](https://www.digitalapplied.com/blog/agentic-commerce-standards-ucp-acp-ap2-2026-merchant-guide) |

Everything below the line in each opportunity is **my inference / design**, not a Rokt statement.

---

## The eight

Each: **thesis · pain · the non-obvious seam · architecture (components + AI method + where determinism/safety lives) · how a holdout proves it · honest risk.**

---

### 1. Holdout Integrity Ledger — treat "Would Have Seen" as a systems-integrity problem, not a statistics problem [HYPOTHESIS]

**Thesis.** Incrementality is only as trustworthy as the guarantee that a WHS member is *never* exposed. That guarantee is a distributed-systems invariant, not a stats question — and it's the part everyone assumes "just works."

**Pain.** Rokt's whole incrementality story rests on the WHS being airtight ("always a member … excluded from all future opportunities" — VERIFIED). But "all future opportunities" now spans checkout offers, Shopper Rewards, Rokt Thanks post-purchase, and onsite media — across services, caches, retries, and 17 countries. A *single* leaked exposure of a holdout member doesn't crash anything; it silently biases measured lift **upward**, and no dashboard shows it. Advertisers are being sold a "performance standard" whose validity depends on an invisible invariant.

**The non-obvious seam.** People frame incrementality as "pick the right estimator / power the test." The real fragility is upstream: WHS assignment is **stateful, append-only, and must be honored globally with exactly-once semantics under concurrency**. That is an idempotency + audit + replay problem — precisely the boring plumbing that determines whether the fancy stats mean anything.

**Architecture.**
- **WHS Ledger** — append-only, tamper-evident (hash-chained) assignment store; assignment is idempotent per (shopper, brand, experiment); "once WHS always WHS" enforced by the ledger, not by each caller.
- **Exclusion Gate (deterministic, in the decision hot path)** — before any surface serves a brand's offer, it checks the ledger; **fail-closed** = if the ledger can't confirm "not held out," treat as held out (never risk a leak).
- **Leak Auditor (offline replay)** — replays event-time exposure logs against the ledger and emits a per-experiment **integrity certificate**: "0 holdout members were exposed across N surfaces," or lists the exact contaminating events.
- **AI method:** none in the core (deliberately). Optional ML *only* at the edge to flag anomalous exposure patterns for human review.
- **Where determinism/safety lives:** the ledger + exclusion gate are pure/deterministic and fail-closed; the certificate is reproducible from logs.

**How a holdout proves it.** Meta: run a deliberate fault-injection where a small % of holdout members are exposed via a shadow path; prove the auditor catches 100% of injected leaks and the certificate correctly refuses to validate the experiment. Business proof: measured lift on experiments *with* a clean integrity certificate should be lower-variance and defensible vs. uncertified runs.

**Honest risk.** Rokt very likely already enforces WHS integrity internally; this could be table-stakes plumbing they've had for years. The differentiator would be the *certificate as a sellable artifact* (advertiser-facing measurement assurance), which may be more product than engineering. Also: the hot-path ledger lookup adds latency to a sub-100ms budget — the fail-closed default must be cheap.

---

### 2. Agent Mandate Verifier at the Transaction Moment — constrain the Brain to what the human actually authorized [HYPOTHESIS]

**Thesis.** When an LLM shopping agent arrives at checkout carrying a signed AP2/ACP mandate chain, Rokt's next-best-action decision must be *bounded by what the mandate authorized* — you cannot upsell a reward or offer the human never consented to.

**Pain.** Rokt says checkout is "the validation layer for AI-led journeys" and that shoppers want "confirmation, control, and transparency" (VERIFIED). AP2 encodes that consent as three signed mandates — Intent, Cart, Payment — forming a "tamper-proof chain of authorization" (VERIFIED industry). But the Rokt Brain optimizes "next best action for every individual" — and an agent-mediated session is a *bot* relaying a human's bounded intent. If the Brain surfaces an offer outside the mandate's envelope, that's a consent violation dressed as personalization.

**The non-obvious seam.** Everyone is racing to build agent *payment* rails. The overlooked layer sits *between* the agent and the payment: the **offer decision** also needs to respect the mandate. Rokt is uniquely positioned because it *owns that decision* at the Transaction Moment — but the Brain wasn't designed to take a signed authorization envelope as a hard constraint. The seam is a deterministic **conformance boundary** wrapping a probabilistic decision engine.

**Architecture.**
- **Mandate Verifier** — validates the W3C VC chain (signatures, issuer, non-expiry, cart binding) deterministically; extracts an **Authorized Action Envelope** (what categories/actions/spend the human consented to).
- **Decision Constraint Layer** — the Brain proposes; this layer *filters/vetoes* any proposed action outside the envelope. **Fail-closed:** unverifiable mandate → degrade to the non-agentic, consent-safe default (e.g., show nothing incremental).
- **Human-on-irreversible step** — anything that creates a financial obligation still requires the shopper's explicit confirm surface (aligns with Rokt's own "confirmation/control" framing).
- **AI method:** Brain (probabilistic) stays as-is; the wrapper is pure. Optional LLM only to render a plain-language "here's what this offer is and why it's within what you approved" explanation — off the critical path.
- **Where determinism/safety lives:** verification + envelope enforcement are deterministic and fail-closed; the Brain never gets to override the envelope.

**How a holdout proves it.** Segment agent-mediated sessions; compare mandate-conformant decisioning vs. unconstrained on (a) consent-violation rate (should → 0) and (b) incremental conversion — proving the safety constraint doesn't destroy lift.

**Honest risk.** Protocol volatility is severe: ACP's flagship product died in 5 months; standards are still consolidating (FIDO took AP2 only in April 2026). Building to a moving target risks throwaway work. Mitigate by targeting the *stable abstraction* (a signed authorization envelope) rather than any one protocol's wire format. Also: if agent-mediated checkout volume stays tiny, this is a bet on a future that may arrive slowly.

---

### 3. Incrementality of Agent-Mediated Offers — does a Transaction-Moment offer even *work* when a bot is in the loop? [HYPOTHESIS]

**Thesis.** An offer shown to a human and the "same" offer surfaced through an AI agent that may summarize, reorder, or suppress it are **different causal objects**. Rokt should be the first to *measure* whether its offers retain incremental lift under agent mediation — and detect when agents mangle the offer.

**Pain.** OpenAI killed Instant Checkout in March 2026 after near-zero sales (VERIFIED industry). The blunt lesson: agent-mediated commerce economics are *unproven*, and "it converts for humans" does not transfer. Rokt's differentiator is incrementality rigor; the highest-leverage use of that rigor right now is to answer, with data, "do our offers survive the agent layer?" — before betting the roadmap on agentic surfaces.

**The non-obvious seam.** Two things hide here. (1) **Presentation integrity:** an agent can technically "show" an offer while stripping the imagery, truncating the value prop, or burying it — so exposure ≠ exposure. Standard incrementality assumes a faithful impression. (2) The right holdout must randomize *at the agent-mediation boundary*, which most measurement stacks aren't instrumented to do.

**Architecture.**
- **Mediation Classifier** — tags each session's channel: direct-human, agent-assisted, fully-agentic (from UA/protocol/mandate signals).
- **Presentation-Integrity Probe** — deterministic check that the delivered offer payload matches what was served (hash of rendered fields the agent echoes back / structured receipt), flagging "degraded impressions."
- **Mediation-Stratified Holdout** — WHS assignment stratified by mediation class so lift is estimated *per channel*, not blended.
- **AI method:** lightweight classifier at the edge; core measurement stays deterministic aggregation.
- **Where determinism/safety lives:** integrity probe + stratified assignment are deterministic; "degraded impression" is a hard, reproducible flag, not a model guess.

**How a holdout proves it.** By construction this *is* a holdout design: report incremental lift separately for direct vs. agent-mediated, and correlate lift loss with the degraded-impression rate — turning "agents hurt performance" from folklore into a measured, per-partner number.

**Honest risk.** Agent-mediated volume may be too low in 2026 for statistically powered per-channel lift (underpowered → no conclusion). Presentation-integrity detection depends on agents returning honest receipts, which not all protocols support. This is a "get ready for" bet whose payoff timing is uncertain.

---

### 4. Reward Liability Idempotency & Reconciliation — exactly-once economics for Gift-with-Purchase [HYPOTHESIS]

**Thesis.** A reward promised at checkout is a **financial liability** the instant it's shown. Retries, timeouts, and multi-surface exposure make double-issuance and orphaned rewards a real correctness risk — this is an exactly-once + reconciliation problem, not a UX problem.

**Pain.** Shopper Rewards / Gift with Purchase issues discounts, cashback, and gift cards at the Transaction Moment (VERIFIED). At 10B+ transactions with sub-100ms budgets, the hot path *will* retry. Two failure modes cost real money and trust: **double-issue** (same shopper earns a $10 gift card twice from one action) and **orphan** (shopper is promised a reward that never materializes → support tickets, churn). Neither shows up as an error; both show up as slow financial leakage or angry customers.

**The non-obvious seam.** Reward issuance looks like a marketing feature; underneath it's a **ledger with money semantics** that must survive partial failures. The seam most miss: "earned," "issued," and "redeemable" are three distinct states that can silently diverge, and only a periodic **replay reconciliation** can prove they still agree.

**Architecture.**
- **Reward Ledger** — idempotent issuance keyed by (shopper, action, campaign); append-only; a **transactional outbox** emits the fulfillment event atomically with the earn record (exactly the outbox pattern already prototyped in Threshold's `app/outbox.py`).
- **Fulfillment Worker** — drains the outbox with backoff + dead-lettering; issuance is idempotent so replays are safe.
- **Reconciliation Replay** — periodically proves `earned == issued == redeemable`; emits a discrepancy report (the money-correctness certificate).
- **AI method:** none in the core; optional anomaly detection on the discrepancy stream.
- **Where determinism/safety lives:** idempotency key + outbox atomicity guarantee no double-issue / no orphan; reconciliation is a deterministic replay.

**How a holdout proves it.** Correctness proof via fault injection (kill the worker mid-issue; prove no dup, no orphan). Business proof (holdout-adjacent): partners on the reconciled path should see lower reward-related support-contact rates and tighter liability accruals vs. the legacy path.

**Honest risk.** This is closer to a payments/ledger platform capability than a novel product — Rokt may already run it inside their rewards infra. Its appeal is precisely that it's *unglamorous but load-bearing*, which is a harder story to sell as "innovative." Best positioned as "I understand the money-correctness layer under the loyalty product," not as a new surface.

---

### 5. Conformance Gate for Agent-Authored Decisioning Changes — extend the pre-flight from human policy edits to agent-written code [HYPOTHESIS]

**Thesis.** Rokt's engineers now "govern a fleet of agents … watching for drift" that write real code. The risk from an AI-authored change to *decisioning* logic isn't bad style — it's a semantically-valid diff that silently alters *who gets what*. Threshold's replay-diff idea should point at **agent-generated PRs**, not just human policy edits.

**Pain.** From Rokt's own blog (VERIFIED): agents now "suggest, implement, run test suites, iterate on failures, generate PRs," and review has shifted to "governing a fleet of agents … watching for drift"; they track "defect rates." Tests and lint catch broken code. They do **not** catch a change that compiles, passes tests, and quietly widens an eligibility cohort or shifts offer selection for a slice of traffic. That's the exact class of silent-widening harm Threshold was built to catch — now arriving via a new author: an LLM.

**The non-obvious seam.** Everyone hardening AI-assisted dev is thinking about *code* correctness (security, secrets, test coverage). The overlooked layer is *behavioral* correctness of decisioning: does this diff change decisions **outside the set the change was intended to touch**? "Governing agents / watching for drift" is Rokt's own language — a behavioral-diff replay gate is the mechanized version of exactly that.

**Architecture.**
- **Behavioral Diff Replayer** — runs the candidate build and the current build against a corpus of logged event-time decisions; computes the *decision delta* set.
- **Intent Envelope** — the PR declares its intended scope ("only affects segment X"); the gate **fails closed** if the observed delta escapes that envelope (silent widening detected).
- **Evidence Bundle** — tamper-evident record of exactly which decisions flipped, attached to the PR for the human "fleet governor."
- **AI method:** the *change* is AI-authored; the *gate* is deterministic replay (no model in the verdict). Optional LLM only to *summarize* the delta for the reviewer — off the critical path (ADR-002 style).
- **Where determinism/safety lives:** replay + envelope check are pure and reproducible; positive verdict means "delta is within declared intent," never "safe to ship" (holdout still governs live rollout).

**How a holdout proves it.** Seed known-bad agent diffs (deliberate silent widenings) into a shadow PR stream; prove the gate blocks 100% while passing benign in-scope diffs. Downstream: fewer decisioning defects reaching production vs. the tests-only baseline (Rokt already measures defect rates — the comparison is native).

**Honest risk.** Overlaps conceptually with Threshold's core, so the "new problem class" claim is thinner — the novelty is the *author* (agent) and *unit* (code diff, not policy JSON). Building a representative logged-decision corpus with no future-information leakage is hard. And Rokt's "architecturally safe for agentic development" stance (contracts + independent deploys) suggests they may prefer *architectural* guardrails over a *behavioral* gate — this would have to prove it catches what architecture alone can't.

---

### 6. Cross-Surface Exposure & Frequency Integrity — one authority for "how many times, on which surfaces, within which limits" [HYPOTHESIS]

**Thesis.** Once a single shopper can be touched across checkout offers + Shopper Rewards + Rokt Thanks + onsite media, there's no single authority guaranteeing global frequency, consent, and holdout-exclusion constraints — the constraints are *per surface*, but the shopper is *one person*.

**Pain.** Rokt's stated 2026 thesis is that winners "manage checkout, loyalty, onsite media … as a **unified system**" (VERIFIED, silicon review / Rokt framing). The moment surfaces unify, the hard part isn't the offer — it's that per-surface caps and per-surface WHS checks don't compose into a correct *global* guarantee. A shopper can be over-messaged, or (worse) a holdout member excluded on surface A but exposed on surface B — silently breaking both experience and measurement.

**The non-obvious seam.** Frequency capping reads like a trivial counter. At 1.1B customers across surfaces it's a **distributed-consensus + idempotency** problem: decrementing a shared exposure budget under concurrency, exactly once, fast enough for a sub-100ms budget, while honoring the global WHS exclusion (ties directly to #1). Everyone underestimates it because it looks like `count++`.

**Architecture.**
- **Global Exposure Budget Service** — per-(shopper, brand, window) budget with **idempotent decrements** (retry-safe); fail-closed = if budget can't be confirmed, don't expose.
- **Constraint Composer** — merges frequency + consent + global WHS exclusion into one allow/deny at decision time.
- **Audit/Replay** — reproduces from logs that per-shopper caps and holdout exclusions held *across all surfaces* (a global integrity certificate; superset of #1's).
- **AI method:** none in the core; the Brain still picks *what* to show, this governs *whether it's allowed to*.
- **Where determinism/safety lives:** idempotent decrement + fail-closed compose + reproducible audit.

**How a holdout proves it.** Fault-inject concurrent multi-surface exposures; prove no cap is exceeded and no WHS member is touched. Experience proof: hold out the global-budget path and compare unsubscribe / offer-fatigue signals vs. per-surface-only capping.

**Honest risk.** A global low-latency budget service is genuinely hard and possibly already solved inside Rokt's serving stack. The consistency/latency trade-off is real — strict exactly-once decrement fights the sub-100ms budget, so a principled *approximate* scheme (with the audit catching violations after the fact) may be the honest design, which weakens the "hard guarantee" pitch.

---

### 7. Self-Serve Incrementality Guardrail — treat holdout inventory as a scarce, revenue-costly resource that a gate must protect [HYPOTHESIS]

**Thesis.** If advertisers can self-serve incrementality tests, the failure mode isn't a bad UI — it's naive users launching underpowered tests, peeking early, and burning **holdout inventory** (a finite, shared, revenue-suppressing resource) to reach false conclusions. A deterministic pre-registration gate should refuse or auto-size doomed tests *before* they consume holdout.

**Pain.** Rokt is pushing incrementality as *the* performance standard and validating it with Haus (VERIFIED). The natural next step is self-serve. But every holdout member is suppressed revenue Rokt/partner *chooses to forgo* to measure truth. A self-serve user who runs a test too small to detect their true effect, then stops it early on a noisy up-day, has spent real money to mislead themselves — and will blame the platform.

**The non-obvious seam.** Self-serve measurement is usually framed as a *reporting/UX* problem. The engineering seam is **governance of a scarce resource**: a test should have to *earn* its holdout allocation by passing a power/pre-registration check, and the analysis plan should be **sealed** so "peeking" is structurally impossible. This is the Threshold discipline — *"a positive verdict = eligibility, not permission to declare victory"* — applied to measurement economics.

**Architecture.**
- **Pre-Registration Gate** — deterministic power calculation from the advertiser's baseline; **refuses or auto-sizes** tests that can't detect a plausible effect; allocates only the holdout the test actually needs.
- **Sealed Analysis Plan** — the success metric, horizon, and stopping rule are hash-committed up front; results unseal only at the pre-committed horizon (or via valid sequential-testing boundaries) — no-peeking enforced by construction.
- **Holdout Budget Accountant** — tracks holdout as spend; reports forgone-revenue cost per test so it's a visible resource, not free.
- **AI method:** none in the verdict; optional LLM to explain "why your test was resized / why you can't read it yet" in plain language.
- **Where determinism/safety lives:** power gate + sealed plan are deterministic and tamper-evident; the gate fails closed (no valid plan → no holdout).

**How a holdout proves it.** Meta-evaluation: simulate a population of naive self-serve users with/without the gate; prove the gated cohort reaches correct conclusions at materially lower total holdout spend and near-zero false-positive "we found lift" rates.

**Honest risk.** This constrains advertisers, and self-serve products live or die on frictionlessness — a gate that says "no, resize your test" may be rejected commercially even if it's scientifically right. It also assumes Rokt wants to *expose* measurement mechanics to advertisers rather than keep them managed-service; that's a product-strategy call I can't verify.

---

### 8. Clean-Room Lift Certificate — prove incremental lift without a raw-identity join, and make the proof independently verifiable [HYPOTHESIS]

**Thesis.** Measuring lift requires joining Rokt's exposure logs to the advertiser's conversion data — a raw-PII join that's increasingly untenable. The seam: compute the lift statistic *without either side seeing the other's raw identifiers*, and emit a **tamper-evident lift certificate** both parties can trust without re-running the join.

**Pain.** Incrementality's dirty secret is the identity join. As deletion/revocation and cross-party PII sharing get harder (and `FUTURE_VISION.md` already flags consent-aware replay), the join itself becomes the liability. Advertisers also have to *take Rokt's word* for the reported lift — there's no artifact they can independently verify, which is awkward for a "performance standard."

**The non-obvious seam.** Privacy-preserving measurement is usually pitched as "use a clean room" and stops there. Two overlooked pieces: (1) the result should come with a **reproducible computation transcript** so the advertiser can verify the number was computed as agreed — trust-minimized, not trust-me; (2) the certificate must bind to the **consent state as-of measurement time**, so a later deletion doesn't retroactively invalidate a signed result. That binding is an audit/replay problem — Pavan's core.

**Architecture.**
- **Match & Aggregate Layer** — privacy-preserving join (hashed/tokenized IDs, aggregation with a minimum-cohort-size / noise threshold) so no raw PII crosses; only the sufficient statistics for lift are exchanged.
- **Deterministic Estimator** — computes lift from the agreed statistics via a *fixed, versioned* method (no analyst degrees of freedom).
- **Lift Certificate** — signed, tamper-evident record binding {method version, consent-state snapshot, cohort sizes, WHS integrity ref from #1} → the result; independently re-derivable from the shared statistics.
- **AI method:** none in the core (privacy + determinism demand it); this is deliberately a boring, auditable pipeline.
- **Where determinism/safety lives:** fixed estimator + minimum-cohort thresholds + signed certificate; the certificate refuses to validate if consent state or WHS integrity can't be confirmed.

**How a holdout proves it.** Correctness: run the clean-room estimator and a (permitted, synthetic) raw-join estimator on the same synthetic data; prove they agree within tolerance — the privacy layer costs no accuracy. Trust: have a third party re-derive the certified number from the shared statistics alone.

**Honest risk.** Clean rooms are a crowded space (Google, Amazon, Snowflake, LiveRamp, InfoSum-style); "yet another clean room" is not differentiated. The only defensible wedge is the *verifiable certificate + consent-time binding + WHS-integrity linkage* — i.e., the measurement-assurance angle, not the join tech. If Rokt is happy with managed-service trust, the "independently verifiable" property may be a solution to a problem advertisers don't yet demand.

---

## Cross-cutting pattern (why these hang together for Pavan)

Every one of the eight is a **correctness/assurance layer wrapped around a probabilistic or agent-driven core** — the Brain, an LLM agent, an AI code author, a stats estimator — where the wrapper is **deterministic, idempotent, fail-closed, and produces a tamper-evident, replayable certificate.** That is exactly Threshold's DNA (deterministic core, append-only audit, holdout-eligibility-not-permission, outbox/idempotency) pointed at problems Threshold *doesn't* touch: measurement integrity (#1, #7, #8), agent consent & economics (#2, #3), reward money-correctness (#4), agent-authored code (#5), and unified-surface constraints (#6).

The senior-engineer "I hadn't framed it that way" reframes:
- **Incrementality is a systems-integrity problem before it's a statistics problem** (#1) — the WHS ledger's correctness, not the estimator, is what makes the lift real.
- **The offer decision, not just the payment, has to obey the agent's mandate** (#2) — Rokt owns the layer everyone skipped.
- **"It converts for humans" is not evidence it converts through a bot** (#3) — grounded in a real 2026 failure (Instant Checkout).
- **Holdout inventory is spend, and a gate should make tests earn it** (#7).

## Honesty
All eight are **starting hypotheses** from public signals, to validate with a Rokt engineer. No fabricated metrics, no claimed partnerships, no assertion that Rokt lacks any of this. Where I quote Rokt, it's cited and marked VERIFIED; everything architectural is my own inference. The WHS exact wording (#1) was retrieved via search against Rokt's incrementality resource; the canonical `resources_post` URL 404'd on direct fetch, so treat the *concept* as Rokt-published and the *exact phrasing* as best-effort.

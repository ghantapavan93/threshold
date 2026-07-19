# 19 — Multi-AI Synthesis, Verification Results, and Final Thesis

**Date:** 2026-07-18
**Inputs:** Six external AI reviews (`research/external_ai/`: chatgpt, gemini, grok, deepseek, perplexity, kimi) + three independent verification passes against primary Rokt docs (`research/rokt/verification/VER_01..03`) + all prior research (`01`–`18`).
**Method:** Every load-bearing claim made by any external AI was independently verified against docs.rokt.com / rokt.com / official press before being folded in. Nothing accepted on faith.

---

## A. VERIFIED FACTS SHEET (what the build may cite)

### Confirmed real (URL+quote captured in VER files)
| Fact | Status | Source note |
|---|---|---|
| Cart API endpoints `POST /v1/cart/reserve`, `/v1/cart/confirm`, `/v1/cart/release`, `/v1/confirmation/cancel`, `/v1/placements/any` | **VERIFIED** (AIs dropped the `/v1` prefix) | Cart API ref, updated Dec 12 2025 |
| `itemReservationId` minted at reserve, echoed in confirm/release | **VERIFIED verbatim** | Cart API ref |
| Reserve → confirm / release; separate post-purchase `confirmation/cancel`; auto-release on timeout | **VERIFIED** | Cart API ref |
| Conversion dedup on `conversiontype` + `confirmationref` (current Event & Audience API); `transactionid` = legacy Event API (deprecated) | **VERIFIED, version-sensitive** | E&A API; legacy page updated Mar 19 2026 |
| S2S ingestion `POST s2s.us2.mparticle.com/v2/events`, 202 Accepted, 429 + Retry-After, exponential backoff w/ jitter guidance | **VERIFIED** ("at-least-once" implied, not verbatim) | E&A API |
| **No refund endpoint** in Cart API; nearest is `confirmation/cancel` | **VERIFIED (absence)** — model cancellation only, never refunds | Cart API ref |
| `<rokt-thank-you>` element with `fallback-timeout` **default 5000ms**, `partner-opt-in`/`partner-opt-out` | **VERIFIED verbatim** (double-fetched) | Web SDK+ ecommerce integration, updated Jul 15 2026 |
| `onShouldHideLoadingIndicator` fires on success OR failure | **VERIFIED** | Web SDK+ docs |
| "If no offer is eligible, the wrapped content renders normally" (checkout continues) | **VERIFIED** | Web SDK+ docs |
| Placement lifecycle events incl. `PLACEMENT_INTERACTIVE/READY/CLOSED/COMPLETED/FAILURE/RESIZE` via `Selection.on` | **VERIFIED** (updated Feb 2 2026) | Web SDK docs |
| "Show the right content **or show nothing**" + "**minimum reserve quality threshold**" | **VERIFIED** | Rokt press release Feb 18 2026 |
| "30+ real-time signals", "sub-200ms latency", "99.99% uptime" | **VERIFIED verbatim** | go.rokt.com/most-trusted |
| CSP allowlist, RSA client-side PII encryption, `noFunctional`/`noTargeting` consent flags | **VERIFIED** | docs.rokt.com security pages |
| Page Holdout Experiments: recommended **"5% control"**, variants **"Display the page without Rokt"** vs **"Display a Rokt layout to replicate an existing experience"**, primary + secondary metric, minimum-uplift %, "Most experiments go live within five minutes" | **VERIFIED verbatim** | Holdout Test page, updated Oct 11 2024 |
| Audience rule semantics: **"Include (is not in)" vs "Exclude (is in)"** differ precisely in treatment of a MISSING CC BIN value; **"Only Rokt staff can add, edit, or delete custom rules"** | **VERIFIED word-for-word** | Audience targeting docs |
| Sandbox follows production config, "does not charge advertisers or generate revenue" | **VERIFIED** | Testing docs |
| Integration Monitor: Workato onboarding, GA session/pageview reconciliation, real example of flagging a 5M-transaction SDK gap | **VERIFIED** | Integration Monitor docs |
| Claire Southey = **Chief AI Officer** (real person, real title) | **VERIFIED** (multiple primary/secondary) |
| Sam Dozor = **CTO** (ex-mParticle, appointed May 26 2026) | **VERIFIED** |
| Match Boost, Hybrid CDP, Performance Engine + Audience Agent (June 25 2026) | **VERIFIED** (PRNewswire) |
| Kubeflow / MLOps / feature-store language in real Rokt MLE job postings | **VERIFIED** |

### Hallucinated / unsupported (MUST NOT appear in the project)
| Claim | Verdict | Origin |
|---|---|---|
| SDK failure-reason enums `TIMEOUT`, `NO_OFFERS`, `NETWORK_ERROR`, `INIT_FAILED`, `NO_WIDGET`; callbacks `onEvent`/`onUnload` (as named) | **HALLUCINATED** — real API is `Selection.on` + `PLACEMENT_FAILURE` | Kimi |
| `SHOW_NOTHING` as a named constant/code identifier | **NOT A REAL ARTIFACT** — it's a documented *behavior*; use "No Offer Rendered" | several |
| "Thousands of signals" for Brain | **CONTRADICTED** — published figure is "30+" | Kimi |
| "AI + human review" for creative approval | **UNSUPPORTED** — docs describe human/operations review only | Grok/agent-05 |
| "Contact your account manager" on the sandbox page | **NOT PRESENT** on that page | Kimi |
| Refunds surfaced via Web SDK commerce events | **UNVERIFIED** | Agent-02 (ours) |
| "Rokt Brain v4" | **Trade press only, no official primary source** — treat as unconfirmed | ours/Grok |
| Per-transaction "$7 of $8" settlement subsystem | **UNSUPPORTED** — aggregate value-share statement only | ChatGPT's critique confirmed |
| Cell-based canary deployment internals | **UNVERIFIED** (plausible industry practice, no public doc) | Grok |

### Layer-conflation fix
`/placements/any` is NOT an SDK artifact (Verifier 1) but IS a real **Cart API** endpoint `/v1/placements/any` (Verifier 2). The AIs conflated client SDK and server Cart API layers; Threshold's docs must keep the layers distinct.

---

## B. CROSS-AI CONVERGENCE / DIVERGENCE MATRIX

| Question | ChatGPT | Gemini | Grok | DeepSeek | Perplexity | Kimi | Consensus |
|---|---|---|---|---|---|---|---|
| Overall verdict | Reframe | Reframe | Reframe | Reframe | Reframe | Reframe | **6/6 CONTINUE WITH MAJOR REFRAME** |
| Product = policy-change safety gate (diff+replay+fail-closed+verdict) | ✔ | ✔ (transaction-safety angle) | ✔ | ✔ | ✔ | ✔ | **6/6** |
| One primary user: decision-platform/policy engineer | ✔ | ✔ | ✔ | ✔ | (implied) | ✔ | **~6/6** |
| Remove OPE (SNIPS/DR) from MVP | Defer (design iface only) | Remove | Remove | Remove | Remove | Remove | **6/6 remove/defer** |
| No LLM in hot path | ✔ | ✔ (exclude entirely) | ✔ (peripheral linting ok) | ✔ (optional advisory) | ✔ | ✔ ("No AI in Critical Path" principle) | **6/6** |
| Remove revenue settlement from core | Fictionalize | **Keep (differentiator)** | Remove | Remove | Adjacent-not-distinct | Remove | **5/6 remove** |
| Hash-chain ledger | Keep, threat-model it | Keep (1-week) | Keep minimal | **Downgrade: append-only+HMAC, "tamper-evident"** | Weakest novelty claim | Remove chain | **Majority: downgrade** |
| Verdict trichotomy BLOCKED / INSUFFICIENT EVIDENCE / ELIGIBLE FOR HOLDOUT | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | **6/6** |
| Hero visual = policy diff + replay timeline / constraint heatmap | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ (+ heatmap) | **6/6** |
| Merchant scenario | Cinema | **Travel/airline** | Cinema | Ticketing/food-delivery | — | Cinema/ticketing (AMC) | Split |
| Honest confidence | — | 85.6/100 | "reframe or generic" | 78/100, 70% | "small but real" | 79→85.6, 62% overall | **~62–78%, novelty=integration not invention** |

Sharpest external contributions adopted: ChatGPT (single user + transaction invariants + effectively-once wording + fictionalize money), Gemini (checkout-isolation invariant + consent-mask P0 + latency injector), Grok (staff-voice humility framing + verify-org-facts), DeepSeek (principal-grade backend audit: sync-tx MVP ≤200 sessions, tamper-EVIDENT not -proof, replay filters known violations ≠ causal safety, interview Q&A), Perplexity (source-backed non-duplication map: distinct ONLY as transaction-anchored combination), Kimi (SDK/holdout/audience-BIN doc specifics — the parts that survived verification are gold; the parts that didn't prove the necessity of this verification pass).

---

## C. ADJUDICATION OF THE THREE OPEN SPLITS (my calls, with reasons)

**1. Settlement: OUT of the core; verified Cart-API mechanics stay as one supporting scene.**
5/6 externals + verification agree: no public settlement/refund semantics exist; a payable-state ledger would be invented. BUT conversion dedup (`conversiontype`+`confirmationref`) and cancellation via `/v1/confirmation/cancel` + `itemReservationId` ARE verbatim-verified public semantics and are Pavan's signature strength — so the demo keeps **one** "integrity scene" (duplicate deduped; cancellation transitions state) using ONLY verified fields, with zero payable/settlement math. Gemini's instinct (money-adjacent integrity differentiates) is honored in verified form; its speculative settlement ledger is dropped.

**2. Ledger: append-only + per-record HMAC integrity check; terminology "tamper-evident"; no chain, no blockchain language.**
DeepSeek's argument is decisive: a local hash chain doesn't survive its own threat model and reads as decorative crypto. The evidence value is (a) append-only writes, (b) every decision references one immutable policy version + inputs snapshot + outcome + fallback reason, (c) an integrity-verify endpoint that recomputes checksums. THREAT_MODEL.md will state plainly: proves sequence/content integrity against non-privileged tampering; does NOT prove semantic truth.

**3. Scenario: event ticketing (fictional merchant, e.g., "Aurora Tickets"), not travel.**
Ticketing is Rokt's marquee verified vertical (Ticketmaster/AMC/Live Nation ecosystem, Fandango), matches Pavan's original Alamo/movie-ticket seed, and still exercises cancellation (verified) without travel's currency/partial-refund complexity — which verification showed we CANNOT ground publicly (no refund endpoint). Gemini's richer travel edge cases would force inventing semantics; rejected for evidence discipline. Travel appears only as a roadmap line.

---

## D. MY OWN ADDITIONS (beyond all six externals)

1. **Make the verified audience-rule trap the centerpiece violation.** The word-for-word documented difference between "Include (is not in)" and "Exclude (is in)" for a MISSING CC BIN value is a real, subtle, Rokt-specific policy semantics trap no generic feature-flag tool models. The signature replay scene: a proposed rule edit flips behavior for sessions with a missing attribute — the diff looks harmless, the replay catches it, verdict BLOCKED with the doc-grounded explanation. This is the moment a Rokt engineer recognizes their own docs.
2. **Ground every constraint in a verified artifact:** latency budget ← "sub-200ms" + 5000ms `fallback-timeout`; fallback ← "wrapped content renders normally"; failure event ← `PLACEMENT_FAILURE`; holdout export ← the verified 5%-control page (variant names verbatim); quality gate ← "minimum reserve quality threshold." Every UI label traceable to a public doc.
3. **Terminology corrections baked in:** "No Offer Rendered" (not SHOW_NOTHING-as-constant); "Policy Diff Replay" (not Shadow Replay); "tamper-evident" (never tamper-proof); "effectively-once state transitions over at-least-once delivery" (not exactly-once).
4. **The "why now" hook (verified):** Dozor (ex-mParticle) became CTO May 2026; Performance Engine + Audience Agent shipped June 2026 — the platform is visibly accelerating change velocity around data+AI. A pre-release policy-safety gate is the natural complement to velocity. Humble framing per Grok: "serious homework inspired by your public docs — tear it apart," never "you need this."
5. **An honest LIMITATIONS.md as a feature:** replay filters known violations (not causal safety); holdout remains mandatory; synthetic data demonstrates mechanism not efficacy; the gate complements (never replaces) internal canary/experiment infrastructure; assumptions register with each one's evidence status.

---

## E. FINAL THESIS (frozen)

> **Threshold — a Policy Change Safety Gate for the Transaction Moment.**
> Before a placement-policy change reaches a single real customer, Threshold proves — with replayable, doc-grounded evidence — that it fails closed to "no offer rendered," preserves the merchant's checkout, respects hard constraints (latency, consent, brand safety, frequency, missing-attribute semantics), handles duplicate and cancelled conversions safely, and is eligible **only** for a controlled online holdout.

**IS NOT:** a Rokt Brain replacement, a recommender, an experimentation platform, an observability product, a compliance platform, a settlement system, or a chatbot. **No AI in the critical path** (stated design principle). Deterministic core; optional peripheral explainer only if it degrades to nothing.

**MVP (48h golden path):** versioned immutable Policy Contract (JSON) → policy diff → Policy Diff Replay over ~200 seeded event-time-bounded synthetic sessions (sync single-transaction per DeepSeek) → constraint validation incl. the missing-attribute trap → `PLACEMENT_FAILURE`-style timeout injection → fail-closed proof (checkout untouched) → one duplicate-conversion dedup + one cancellation transition (verified fields only) → append-only tamper-evident decision log → verdict BLOCKED / INSUFFICIENT EVIDENCE / ELIGIBLE FOR HOLDOUT (+ holdout-config export mirroring the verified 5% page).
**Deferred (1-week+):** OPE interface w/ support-refusal (design only first), consent-aware historical replay, drift, partner constraint profiles, Playwright E2E, deeper a11y polish.
**Stack (consensus):** FastAPI + Pydantic + SQLAlchemy + Alembic + Postgres; Next.js + TS + Tailwind + TanStack Query + Zod; Docker Compose; GitHub Actions; OTel + structured JSON logs; idempotency via unique DB constraints; transactional outbox only where justified.

**Confidence (mine, post-verification): ~80%** that this is a credible, non-duplicative-enough, junior-defensible adjacent concept — up from the externals' 62–78% because the two biggest risks are now mitigated: (a) every citable fact is verified (no hallucinated API surface), and (b) the centerpiece scenario (missing-attribute rule semantics) is grounded in Rokt's own documented, error-prone behavior rather than an invented gap. Residual risk: Rokt surely has internal equivalents — the framing therefore claims *rigor demonstrated on their real public semantics*, never novelty over their internals.

# Builder page — the depth layer (distilled, ready to build)

Companion to `BUILDER_ROLE.md`. This is the *verified, honest* depth that turns the six scenes from evocative into undeniable. Source docs: `research/rokt/23_AI_ML_ARXIV_DEPTH.md`, `24_AI_DEVTOOLING_2026.md`, `25_EXECUTABLE_ARCHITECTURES.md`, `26_OUT_OF_BOX_OPPORTUNITIES.md`. Retrieval date 2026-07-18.

**UX principle — progressive disclosure.** Each scene keeps its poetic one-liner + visual on the surface (concise, never a wall of text). The depth below lives behind two calm, tasteful toggles per scene: **"The science"** (real papers) and **"How I'd build it"** (the architecture). Nothing auto-expands. The honesty labels are a *feature*, shown as small tags: `SHIPPED` (built + tested in this repo) · `DESIGNED` (what I'd build) · `TO VALIDATE` (the one internal fact I'd confirm first) · `HYPOTHESIS` (a labeled bet). That gradient — from what's proven to what's proposed — is the credibility.

---

## Per-scene depth

### Scene 1 — Design & build → "The science" / "How I'd build it"
**The science (real, verified):**
- Contextual bandits are the offer slot: LinUCB (Li et al., WWW 2010, arXiv:1003.0146) · Thompson Sampling for linear payoffs (Agrawal & Goyal, ICML 2013, arXiv:1209.3352) · Neural Thompson Sampling (Zhang et al., ICLR 2021, arXiv:2010.00827).
- Honest caveat tag: TS fits a sub-200ms budget (one posterior draw/request) and degrades gracefully under delayed checkout rewards — `INFERENCE`.

**How I'd build it (`DESIGNED`, reuses `SHIPPED` patterns):**
- Hot path: a **placement-gate service** — (1) deterministic hard filter (consent/brand-safety/frequency, the `constraints.py` pattern, `SHIPPED`), (2) fatigue read from Redis counters, (3) calibrated GBDT for `p(engage)·E[value]`, (4) deterministic net-value gate: place iff `E[value] − λ·fatigue > θ`, else **show nothing**.
- Determinism lives at steps 1 & 4 — the score can be a model; the *decision to suppress* is a pure, auditable function.
- Fail-closed: gate timeout/model down → **show nothing** (trust-preserving default), signed reason to the audit.
- `TO VALIDATE`: does Rokt want "whether/when" as a distinct pre-ranking gate, or folded into the Brain as a null-offer candidate? The single biggest design fork.

### Scene 2 — Accelerate with AI → "The stack, named accurately"
**Verified current facts (name them right — shows I track the market):**
- **promptfoo is now part of OpenAI** (still open-source, MIT) — my CI eval + injection red-team gate.
- **Windsurf → Devin Desktop under Cognition** (Cascade EOL ~Jul 2026); I name it as "Windsurf, now Devin Desktop," not as a stable pick.
- **Standardize LLM telemetry on OpenTelemetry GenAI conventions** → the observability backend (Langfuse/Phoenix) becomes swappable; the anti-lock-in decision.
- **MLflow's stage-gated model registry** (Staging→Production behind an approval) is the MLOps cousin of Threshold's gate — a clean bridge from my project to Rokt-scale MLOps.
- Tools, honestly: Claude Code / Cursor / Copilot coding agent / Aider (git-as-truth, auditable diffs — philosophically aligned with Threshold) · v0 for UI · promptfoo/Ragas/DeepEval evals · Langfuse + OTel traces · DSPy (prompts as evaluable, version-controlled code).

**The load-bearing beat (`SHIPPED`):** an **AST fitness test** fails the build if an LLM/network/clock/RNG import becomes reachable from `app/domain/*`. "No AI in the money/eligibility path" is a *checkable invariant*, not a promise. The mature reframe of the JD point: *I use AI aggressively AND encode, in an automated test, exactly where it isn't allowed to go.*

### Scene 3 — Full-stack ownership (the portfolio grid stays; add the lifecycle spine)
- Feature lifecycle, end to end (`DESIGNED` machinery over a real seam): PROBLEM (a real seam: `/placements/any`, `PLACEMENT_FAILURE`) → DESIGN (write invariants first) → BUILD (FastAPI · Next · Postgres · Redis · outbox · OTel) → TEST (determinism/property, fail-closed proofs, real-DB concurrency) → SHIP (behind a flag, never touching checkout's critical path) → **MEASURE (Page Holdout ~5% control — report net-new, never a claimed lift)** → RECOVER (rollback, dead-letter drain, drift alert).
- Hard guardrail tag: checkout completion is never a KPI to trade; if treatment regresses it, the experiment auto-stops.

### Scene 4 — Collaborate → the honest gap as a strength
- The verified Rokt reframe: their own engineering writes that review has shifted to "governing a fleet of agents … watching for drift," measuring defect rates. Collaboration in 2026 includes collaborating *with agents* under human governance — Efficast's "LLM proposes, never actuates" is that discipline, already shipped.

### Scene 5 — Optimize & scale → "How I'd build it"
**Architecture (`DESIGNED`, on a `SHIPPED` spine):** Kafka/Redpanda ingress → idempotent enqueue → stateless worker pool reading from a **read replica** → the **pure evaluator batches safely** (parallelism is safe by construction: `run_replay(seed)==run_replay(seed)`, `SHIPPED`) → accumulate, commit nothing → **single atomic verdict commit** → **transactional outbox** drains fan-out with backoff+jitter, `FOR UPDATE SKIP LOCKED`, dead-letter after 5 (`SHIPPED`, `test_outbox.py`) → Evidently drift sidecar (PSI/KS, deterministic stats).
- Serving models via ONNX/Triton/vLLM-class for the hot path; **the scale machinery here is systems, not ML**.
- Honesty tag: the outbox/backoff/dead-letter/SKIP-LOCKED path is *already built and tested*; the Kafka/replica/Ray layer is *designed, not built* — I won't claim otherwise.
- `TO VALIDATE`: is Rokt's real path decision-per-request (hot) vs certification/replay (async)? The exact boundary + p99 are internal.

### Scene 6 — Drive revenue → "The science" / "How I'd build it"
**The science (real, verified — Threshold's academic spine, go deepest here):**
- Off-policy evaluation lineage: Doubly-Robust (Dudík et al., ICML 2011, arXiv:1103.4601) → SNIPS (Swaminathan & Joachims, NeurIPS 2015) → DR-Shrinkage (Su et al., ICML 2020, arXiv:1907.09623) → MIPS for large action spaces (Saito & Joachims, ICML 2022, arXiv:2202.06317); benchmarkable on Open Bandit Pipeline (Saito et al., NeurIPS 2021, arXiv:2008.07146).
- Uplift/persuadables: X-learner (Künzel et al., PNAS 2019, arXiv:1706.03461) · causal forest (Wager & Athey, JASA 2018, arXiv:1510.04342) · DragonNet (Shi et al., NeurIPS 2019, arXiv:1906.02120). Metric is Qini/AUUC, never accuracy.
- Incrementality machinery: CUPED (Deng et al., WSDM 2013) · Ghost Ads (Johnson et al., JMR 2017) · MLRATE (Guo et al., NeurIPS 2021, arXiv:2106.07263).

**How I'd build it (`DESIGNED` + `SHIPPED` guard):** uplift/CATE offline → **OPE support-guard that refuses on thin support** (`ope.py`, `SHIPPED`: `refuses_estimate=true` below `MIN_ESS`) → **Page Holdout is the only causal proof** (`ADR-005`). A positive pre-screen = *eligible for a holdout*, never "proven lift."
- `TO VALIDATE`: does Rokt expose logged action propensities? Without them only the deterministic guard is honest — which is exactly why the repo ships the guard, not a fake estimator.
- Honest gaps to keep visible: HSTU generative recsys (arXiv:2402.17152) is state-of-the-art *awareness*, likely overkill for one checkout slot; the "show-nothing"/fatigue literature is genuinely thin (closest: arXiv:1908.08936) — engineering judgment leads there, labeled `HYPOTHESIS`.

---

## New section — "Seams I see" (out-of-box, all `HYPOTHESIS`, honest)

A gallery replacing/absorbing "More opportunities I see." Frame at the top, verbatim intent: *"Rokt is sophisticated and almost certainly has internal thinking on all of these. The value is the framing — and that I can own a problem class end to end. Every one is the same DNA: a deterministic, fail-closed, tamper-evident wrapper around a probabilistic or agent-driven core."*

Feature these three first (each = thesis · the "I hadn't framed it that way" reframe · honest risk):
1. **Holdout Integrity Ledger** — *incrementality is a systems-integrity problem before it's a statistics problem.* Rokt's verified "Would Have Seen" rule (a holdout member is "always a member … excluded from all future opportunities") is really a distributed idempotency/audit invariant across checkout + rewards + onsite media; one silent leak biases lift upward and no dashboard shows it. Build: append-only tamper-evident WHS ledger + fail-closed exclusion gate + offline leak-auditor emitting an integrity certificate. Risk: likely table-stakes plumbing internally; the differentiator is the *certificate as a sellable measurement-assurance artifact*.
2. **Agent Mandate Verifier at the Transaction Moment** — *the offer decision, not just the payment, must obey the agent's mandate.* When an LLM shopping agent arrives with a signed AP2 Intent/Cart/Payment chain, the Brain's next-best-action must be bounded by what the human authorized. Rokt uniquely owns that decision layer everyone skips. Build: deterministic mandate verifier → Authorized-Action Envelope → a constraint layer that vetoes any Brain proposal outside it; fail-closed to the consent-safe default. Risk: protocol volatility (ACP's Instant Checkout died in 5 months) — target the stable abstraction (a signed envelope), not one wire format.
3. **Incrementality of Agent-Mediated Offers** — *"it converts for humans" is not evidence it converts through a bot* (grounded in the verified OpenAI Instant Checkout shutdown, Mar 2026, near-zero sales). An offer a human sees and the "same" offer an agent may summarize/reorder/suppress are different causal objects. Build: mediation classifier + deterministic presentation-integrity probe (degraded-impression flag) + mediation-stratified holdout. Risk: agent volume may be too low in 2026 to power per-channel lift — a "get ready for" bet.

Then five more as compact cards (thesis + one-line risk): Reward-Liability Idempotency & Reconciliation (exactly-once economics for Gift-with-Purchase) · Conformance Gate for Agent-Authored Decisioning Changes (Threshold's replay-diff pointed at agent-written PRs — Rokt's own "watching for drift") · Cross-Surface Exposure & Frequency Integrity (one authority for global frequency + WHS across surfaces) · Self-Serve Incrementality Guardrail (holdout inventory is scarce spend; make tests earn it, seal the analysis plan against peeking) · Clean-Room Lift Certificate (prove lift without a raw-PII join; a verifiable, consent-time-bound certificate).

---

## Build notes for the frontend
- Depth is **opt-in** per scene (two toggles: "The science", "How I'd build it") — the surface stays poetic and concise; reduced-motion and a11y unchanged; keep it green.
- Citations render as small mono chips (paper · venue year · arXiv id) — real strings above, no links needed offline, no fabricated numbers. The only quantitative figures anywhere are real repo test counts (38 / 120) and Rokt's own public numbers; every latency figure is labeled a *budget/goal*, never a measured result.
- The honesty tags (`SHIPPED`/`DESIGNED`/`TO VALIDATE`/`HYPOTHESIS`) reuse the semantic palette by meaning, not by inventing colors: `SHIPPED`=teal, `TO VALIDATE`/`HYPOTHESIS`=amber, everything neutral otherwise. Never status-by-color alone — always tag text + glyph.
- "Seams I see" is a new full-width section after the six scenes, before the closing ask; 3 featured cards + 5 compact. Every card visibly tagged `HYPOTHESIS`.
- Optional, only if it stays clean: one grounded depth beat on the Vision page — the "incrementality is a systems-integrity problem before it's a statistics problem" reframe — cohesive with the keynote, not a redesign.

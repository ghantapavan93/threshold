# How I'd Own the Rokt Builder Role — content + build spec for `/builder`

**Voice:** first-person, confident, humble, **poetic and concise** — the idea lands in a sentence; the *visual* carries the weight. Never a wall of text. **Honest:** real projects, real tools, no fabricated metrics, no fake screenshots — original animated diagrams only. Frame AI tools as *"what I reach for and why,"* never *"tools Rokt hasn't considered"* (presumptuous). Every claim ties to a real project or is a clearly-labeled idea.

**Grounding — Pavan's shipped projects (the evidence bank):**
- **Threshold** (this repo) — a deterministic policy-change safety gate for the Transaction Moment; found an adjacent seam in Rokt's own docs, built end-to-end (engine, API, cinematic console, 38 tests, transactional outbox).
- **ShelfTrace** — a retail pricing execution-integrity control plane (FastAPI/Next/Postgres/Redis): cross-surface reconciliation, canary containment, a plausibility guard, real-Postgres concurrency tests.
- **Dreamship** — an order-exception & launch-reliability platform (Django/Next/Celery): idempotency at the money boundary, immutable audit, retries + dead-letter, manual replay, row-locking, 120 backend tests, N+1 guards.
- **Krowd Guide** — real-time AI operational intelligence (React/TS/Node/Python): event-driven pipelines, low-latency inference, structured outputs with confidence, human-in-the-loop review; built with operators + stakeholders.
- **100 Miles of Summer** — a customer fitness platform: idempotency, dedup, reconciliation, account-state correctness across connected integrations; the lesson "a backend can return success while the user gets the wrong outcome."
- **NexusWatch** — invoice anomaly review: a human-in-the-loop review queue, per-field confidence, layered OCR intake with a confidence ladder.
- **Efficast** — a verified-recovery agent: a hash-chained + HMAC audit spine with tamper localization, a legal-transition state machine, an agent graph where the LLM proposes but never actuates.
- **Fan Flow** — scenario/persona fixtures that double as tests and a live debug toolbar; a transparent "why this decision" explainability panel.

---

## The six "What You'll Do" — each a scene: *one-liner · proof · executable idea for Rokt · AI tools I'd wield · the visual*

### 1. Design & build innovative products
- **One-liner:** *Start from the customer and a real seam — then ship the whole thing.*
- **Proof:** Threshold — I read Rokt's own audience docs, found where a one-operator edit silently widens a missing-attribute audience, and built the whole safety gate end-to-end.
- **Executable idea for Rokt:** a **right-moment, trust-aware Transaction-Moment layer** — decide *whether/when* to place an offer (including "show nothing"), scoring net-new value minus a fatigue penalty; and **loyalty-safe change control** as Shopper Rewards grows.
- **AI tools I'd wield:** Claude Code + Cursor for agentic building; v0 for UI scaffolding; a GBDT/contextual-bandit core (Open Bandit Pipeline) for the decision; structured-output LLMs only at the edges (creative copy, metadata enrichment) feeding the deterministic ranker.
- **Visual:** the decision-gate motif — sessions flowing, one path failing closed — animating on scroll.

### 2. Accelerate development with AI
- **One-liner:** *AI as leverage — plus the judgment of when not to reach for it.*
- **Proof:** this repo was built with a multi-agent research→verify→build pipeline, and an ast-based fitness test *enforces* no LLM in the correctness path. Speed with guarantees.
- **Executable idea:** a team dev-velocity loop — agentic coding + PR-review agents + eval harnesses gating prompts + LLM observability, so builders ship faster without shipping non-determinism into money/eligibility.
- **AI tools I'd wield:** Claude Code, Cursor, GitHub Copilot, Windsurf, v0; **promptfoo / Ragas** for eval gates; **Langfuse + OpenTelemetry** for LLM traces; **DSPy** for prompt optimization. I stay current via **arXiv** (off-policy evaluation, uplift modeling, recsys, RLHF) and Papers-with-Code.
- **Visual:** a "tool constellation" — nodes lighting and linking as you scroll.

### 3. Full-stack product ownership
- **One-liner:** *Cradle to grave — including the unglamorous parts.*
- **Proof:** the portfolio above — each shipped end-to-end: backend, frontend, tests, demo. Migrations, observability, rollback, not just the happy path.
- **Executable idea:** own a Transaction-Moment feature end-to-end at Rokt, from the customer problem to the holdout that proves it.
- **AI tools / stack:** FastAPI · Next.js · Postgres · Redis · Kafka · Docker · GitHub Actions · OpenTelemetry — the same spine across my products.
- **Visual:** a **portfolio grid** — Threshold, ShelfTrace, Dreamship, Krowd Guide, 100 Miles, NexusWatch, Efficast, Fan Flow as evidence cards (name · what it shipped · the reusable pattern), over a lifecycle timeline (idea → prototype → tests → ship → recover).

### 4. Collaborate & innovate
- **One-liner:** *Build for a conversation, not a verdict.*
- **Proof:** Krowd Guide — built with operators and stakeholders, translating fuzzy requirements into shipped intelligence; decks/walkthroughs that made non-engineers get it; and this repo's honest LIMITATIONS + "tear it apart" framing.
- **Executable idea:** partner with PM/design/eng on AI-driven UX — a shared "why this decision" surface so decisions are legible to everyone in the room.
- **AI tools I'd wield:** Figma (design handoff), the Emil/impeccable/taste design skills for premium UI, Linear/Notion for the loop.
- **Visual:** a collaboration loop — PM ⇄ Design ⇄ Eng ⇄ Customer, animating.

### 5. Optimize & scale
- **One-liner:** *Find the bottleneck with data; hold the invariants at scale.*
- **Proof:** ShelfTrace's cross-system reconciliation + canary; Dreamship's row-locking, replay, N+1 guards and 120 tests; Threshold's transactional outbox with backoff + dead-lettering; algorithms built from scratch; working across large datasets with privacy and security in mind; cross-checking the architecture until the latency lands.
- **Executable idea:** scale decisioning to **billions of transactions** — enqueue → async worker → transactional outbox → batched evaluation → single commit, from a read replica; sub-200ms p99; drift monitoring.
- **AI tools I'd wield:** Kafka/Redpanda (streaming), Ray (parallel eval), Triton/ONNX/vLLM (low-latency serving), Evidently (drift), Feast (feature store), OpenTelemetry + profiling.
- **Visual:** a pipeline that visibly scales — one lane becoming many workers — with a latency meter holding under load.

### 6. Drive revenue growth
- **One-liner:** *Revenue is the point — proven, not claimed.*
- **Proof:** helped generate revenue for pre-launch companies before the thing was even built; Threshold's whole thesis protects **incremental** revenue before a change can distort it.
- **Executable idea:** ship features that safely raise **incremental** revenue — targeted at persuadables (uplift), gated by a real holdout. Never a claimed lift; always a measured one.
- **AI tools I'd wield:** **causalml / scikit-uplift** (uplift), **SNIPS/Doubly-Robust** off-policy pre-screen (that refuses on thin support), holdout experiment design.
- **Visual:** an **honest incrementality viz** — a treatment vs a holdout control, the *net-new* gap highlighted (never a fake hockey-stick).

---

## "Who I Am" — five one-line proofs (each with a tool/practice)
- **AI-enthusiast & quick learner:** learned Rokt's public platform deeply and built *in* the domain in days, with cutting-edge agentic workflows; I read arXiv weekly.
- **Problem solver (first principles):** the missing-attribute trap is isolated with a *counterfactual*, not a heuristic.
- **Entrepreneurial ownership:** no one asked me to build Threshold — I found the seam and shipped it.
- **Collaborative:** honest limits, interview prep, "correct me" — designed to be improved by a team.
- **Driven & results-oriented:** 38 tests, deterministic verdicts, a tamper-evident audit, and an explicit list of what I *didn't* build.

---

## BUILD SPEC (for the frontend agent)
Rebuild `/builder` into a scroll-driven, impeccable, mind-blowing page. Same design system + GSAP/Lenis foundation; frontend-only; build green; reduced-motion gated; a11y; responsive.

- **Each of the six dimensions = its own cinematic "scene"** with: the poetic one-liner (masked GSAP text reveal), a compact **Proof** chip-row of the real projects, a short **Executable idea for Rokt** line, an **AI-tools row** (named tool chips, each with a one-line "how I'd use it"), and an **animated workflow illustration** (original SVG/canvas, looping subtly = "video-like background") that visualizes the idea. Concise copy — the visual carries it.
- **Build the animated workflow illustrations** as reusable SVG/canvas scenes (decision-gate flow, tool constellation, portfolio-lifecycle timeline, collaboration loop, scaling pipeline + latency meter, incrementality holdout viz). Subtle, premium, reduced-motion → static final frame. No external images/photos; no fabricated screenshots or metrics.
- **Portfolio grid** (dimension 3): 8 evidence cards (Threshold, ShelfTrace, Dreamship, Krowd Guide, 100 Miles, NexusWatch, Efficast, Fan Flow) — name · one-line what-it-shipped · reusable pattern chips. Honest, no fake images.
- Keep the existing "The role, as I read it," "More opportunities I see," "How I own a problem," and closing ask — integrate, don't drop.
- Impeccable spacing/typography/hierarchy; Emil-grade motion; taste/restraint. Everything cohesive with `design-system/MASTER.md`.

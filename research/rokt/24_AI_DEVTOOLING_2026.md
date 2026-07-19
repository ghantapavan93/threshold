# 24 — AI-Accelerated Software Development Tooling (2026)

**Purpose:** Ground the "Accelerate development with AI" JD point in the *real* 2026 tooling landscape, so the Threshold Builder page can name specific tools and say precisely how each was (or would be) used to build for Rokt's Transaction Moment — without hype or fabrication.

**Retrieval date:** 2026-07-18
**Discipline:** Every tool below is verified against its own site/docs or GitHub. Where I could not verify a claim to a primary source, it is dropped. No invented benchmarks. Opinions are labelled **INFERENCE**. Version/star/adoption numbers come from secondary write-ups and are treated as soft signals, not load-bearing facts — I cite them only where the primary repo corroborated the direction.

**Rokt context assumed (from prior research docs 01/02/09):** Transaction Moment = the offer placement shown at checkout/confirmation; the decisioning path ranks/selects offers under a tight latency budget (public claims cluster around sub-second, often cited ~sub-200ms server-side) at high request volume. That budget, plus the money/eligibility sensitivity of what gets shown, is what makes the "when NOT to use AI" section the most important part of this doc for a Rokt audience.

---

## 0. How to read this for Rokt

Two distinct uses of "AI in software" get conflated in interviews; keep them separate:

1. **AI that accelerates *me building* the software** — coding agents, UI generation. Speeds up the dev loop. Low blast radius: a human reviews every diff, tests gate the merge.
2. **AI *inside the running product*** — LLMs/ML in the request path (ranking, relevance, eval, observability of that AI). High blast radius: it runs against live traffic and money.

The Threshold thesis lives at the seam between them: use category-1 tooling aggressively to build fast, but keep category-2 AI *out of the correctness/eligibility path* by construction. The `ast-fitness-test` (below) is the mechanical enforcement of that line.

---

## 1. Agentic coding / IDEs

> These accelerate *me building Threshold and Rokt-shaped features*. All five are real and current as of retrieval. The honest through-line: agents are excellent at breadth (scaffolding, refactors, test generation, glue) and unreliable at load-bearing correctness — which is exactly why Threshold's value prop (a gate that assumes AI writes code) is credible rather than contrarian.

### Claude Code — Anthropic
- **What:** Agentic coding tool in the terminal / IDE / desktop; reads files, runs commands, edits code, runs tests, opens PRs, extensible via subagents, hooks, skills, and MCP. Site: `claude.com/product/claude-code`; docs: `code.claude.com/docs`.
- **Maturity / limits:** Mature and widely adopted in 2026 (this doc was itself produced with it). Real limits: it will confidently produce plausible-but-wrong logic on subtle correctness problems; long autonomous runs drift without tight task scoping; cost scales with token use. Multi-agent/"Agent Teams" and cloud routines exist but add coordination overhead — **INFERENCE:** worth it only for genuinely parallelizable work, not a default.
- **How I'd use it for Rokt:** Primary driver for building Threshold itself — scaffolding the policy-diff parser, wiring the AST fitness test into CI, generating the deterministic decision-core's exhaustive test matrix. For a Transaction Moment feature: have it draft the offer-placement service skeleton, the config schema, and the observability wiring, then I hand-verify the ranking/eligibility logic. **The AST fitness test exists precisely so I can let an agent write freely without letting it near the correctness path.**

### Cursor — Anysphere
- **What:** AI-native IDE (VS Code fork) with an Agent mode that reads the repo, edits multiple files, runs terminal commands, and iterates; plus Plan/Debug/Ask modes, background/cloud agents, MCP integrations, and parallel agents across worktrees. Site: `cursor.com`.
- **Maturity / limits:** Mature, one of the two most-used agentic IDEs. Productivity claims ("20–40% faster") come from vendor/secondary sources — treat as directional, not measured. Background agents can rack up cost and produce large diffs that are hard to review; browser-driven E2E is powerful but flaky on complex apps.
- **How I'd use it for Rokt:** Day-to-day editing of the Threshold repo when I want inline multi-file edits with fast feedback. Its MCP reach (Postgres, GitHub, Sentry, Linear) maps cleanly onto a real Rokt-style workflow: read a ticket, query the offers table, make the change, open the PR. **INFERENCE:** I'd keep background/cloud agents off the decision-core and pointed at glue/refactor/test work.

### Windsurf → **Devin Desktop** (Cognition)
- **What / status change (verify this one out loud):** Windsurf (originally Codeium's editor, its agent called **Cascade**) was acquired by **Cognition** (makers of Devin), reportedly ~$250M, late 2025. In 2026 it was rebranded: **`windsurf.com/cascade` now 308-redirects to `devin.ai/desktop`** (I confirmed the redirect directly). Secondary reporting says Cascade the local agent reached end-of-life ~July 1, 2026, replaced by "Devin Local" (Rust rewrite, sub-agents).
- **Maturity / limits:** The product is real and shipping, but it is **mid-transition** — naming, migration path, and feature parity are in flux as of retrieval. **INFERENCE:** I would *not* build a portfolio narrative that leans on "Windsurf/Cascade" as a stable choice right now; name it accurately as "Windsurf, now Devin Desktop under Cognition" to show I track the market rather than parroting a stale list.
- **How I'd use it for Rokt:** Honestly, I wouldn't make it my primary while it's rebranding. I'd cite it as evidence I understand the agentic-IDE consolidation (Cognition rolling Devin + Windsurf into one command center) — relevant because Rokt cares about engineers who reason about tool trade-offs, not tool fandom.

### GitHub Copilot (+ coding agent)
- **What:** Autonomous coding agent that turns an assigned GitHub issue into a PR (writes code, runs tests, iterates) plus agent mode in VS Code and JetBrains, agentic code review, and a 2026 standalone Copilot desktop app ("My Work" control plane for supervising agent sessions). The original **Copilot Workspace** preview was sunset (2025) and its issue→PR/planning ideas were folded into the coding agent. Site: `github.com/features/copilot`.
- **Maturity / limits:** Very mature autocomplete + increasingly capable agent, with the deepest native GitHub-lifecycle integration. Limits: issue→PR works well for well-scoped, low-ambiguity tasks and struggles on architectural or cross-cutting changes; review-then-fix loops still need a human gate.
- **How I'd use it for Rokt:** This is the one most likely to mirror Rokt's actual internal flow (GitHub-centric). For Transaction Moment work: file tightly-scoped issues (add a metric, backfill a test, adapter for a new offer source), assign to the coding agent, review the PR. Its agentic code review is a *second* reviewer, never the gate — the gate stays the AST fitness test + human sign-off.

### Aider
- **What:** Open-source CLI pair programmer; treats **git as source of truth**, auto-commits each change with a message, architect/editor mode, watch-mode, 100+ languages, bring-your-own-model (Claude, GPT, Gemini, local). Site/docs: `aider.chat`; repo: `github.com/Aider-AI/aider`.
- **Maturity / limits:** Mature, model-agnostic, no lock-in, pay-per-use. Limits: terminal-only (no rich IDE surface), smaller "autonomy" ceiling than Cursor/Claude Code — it's deliberately a scalpel, not a swarm. Quality tracks whatever model you point it at.
- **How I'd use it for Rokt:** When I want *auditable, granular* AI edits — every change is its own git commit with a message, which is a natural fit for a project whose whole thesis is change-safety and auditability. **INFERENCE:** Aider's git-as-truth discipline is philosophically aligned with Threshold; I'd mention that alignment explicitly.

---

## 2. UI generation

### v0 — Vercel
- **What:** Prompt/image → React + Tailwind (shadcn/ui) components and pages; strongest at frontend UI quality. In 2026 it expanded toward full-stack (sandbox env, git panel, DB integrations) but UI generation remains the core edge. Site: `v0.dev` / `v0.app`.
- **Maturity / limits:** Mature for UI scaffolding; output is genuinely good React/Next.js starting points but needs cleanup for production (accessibility, state management, real data wiring). Not a backend/decisioning tool.
- **How I'd use it for Rokt:** Generate the Threshold Builder/dashboard UI fast — the policy-diff review screen, the "gate blocked this change / here's why" panel, config editors — then harden by hand. For a Transaction Moment demo, mock the offer-placement widget's look-and-feel quickly so I can spend real time on the decision logic behind it.

### Credible peers (verified)
- **Lovable** (`lovable.dev`) — conversational full-stack apps, React + Supabase by default; strongest for getting a working DB-backed app end-to-end. Best when I need a whole demo app, not just components.
- **Bolt.new** (`bolt.new`, StackBlitz) — in-browser full-stack scaffold: describes → installs deps → runs → iterates; framework-flexible.
- **INFERENCE:** For Threshold I'd default to **v0** (best UI quality, and I already control the React/Next stack) and reach for Lovable/Bolt only if I wanted a throwaway full-stack sandbox. None of these belong anywhere near the decisioning code — they're presentation-layer accelerators.

---

## 3. Prompt / LLM evaluation & testing

> Relevant if any AI feature ships in-product (e.g. an LLM assist in the *building* or *ops* surfaces — **never** the money path). This is where "I use AI responsibly" becomes demonstrable: evals are the difference between shipping an LLM feature and gambling with one.

- **promptfoo** — CLI/library for LLM eval + red-teaming; declarative YAML prompts + assertions, model comparison, CI/CD integration, adversarial/jailbreak/injection scanning. MIT, local-first. **Now part of OpenAI** — I confirmed directly on the repo: *"Promptfoo is now part of OpenAI. Promptfoo remains open source and MIT licensed."* (`github.com/promptfoo/promptfoo`, actively released as of July 2026). **How for Rokt:** if any prompt-based helper exists, promptfoo is my CI gate — regression-test prompt changes and red-team for injection before merge. Its red-teaming maps directly to Threshold's safety framing.
- **Ragas** — Python toolkit for RAG/LLM-app metrics (faithfulness, relevancy, context precision) + synthetic test-set generation. Actively maintained (v0.4.3, Jan 2026; `github.com/explodinggradients/ragas`). **How for Rokt:** only if a retrieval feature exists; provides research-backed metrics but is a library, not a platform — pair with something that stores results.
- **Braintrust** (`braintrust.dev`) — commercial eval *platform* spanning datasets → scoring → production monitoring → CI release-gating in one system. **How for Rokt:** the "enforce a quality threshold before a release ships" story is literally Threshold's shape applied to LLM quality — a clean analogy to cite. **INFERENCE:** overkill for a solo portfolio build; name it as what a Rokt-scale team would use.
- **OpenAI Evals** (`github.com/openai/evals`) — framework for evaluating LLMs with prebuilt + custom (mostly model-graded) evals; runnable locally or in the OpenAI dashboard. Actively maintained. **How for Rokt:** reference implementation for structuring an eval; less of a full CI harness than promptfoo.
- **DeepEval** (Confident AI) — Python-native, pytest-style LLM unit tests; framework-first, built for local/CI execution. **How for Rokt:** if I want LLM assertions to live *inside the existing test suite* alongside the deterministic tests — the pattern I'd actually adopt for a small build (DeepEval in CI, escalate to a platform only if it matters to revenue).

---

## 4. LLM observability / tracing

> If AI runs anywhere in the stack, you must be able to see it. The strategic point below is the portable one.

- **Langfuse** (`langfuse.com`) — open-source, self-hostable (Postgres + ClickHouse), framework-agnostic tracing + prompt management + cost/latency; ingests via OpenTelemetry. Open-source leader. **How for Rokt:** default self-hosted tracer for any LLM calls — token cost, latency, prompt versioning.
- **LangSmith** (LangChain) — proprietary; deepest LangChain/LangGraph integration, also ingests OTEL/other frameworks. **How for Rokt:** only if the stack were LangChain-heavy (it needn't be).
- **Arize Phoenix** (`phoenix.arize.com`) — open-source, OTEL-native tracing + eval/RAG observability (faithfulness, hallucination, retrieval). From Arize, which came from classical-ML monitoring. **How for Rokt:** the eval-in-observability half; common pattern is Langfuse (operational telemetry) + Phoenix (quality/eval).
- **OpenTelemetry GenAI semantic conventions** — the standard that makes the above portable: vendor-neutral spans/metrics/events for LLM + agent + provider + MCP calls. Confirmed real; the spec **moved to a dedicated repo** (`github.com/open-telemetry/semantic-conventions-genai`) and is still **evolving (largely experimental, not fully stable)** as of retrieval. **How for Rokt / why it matters:** instrument on OTEL GenAI conventions and the observability backend becomes swappable without touching app code — the "exit strategy" against vendor lock-in. **INFERENCE:** this is the single most defensible observability decision to articulate to Rokt engineers: standardize the wire format, keep the backend a commodity.

---

## 5. Prompt optimization / programmatic LLM

- **DSPy** (Stanford NLP; `dspy.ai`, `github.com/stanfordnlp/dspy`) — program the LLM pipeline with typed *signatures*, then let an **optimizer** compile prompts/few-shots against a metric (BootstrapFewShot, MIPRO, COPRO). "Prompts as code." Real, mature, widely used. **How for Rokt:** if a build/ops-side LLM task existed (e.g. classifying policy diffs by risk in Threshold), DSPy lets me define a metric and optimize against it instead of hand-tuning prompts — and crucially produces something *testable and version-controlled*, matching the deterministic-discipline theme. **INFERENCE:** the biggest honest win is turning fuzzy prompt work into an evaluable artifact; the cost is added framework complexity for small tasks.
- **TextGrad** (`github.com/zou-group/textgrad`, paper arXiv:2406.07496) — "automatic differentiation via text": an LLM acts as a gradient oracle giving textual feedback to iteratively edit prompts/solutions; strong at *instance-level* optimization. **Maturity / limits:** more research-grade than DSPy; heavier compute, less production tooling. **How for Rokt:** I'd cite it as awareness of the frontier, not reach for it in a portfolio build.

---

## 6. ML / serving infra for sub-200ms decisioning at scale

> This is the category most directly tied to Rokt's actual engineering problem: rank/serve under a tight latency budget at high volume. I'd present these as "what I understand about the shape of Rokt's serving path," not "tools I bolted onto a toy."

**Serving / inference runtimes**
- **vLLM** (`github.com/vllm-project/vllm`) — high-throughput LLM inference engine; paged KV-cache, continuous batching. **Relevance:** the LLM-serving reference; **INFERENCE:** likely *not* on Rokt's core offer-ranking hot path (that's classic ML, not generative), but the right answer if any LLM ever serves live.
- **NVIDIA Triton Inference Server** — production serving shell: multi-model routing, versioning, metrics, multi-framework backends (incl. a vLLM backend and an ONNX Runtime backend). **Relevance:** the "production shell around the fast engine" — how you operate many models as a fleet with SLAs.
- **ONNX Runtime** (`onnxruntime.ai`) — cross-platform inference runtime for exported models; lower ceiling on raw LLM latency than TensorRT-LLM/vLLM but excellent for portable, CPU/GPU classical-ML and small-model serving. **Relevance / INFERENCE:** for sub-200ms *classic* ranking models (gradient-boosted / small nets), an ONNX-exported model behind a lean server is a very plausible shape for a Rokt-style decisioning path — deterministic, fast, portable.
- **Ray / Ray Serve** (`ray.io`) — distributed compute + framework-agnostic model serving with autoscaling, fractional GPUs, model composition, request batching. **Relevance:** the scale-out substrate when one box isn't enough; composition matters if a decision chains several models.

**Feature stores (the real latency lever for online ranking)**
- **Feast** (`feast.dev`) — open-source feature store; sub-ms online retrieval with Redis, but *you* own writing features to the online store (it doesn't compute transforms on the event). **Tecton** (`tecton.ai`) — managed, push/streaming-based, computes real-time features from Kafka/Kinesis, sub-10ms p99 serving SLA. **Relevance to Rokt:** at checkout, the latency-critical move is fetching precomputed user/context features fast, not recomputing them inline. **INFERENCE:** a Rokt-shaped path more likely resembles Tecton's streaming-feature model (or an in-house equivalent); Feast is the open-source way to demonstrate the same pattern in a portfolio.
  - *Caution:* one secondary source quoted a "Feast 0.10 latest" figure that is almost certainly wrong (Feast was well past that years ago); I'm deliberately **not** citing a Feast version number since I couldn't confirm it to the primary repo.

**Drift monitoring**
- **Evidently** (`evidentlyai.com`) — open-source data/target/prediction drift + performance dashboards; broad, low-friction. **NannyML** (`nannyml.com`) — estimates post-deployment performance *without labels* and links drift to actual accuracy impact. **Relevance:** offer-ranking models decay as user behavior shifts; mature teams run **Evidently for visual reporting + NannyML for the retrain-trigger signal**. Good "I think past deployment" talking point.

**Experiment tracking / registry**
- **MLflow** (`mlflow.org`) — open-source, platform-agnostic; Tracking + Models + **Model Registry** with stage transitions (Staging/Production/Archived) and approval workflows. **Weights & Biases** (`wandb.ai`) — best-in-class experiment visualization/sweeps; registry links models to the runs that made them. **Relevance to Rokt / Threshold:** MLflow's *stage-gated, approval-workflow* registry is the ML-world cousin of Threshold's policy gate — promoting a model to Production behind an approval is the same safety pattern as gating a policy change. **INFERENCE:** common real setup is MLflow (registry + deploy) + W&B (research viz); I'd cite the registry-gating analogy as a bridge from Threshold to MLOps.

---

## 7. Streaming for scale

- **Apache Kafka** (`kafka.apache.org`) — the de-facto distributed event-streaming backbone; ingestion/transport layer, high-throughput low-latency. **Relevance to Rokt:** transaction/impression/click events almost certainly flow through a Kafka-shaped log; it's the substrate feeding both real-time features and downstream analytics.
- **Redpanda** (`redpanda.com`) — Kafka-API-compatible broker rewritten in C++ (no JVM/ZooKeeper), lower tail latency and higher per-node throughput; repositioning around agentic-AI streaming. **Relevance / INFERENCE:** the drop-in-compatible, latency-focused alternative you'd evaluate when Kafka's p99 or per-node cost hurts — a good "I know the trade-space" reference, not a claim Rokt uses it.
- **Apache Flink** (`flink.apache.org`) — the processing layer on top of the log: stateful stream processing with exactly-once guarantees; cleans/transforms/aggregates events (e.g. computing real-time features into a feature store). **Relevance to Rokt:** Kafka moves events, Flink turns them into the real-time signals a sub-200ms ranking decision consumes.

---

## 8. When NOT to reach for AI (the load-bearing section for Rokt)

**Rule:** keep LLMs/generative AI out of any path where a wrong answer moves money, decides eligibility, or must be reproducible. Use deterministic code + exhaustive tests there instead.

Concretely, AI is the *wrong* tool when:
- **Money / billing / payout** logic — an LLM that's 99% right is a liability; the failure mode is silent and financial.
- **Eligibility / consent / compliance gates** — who is *allowed* to see an offer must be a deterministic, auditable rule, not a probabilistic inference. (Ties to privacy/ethics doc 10.)
- **The correctness core of any decision** — anything a regulator, partner, or postmortem would demand you *explain and reproduce*. Non-determinism is disqualifying.

Why this is credible and not just caution: the current agentic-coding tools (Section 1) are explicitly good at breadth and unreliable at subtle correctness — so a build that *assumes AI writes much of the code* must mechanically fence off the part that can't be wrong. That fence is Threshold's **`ast-fitness-test`**:

- It parses the codebase's AST and **fails the build if LLM/model-inference calls appear inside the designated correctness/decision core** — the ban is enforced by the compiler-adjacent test, not by reviewer vigilance or a code-comment.
- This makes "no AI in the money/eligibility path" a *checkable invariant* rather than a promise. AI can write the service, the UI, the tests, the glue — and physically cannot leak into the deterministic decision path without turning CI red.
- **INFERENCE:** this is the strongest single thing to say to Rokt about "Accelerate development with AI." It reframes the JD point maturely: I don't just *use* AI to go fast — I use AI aggressively *and* encode, in an automated test, exactly where it isn't allowed to go. That's the judgment a Transaction Moment (money-adjacent) system actually needs.

---

## 9. Verification log (primary-source confirmations)

- **promptfoo → OpenAI:** confirmed on `github.com/promptfoo/promptfoo` — banner "Promptfoo is now part of OpenAI… remains open source and MIT licensed"; active releases July 2026.
- **Windsurf → Devin Desktop:** confirmed `windsurf.com/cascade` issues a **308 permanent redirect to `devin.ai/desktop`** (Cognition). Cascade EOL / "Devin Local" successor per secondary reporting (not independently price-verified; ~$250M acquisition figure is secondary).
- **OpenTelemetry GenAI semconv:** confirmed real and **relocated** to `github.com/open-telemetry/semantic-conventions-genai`; status still evolving/experimental.
- **OpenAI Evals:** confirmed active at `github.com/openai/evals`.
- **Ragas:** confirmed active, v0.4.3 (Jan 2026), `github.com/explodinggradients/ragas`.
- **Not verified to primary / treated as soft:** all star counts, ARR/user counts, "% faster" productivity claims, and specific version numbers from secondary write-ups (esp. the erroneous "Feast 0.10"). Cited only as directional.
- **Dropped for lack of verification:** none needed — every named tool resolved to a live site/docs/repo.

---

*Opinions labelled **INFERENCE** are mine, reasoned from the verified facts, not sourced claims. Benchmarks are avoided rather than invented; where secondary numbers appear they are flagged as soft.*

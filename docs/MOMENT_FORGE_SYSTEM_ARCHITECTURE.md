# Moment Forge — System Architecture Experience (buildable spec)

> **What this is.** A design spec for a deep, scroll- and interaction-driven **System Architecture** movement to add to `/moment-forge`. The existing page shows the *domain* architecture (DDD bounded contexts, Figs 01–09). This adds the *technical* architecture — how Threshold is actually built and runs, end to end — as a progressive **C4 zoom** (L1 context → L2 containers → L3 components) plus **two animated live paths** (synchronous decision, asynchronous fan-out).
>
> **Discipline (non-negotiable).** Every node and edge maps to a real file in this repo *or* is labelled `DESIGNED`. No invented infrastructure. No fabricated metrics — every latency number is a **budget/goal**, attributed as such. Cohesive with `design-system/MASTER.md`: teal accent, self-hosted fonts, AA contrast, reduced-motion law, no external URLs/images, no fabricated data. This is a **doc**; the parallel build writes the code.

---

## 0. Ground truth — the node/edge ledger (read this first)

Nothing renders that isn't in this table. `SHIPPED` = code exists in the repo (file named). `DESIGNED` = in `docs/FUTURE_VISION.md`, drawn dashed, never claimed as running.

### Containers & processes (SHIPPED)
| Node | Real anchor | Notes for the diagram |
|---|---|---|
| Next.js frontend | `frontend/` (Next 14.2.15) | typed Zod boundary; TanStack Query; offline fallback |
| Typed API boundary | `frontend/lib/api.ts`, `schemas.ts`, `hooks.ts` | `ApiError{http\|network\|validation}`, `request<T>()` validates every body with Zod, `retryPolicy` (no retry on 4xx/validation), `useOutbox` polls while `PENDING` |
| FastAPI app | `backend/app/main.py` | lifespan, router registration, request-id middleware, error-envelope handlers, CORS→localhost:3000 |
| Pure domain core | `backend/app/domain/*` | evaluator · diff · constraints · verdict · ope · replay · contexts · failclosed · sessions · audit · policy |
| Determinism fitness gate | `backend/tests/test_architecture.py` | AST-scans `domain/*` imports; fails build if the core imports openai/anthropic/httpx/fastapi/sqlalchemy/db/models/routers/… |
| Persistence | `backend/app/db.py`, `config.py` | Postgres (Docker) / **SQLite for the zero-config local loop**; tables below |
| Tables | `backend/app/models.py`, `migrations/versions/9d1ef5ac2f21_initial_schema.py` | `policy_versions` (immutable), `replay_jobs` (idempotent), `outbox_events`, `conversions` (dedup) |
| Outbox worker | `_outbox_loop` in `main.py` + `outbox.drain_once` | asyncio background task via `asyncio.to_thread`; interval `OUTBOX_INTERVAL_S=3`; `OUTBOX_WORKER` toggle |
| OTel SDK | `backend/app/observability.py` | TracerProvider + MeterProvider; **ConsoleSpanExporter gated by `OTEL_CONSOLE=1`**; degrades to a no-op tracer/meter if packages absent |

### Components inside the FastAPI app (SHIPPED)
| Component | Real anchor |
|---|---|
| Routers: health, policies, replay, conversions, cancellations, audit, scenarios, momentforge | `backend/app/routers/*` |
| Sync Moment Forge adapters (read-only, non-persisting) | `routers/momentforge.py` → `POST /semantic-compile`, `POST /simulations` |
| Async replay job (authoritative write) | `routers/replay.py` → `POST /replay-jobs` |
| Transactional outbox (enqueue + drain) | `backend/app/outbox.py`, `models.OutboxEventRow` |
| HMAC audit spine | `domain/audit.py` (`content_hmac` = HMAC-SHA256 over canonical JSON), `routers/audit.py` |
| Fail-closed lanes | `domain/failclosed.py` + `evaluator.evaluate` (`InvalidComparison` → `no_offer`) |
| Determinism boundary | enforced by `tests/test_architecture.py`; asserted by `TRANSACTION_INVARIANTS.md` #3, #4 |

### DESIGNED nodes (from `docs/FUTURE_VISION.md` — dashed, tagged, never "running")
| Node | Source |
|---|---|
| Kafka / Redpanda event-time ingress | FUTURE_VISION Milestone B |
| Read replica for session reads | Milestone B |
| Horizontal worker pool / batched evaluation ("Ray batch pool" = extrapolation, tag it) | Milestone B |
| OTLP export → OTel Collector → metrics/trace backend | (SHIPPED today = console/no-op only; the collector hop is DESIGNED) |
| Feature store / real event-time log adapter | Milestone A |
| Drift-monitoring sidecar · full OPE (IPS/SNIPS/DR) · LLM change-summaries | Milestone D |
| CI/CD deploy-gate + approval-queue integration | Milestone C |
| Consent-aware historical replay | Milestone E |

> **Honesty call-outs baked into the diagram (do not soften):**
> - The **OTel Collector is DESIGNED.** What ships is the OTel *SDK* with a console exporter (off by default) and a no-op fallback. Draw the SDK solid, the collector hop dashed.
> - **SKIP-LOCKED / concurrent N-worker drain is Postgres-only** (`outbox.py` line 59 checks `dialect.name == "postgresql"`). On the SQLite local loop it's a plain `SELECT … LIMIT 50`. Say so on hover.
> - Every **ms is a budget**: `policy.latency_budget_ms`, the 500ms constraint ceiling, Rokt's public "sub-200ms" and 5000ms `fallback-timeout`. There are **no measured latencies** in this repo — never print one.

---

## 1. Where it lives & how it stays cohesive

**Placement — primary recommendation: a companion route `/moment-forge/system` ("Volume II · The System").**
The existing `/moment-forge` is already a nine-figure domain monograph and is scroll-heavy. A C4 zoom stage plus two animated path players wants its own focus and its own reduced-motion budget. Build `frontend/app/moment-forge/system/page.tsx` that **reuses the exact chassis** — `MomentNav`, `BlueprintSubstrate`, `PlateRail`, `Plate`, `Eyebrow`, `Marginalia`, `DomainTerm` from `components/moment-forge/chassis.tsx`, and `MaskText`/`Reveal`/`ClipReveal` from `components/builder/anim`. Add a Volume switcher to `MomentNav` ("I · The Domain" ↔ "II · The System") and a forward link from Fig 09 (`EvidenceIndex`) → Volume II. It reads as the same publication, second movement.

**Fallback placement (if a single page is preferred):** append Figs 10–15 to `MomentForge.tsx` after Fig 09 and extend the `RAIL` array in `chassis.tsx`. Same components; only the routing differs.

**Cohesion contract (from MASTER.md):** teal = safe/shipped/eligible, crimson = fail/blocked/dead-letter, amber = warn/pending, offer-blue = neutral-info; status is **always color + glyph + text**; Space Grotesk display / Inter body / mono for ids & protocols; blueprint-grid substrate (not a glowing dashboard); solid `text-muted` (never fractional-alpha); all motion gated by `prefers-reduced-motion`; inline SVG only, zero external assets; **renders only real structure — no fabricated numbers.**

---

## 2. The signature interaction — one persistent C4 stage

A single SVG **stage** (`<C4Stage>`) holds the architecture. Zoom level is app state (`level: 1 | 2 | 3`, plus optional `focusNodeId`). Changing level animates the SVG **`viewBox`** (a smooth reframe, not a DOM swap) so the same nodes appear to *dolly in*; nodes fade their sublayer detail in as the frame tightens. A persistent **ZoomTrail** breadcrumb (`System ▸ FastAPI app ▸ Pure core`) sits top-left; every level has a labelled heading so the SVG is never the only signal.

- **L1 System Context** — click **Threshold** to zoom to L2 containers.
- **L2 Containers** — click the **FastAPI app** container to zoom to L3 components; hover any **edge** to reveal its protocol/contract via `<EdgeTooltip>`.
- **L3 Components** — the FastAPI internals with the **determinism boundary** drawn as a hard line; click a component to open a side `<NodeCard>` detail (file path, responsibility, invariants it upholds).

**Reduced-motion / no-JS law:** with `prefers-reduced-motion: reduce`, `<C4Stage>` renders **all three levels stacked as static, fully-labelled figures** (L1, L2, L3 one under another), each inside its own `Plate`, with the zoom controls replaced by anchor links. No `viewBox` tween, no path animation — the final, complete state, legible and keyboard-navigable. This is the same "instant final state" rule the global freeze block already enforces.

**Keyboard & a11y for the stage:** the stage is a `role="group"` with `aria-label="C4 architecture, level N"`. Nodes are real `<button>`s in DOM order (tab-traversable, visible teal focus ring, `aria-label` = node name + SHIPPED/DESIGNED + one-line role). Enter/Space zooms in; `Escape` zooms out one level (mirrors the breadcrumb). An `aria-live="polite"` region announces level changes ("Zoomed to Containers. 8 containers."). Edges are `aria-hidden` decor; their protocol facts are *also* printed in a per-level `<Legend>`/`Marginalia` so edge info never lives only in a hover. Heading order is strict: page `h1` → each `Plate` `h2` → `NodeCard` `h3`.

**Mobile:** the pan/zoom stage collapses to a **vertical accordion of the three levels** (tap a level header to expand; tap a container to expand its component list inline). No pinch-zoom dependency. Wide SVG scrolls inside its own `overflow-x:auto` container (never the body). Touch targets ≥44px (matches the existing `min-h-[44px]` nav pattern).

---

## 3. Level 1 — System Context (C4-L1)

**Story:** the merchant's checkout, the Rokt-shaped decisioning Threshold *models*, Threshold itself as the change-safety gate, and the human operator/approval loop.

**Layout/composition:** a horizontal narrative band. Left: **Merchant checkout** (offer-blue, glyph "cart"). Center-left: **Rokt Transaction-Moment decisioning** drawn as a *modeled* actor (dashed teal outline + `MODELED` tag — Threshold never selects offers; `domain/policy.py` docstring: "Threshold never *selects* offers (Rokt Brain does that)"). Center: **Threshold — Policy Change Safety Gate** (solid teal, the hero, using `TransactionMomentMotif` as its interior motif). Right: **Operator** (proposes) and **Approval queue / holdout** (`DESIGNED` integration, dashed — FUTURE_VISION Milestone C).

**What's real vs modeled (labelled on the node):**
- REAL: Threshold, the operator interaction (compile/simulate against the live backend), the deterministic verdict = *eligibility for a controlled holdout* (`domain/verdict.py`, `HOLDOUT_CONFIG` verbatim from Rokt's Page-Holdout page).
- MODELED: Rokt Brain decisioning, live checkout — Threshold sits **beside** the core and is **offline / pre-release** (`SECURITY_PRIVACY.md`: "never sits in the live serving path").

**Interaction:** hover Threshold → a one-line thesis (`FUTURE_VISION` §"one connected story"). Click Threshold → zoom to L2. Hover the checkout↔Threshold edge → `<EdgeTooltip>`: "no synchronous dependency — offer failures resolve to No Offer Rendered" (Invariant #1).

**Motion:** on entry, the "proposes → gate → holdout" arrows draw once (stroke-dashoffset), then rest. Reduced-motion → arrows pre-drawn.

**Type/space:** L1 uses the largest scale — one `MaskText` h-level statement over the band; generous whitespace; the band centered in `max-w-5xl`.

**Mobile:** the band stacks vertically (checkout → decisioning → Threshold → operator/holdout) as a labelled flow.

---

## 4. Level 2 — Containers (C4-L2)

**Story:** the real runtime pieces and how they talk.

**Nodes (all SHIPPED unless tagged):**
1. **Next.js frontend** (offer-blue) — typed Zod boundary, TanStack Query, offline fallback. Sublabels: `lib/api.ts`, `lib/hooks.ts`.
2. **Typed API boundary** — drawn as the *membrane* on the frontend edge: every response is Zod-validated (`request<T>()` → `schema.safeParse`), failures become `ApiError{kind:"validation"}`, transport failure → `kind:"network"` → offline banner.
3. **FastAPI app** (teal, the zoom target) — `main.py`; request-id middleware; error-envelope; CORS.
4. **Pure domain core** (teal, inner-glow to signal "no I/O") — `domain/*`.
5. **Postgres** (offer-blue) — "SQLite for the local loop" subtag; four tables listed as chips: `policy_versions` (immutable), `replay_jobs` (idempotent), `outbox_events`, `conversions`.
6. **Outbox worker** (teal) — background asyncio task; `drain_once`.
7. **OTel SDK** (muted) — tracer+meter; **console/no-op today**, with a *dashed* stub edge to a **DESIGNED** OTel Collector → backend.

**Real ports/protocols (on the edges — hover for `<EdgeTooltip>`):**
- Frontend → FastAPI: **HTTPS/JSON**, `NEXT_PUBLIC_API_BASE` default `http://localhost:8000`; header `X-Threshold-User`; `X-Request-ID` echoed back (`main.py` middleware). Protocol chip: `HTTP · JSON · Zod-validated`.
- FastAPI → Postgres: **SQLAlchemy 2.0 / DB-API** (`db.py` engine); Alembic is migration source of truth.
- FastAPI → domain core: **in-process function call** (no serialization) — the fitness test guarantees this stays a pure call, not a network hop.
- Replay router → Postgres: authoritative write **+ outbox insert in the same transaction** (drawn as one thick edge labelled `single txn`).
- Outbox worker → Postgres: `SELECT … WHERE status=PENDING AND next_attempt_at≤now LIMIT 50` **`FOR UPDATE SKIP LOCKED` (Postgres only)**; edge tooltip states the SQLite degradation.
- App → OTel SDK: in-process spans/metrics; console exporter gated by `OTEL_CONSOLE=1`.

**Interaction:** click **FastAPI app** → zoom to L3. Click **Postgres** → `<NodeCard>` lists the four tables + their invariants (immutable versions, idempotency keys, dedup keys). Toggle the **ScaleToggle** here (see §8) to fade in the DESIGNED scale-out ring around this level.

**Motion:** containers settle in with a short `Reveal` stagger; edges draw once. A subtle, **reduced-motion-gated** dashed "flow" marches along the frontend↔app edge only while that edge is hovered (never an ambient loop — MASTER motion restraint).

**Type/space:** each container is a `NodeCard` sized by importance (FastAPI + core largest). Protocols in mono. Grid: 2–3 columns desktop.

**Mobile:** vertical list of container cards; each expandable to its protocol + file anchors.

---

## 5. Level 3 — Components (C4-L3), with the determinism boundary drawn

**Story:** inside the FastAPI app — routers on the *effectful* side, the pure core on the other, separated by a **hard boundary the build enforces**.

**Composition — two lanes split by a vertical rule:**

- **Effectful shell (left, muted/offer-blue):** the eight routers; the request-id middleware; the error-envelope; the transactional outbox (`outbox.py`); the persistence adapters (`common.load_policy`, `models`). Marked "I/O, clock, RNG live here."
- **THE DETERMINISM BOUNDARY (the vertical rule):** a solid line labelled with the **AST-fitness rule** — click it to open a `<NodeCard>` quoting `tests/test_architecture.py`: the core may not import `openai/anthropic/cohere/langchain/httpx/requests/fastapi/starlette/sqlalchemy/psycopg/sqlite3` (top-level) or `db/models/routers/main/config` (relative). Caption: *"No LLM, no network, no DB, no web framework, no clock, no RNG crosses this line. The build fails if it tries."* Grounds Invariants #3, #4.
- **Pure core (right, teal):** `evaluator` → (`diff`, `constraints`, `verdict`, `ope`, `contexts`, `failclosed`, `sessions`) orchestrated by `replay.run_replay`. Draw `evaluate()` as the total function at the center (fails closed on `InvalidComparison`). Show **fail-closed lanes** as three crimson inlets into `failclosed.prove` (timeout / invalid_output / stale_identity → `no_offer`).
- **HMAC audit spine (spanning, amber→teal):** `domain/audit.py` drawn as a vertical spine threaded through the core — every stage appends an HMAC-SHA256 record (`REPLAY_STARTED`, `CONSTRAINTS_EVALUATED`, `DECISION_RECORDED`, `FAILCLOSED_PROVEN`, `VERDICT_ISSUED`). Use the `IntegrityShield` illustration as its cap.

**Interaction:** hovering a core component highlights the boundary rule and dims the shell (visual proof the core is an island). Click any component → `<NodeCard>`: file path, one-line responsibility, the invariant(s) it upholds (cross-linked to `TRANSACTION_INVARIANTS.md`), and — for `constraints` — the "missing-attribute counterfactual" as its signature.

**Motion:** the boundary line "locks" (a brief draw + subtle teal pulse, reduced-motion-gated) when L3 first enters — a small dramatic beat that says *this line is load-bearing*.

**Type/space:** mono for every file path and rule id; the boundary label in display font. Two-lane grid desktop; the audit spine is a thin third rail.

**Mobile:** shell list, then a full-width "DETERMINISM BOUNDARY" divider card, then the core list; audit spine becomes a labelled strip above the verdict.

---

## 6. The two live paths, animated (`<PathAnimator>`)

A tabbed sub-figure below the C4 stage: **Path A — Synchronous decision** and **Path B — Asynchronous fan-out**. Each is a directed SVG route over the same node vocabulary; a **Play** control (and scroll-scrub) sends a token along the route, pausing at each numbered station with a caption. Reduced-motion → the whole route is drawn with **numbered step chips**, no moving token.

### Path A — Synchronous request path (Moment Forge compile/simulate)
Route (`routers/momentforge.py`): **① Frontend** (`useSemanticCompile`/`useSimulation`) → **② FastAPI** (request-id middleware) → **③ read-only `load_policy`** → **④ pure core** (`build_semantic_delta` / `run_replay` — *no writes*) → **⑤ Zod-validated JSON response**. Emphasize: these endpoints are **non-persisting** (docstring: "never write a PolicyVersionRow / ReplayJobRow / OutboxEventRow / ConversionRow").
- **Budgets, labelled as budgets:** annotate ④ with `policy.latency_budget_ms` and the constraint **500ms ceiling** / Rokt public **sub-200ms**, each carrying a `BUDGET` tag and its grounding. **Never** show a measured ms.
- **Fail-closed inset:** a crimson branch off ④ showing `timeout / invalid / stale → No Offer Rendered` and `InvalidComparison → no_offer` (evaluator stays total).

### Path B — Asynchronous path (authoritative replay + outbox)
Route (`routers/replay.py` + `outbox.py` + `_outbox_loop`):
- **① `POST /replay-jobs`** with `Idempotency-Key` → **② idempotency check** (same key → return existing job, 200, never re-run — Invariant #7).
- **③ `run_replay`** (pure) → **④ `db.flush()`** (assign `row.id`) → **⑤ `outbox.enqueue` (same txn)** → **⑥ `db.commit()`**. Draw ④⑤⑥ inside one bracket labelled **"commit iff side-effects"**: the job row *and* its fan-out events commit atomically, or neither does. Show the `IntegrityError → rollback → return existing` idempotency race lane.
- **⑦ Outbox worker** (`_outbox_loop`, every 3s) → **⑧ `drain_once`**: `SELECT PENDING … LIMIT 50 FOR UPDATE SKIP LOCKED` → publish → **PUBLISHED** (teal) / **retry** (amber, `next_attempt_at = now + backoff+jitter`) / **DEAD_LETTER** (crimson, after `MAX_ATTEMPTS=5`).
- **⑨ Frontend `useOutbox`** polls `GET /replay-jobs/{id}/outbox` every 2s **while any event is PENDING**, stops when all PUBLISHED/DEAD_LETTER.

**The N-workers beat:** a control adds a second/third worker lane draining the same table; `SKIP LOCKED` lets them not collide (Postgres-only — say so). This is the honest scale-out proof (FUTURE_VISION Milestone B: "already implemented").

**Interaction:** step-forward/back buttons; each station updates an `aria-live` caption. Hover a station → the corresponding L2/L3 node highlights on the C4 stage (shared node ids link the two figures).

**Motion:** single token per route, eased, pausing at stations; backoff visualized as the retry token *waiting* then re-entering. Reduced-motion → static numbered route + a step list.

**Mobile:** the route becomes a **vertical numbered timeline** (station cards top-to-bottom) with the same captions; Play becomes step-through.

---

## 7. Observability plane (how you'd debug it in prod)

A dedicated `Plate` ("The Observability Plane") — a cross-section, not a fake dashboard.

- **Spans (real, `get_tracer`):** `momentforge.compile`, `momentforge.simulate.resolve`, `momentforge.simulate.run`, `replay.load_policies`, `replay.run` — drawn as a nested span waterfall (structure only, **no fabricated durations**; if a duration axis is shown, it is unlabeled/relative and marked "shape, not measured"). Attributes as chips: `threshold.verdict`, `threshold.session_count`, `momentforge.inversion_detected`, `momentforge.support`.
- **Metrics (real `momentforge_*` instruments, `routers/momentforge.py`):** list the actual instruments — counters `momentforge_compile_total`, `momentforge_simulate_total`, `momentforge_inversion_detected_total`, `momentforge_validation_error_total`; histograms `momentforge_compile_duration_ms`, `momentforge_simulate_duration_ms`, `momentforge_simulate_sessions`. Render as **named instrument cards with no invented values** (data-integrity law) — the point is the instrumentation exists, not a number.
- **Structured logs:** the JSON log line format (`main.py` `logging.basicConfig`) and the per-route JSON `log.info` (with `request_id`, `duration_ms`, `verdict`, `change_count`). Show one representative line as a *schema*, values as placeholders.
- **Request-id propagation:** trace `X-Request-ID` from the frontend header → middleware → span/log context → **error envelope** `{"error":{"code","message","request_id"}}` → back to the frontend `ApiError.requestId`. Draw this as a single highlighted thread across the whole system — the "how you'd chase one request" line.
- **Honesty tag:** the export hop (SDK → **OTel Collector** → backend) is `DESIGNED`/dashed; today it's console-exporter-gated / no-op. State it.

**Interaction:** click a span → the C4 node that emits it highlights; click a metric → the code site that increments it (`NodeCard` with file/line). Reduced-motion: static waterfall + lists.

---

## 8. The honest scaling story (`<ScaleToggle>`)

A single `Plate` with a **two-position toggle: `SHIPPED` ⇄ `DESIGNED`** (color + label + glyph — solid ● vs dashed ◌ — never color alone). It overlays the *same* C4-L2 stage.

- **SHIPPED (solid teal):** transactional outbox + worker + capped-exponential backoff + jitter + dead-letter (`outbox.py`); idempotent replay jobs & conversion dedup (`replay.py`, `conversions.py`); **replay-equality / bit-for-bit determinism** (`TRANSACTION_INVARIANTS.md` #3, `test_replay_deterministic`); **N workers via `SKIP LOCKED`** (Postgres); immutable policy versions; Alembic migrations; HMAC audit.
- **DESIGNED (dashed, from FUTURE_VISION, tagged, never "running"):** Kafka/Redpanda ingress; read replica; horizontal worker pool / batched evaluation ("Ray batch pool" — mark as an *extrapolation* of Milestone B's "batched evaluation / horizontal worker pool"); feature store / real event-time log adapter; drift sidecar; full OPE estimator; LLM change-summaries (edge-only, off the hot path); CI/CD deploy-gate; consent-aware replay. Each DESIGNED node carries its **Milestone letter (A–E)**.
- **The invariant ribbon:** across both states, pin FUTURE_VISION's invariants — *idempotent job · atomic verdict · no partial results · no future-information leakage · deterministic LLM-free core · checkout preservation 100%*. The message: **the edges change; the core does not.**

**Fabrication guard (flagged):** the tempting visual here is throughput/QPS numbers ("10B transactions/s"). That would violate the data-integrity law. **Compliant alternative:** show Rokt's *public* figures ("10B+ transactions annually," "33,000+ clients," "sub-200ms") explicitly attributed to `rokt.com` via `FUTURE_VISION.md`, and render DESIGNED capacity **only relatively** (more worker lanes, a replica) with **no numbers**.

**Interaction:** the toggle animates DESIGNED nodes in/out (fade + dash-draw, reduced-motion → instant). Keyboard: it's a real `<button role="switch" aria-checked>`; `aria-live` announces "Showing designed (future) architecture — not running."

---

## 9. Reusable components to build

Build these under `frontend/components/moment-forge/system/`. Reuse chassis/anim/illustrations; **do not** introduce new tokens, fonts, colors, or external assets.

| Component | Responsibility | Key props / a11y |
|---|---|---|
| `C4Stage` | The persistent SVG stage; owns `level`/`focusNodeId`; animates `viewBox`; renders `ArchLayer` per level; reduced-motion → stacked static figures | `role="group"`, `aria-label`, `aria-live` for level changes, `Escape` = zoom out |
| `ArchLayer` | One C4 level's node+edge composition (L1/L2/L3 variants) | receives node/edge model; strict heading order |
| `NodeCard` | A container/component node **and** its click-detail (file path, role, invariants, SHIPPED/DESIGNED) | real `<button>`, focus ring, `aria-label` = name+status+role |
| `FlowEdge` | A directed edge with a `ProtocolChip`; hover → `EdgeTooltip` | edge facts also mirrored into `Legend` (never hover-only) |
| `EdgeTooltip` / `ProtocolChip` | Protocol/contract text (HTTP·JSON·Zod, single-txn, SKIP-LOCKED…) | mono; keyboard-reachable |
| `PathAnimator` | Plays a token along a route with numbered stations + captions; scroll-scrub + Play/Step | reduced-motion → static numbered route; `aria-live` captions |
| `ScaleToggle` | SHIPPED ⇄ DESIGNED overlay switch | `role="switch"`, `aria-checked`, announces "not running" |
| `ShippedDesignedTag` | The status badge: color **+ glyph (● solid / ◌ dashed) + text** + Milestone letter | never color-alone |
| `DeterminismBoundary` | The drawn boundary + the AST-fitness `NodeCard` quoting `test_architecture.py` | display-font label |
| `ZoomTrail` | Breadcrumb reflecting `level`/`focusNodeId`; each crumb zooms out | nav landmark |
| `Legend` | Per-level key (node status, edge protocols) — the non-hover home for edge facts | always visible |

**Reuse (don't rebuild):** `Plate`, `PlateRail`, `Eyebrow`, `Marginalia`, `DomainTerm`, `MomentNav`, `BlueprintSubstrate` (chassis); `MaskText`, `Reveal`, `ClipReveal` (anim); `IntegrityShield`, `FailClosedLaneMotif`, `TransactionMomentMotif` (illustrations). Extend `RAIL`/PlateRail with the new figures.

---

## 10. Where the tempting visual breaks MASTER — and the compliant swap

| Tempting visual | Violates | Compliant alternative |
|---|---|---|
| Latency numbers on edges (e.g. "12ms") | data-integrity (no measured metrics exist) | `BUDGET` chips citing `latency_budget_ms` / 500ms ceiling / Rokt sub-200ms, tagged "budget, not measured" |
| Throughput/QPS on the scale diagram | data-integrity | Rokt public figures attributed to `rokt.com`; DESIGNED capacity shown *relatively*, no numbers |
| Green=SHIPPED / grey=DESIGNED by color only | color-alone rule | `ShippedDesignedTag`: color **+ ●/◌ glyph + text + Milestone letter** |
| Faint node captions via `text-muted/50` | contrast law (fractional-alpha) | solid `text-muted` (#9AA7BF ≈7.9:1) |
| Ambient looping particle flow on all edges | motion restraint + reduced-motion | flow only on hover/active edge; single token in `PathAnimator`; all gated → instant final state |
| Mermaid/d3 from a CDN | no external URLs | hand-authored inline SVG; local libs only |
| Drawing the OTel Collector solid | honesty (it's not wired) | SDK solid, collector hop dashed + `DESIGNED` tag |
| Glowing neon "ops dashboard" for §7 | brand restraint (not a generic dark dashboard) | blueprint cross-section: span waterfall (shape only) + named instrument cards, no invented values |

---

## 11. Build order (suggested)

1. `C4Stage` + `ArchLayer` (L1→L2→L3 static first) + `ZoomTrail` + reduced-motion stacked fallback. Land the honest node/edge model from §0.
2. `NodeCard` / `FlowEdge` / `EdgeTooltip` / `Legend` — the click/hover contract and keyboard traversal.
3. `viewBox` zoom animation + `DeterminismBoundary` beat.
4. `PathAnimator` — Path A, then Path B (the outbox/SKIP-LOCKED/dead-letter/N-workers story).
5. Observability `Plate` (§7) + request-id thread.
6. `ScaleToggle` (§8) + invariant ribbon.
7. Wire into `/moment-forge/system` route, MomentNav Volume switcher, PlateRail, Fig-09 forward link; full a11y + mobile pass.

---

### Cross-references
`backend/app/main.py` · `backend/app/outbox.py` · `backend/app/observability.py` · `backend/app/db.py` · `backend/app/models.py` · `backend/app/config.py` · `backend/app/domain/*` · `backend/app/routers/{momentforge,replay,conversions,audit,common}.py` · `backend/tests/test_architecture.py` · `backend/migrations/versions/9d1ef5ac2f21_initial_schema.py` · `frontend/lib/{api,hooks,schemas}.ts` · `frontend/components/moment-forge/chassis.tsx` · `docs/{ARCHITECTURE,FUTURE_VISION,TRANSACTION_INVARIANTS,SECURITY_PRIVACY,MOMENT_FORGE_ARCHITECTURE}.md` · `design-system/MASTER.md`

# 12 — Reuse Map (Consolidated) for a Rokt Proof-of-Work Project

**Auditor:** Agent 11 — Repository Auditor
**Date:** 2026-07-18
**Companion doc:** `11_REPOSITORY_AUDIT.md` (per-repo findings)

**Rokt context primer:** Rokt is an e-commerce / ad-tech company operating in the transaction moment — placing relevant offers and messages in the checkout/confirmation flow, at scale, with revenue-sharing economics. A strong Rokt-themed proof-of-work project therefore leans on: high-throughput event handling, idempotent transactional processing (money is involved), deterministic decisioning with an explainable "why this offer," auditability, and safety rails. The audited repos map onto this unusually well — several are literally "deterministic engine decides, LLM only explains, everything is audited and idempotent." That is the reuse thesis.

---

## A. Backend patterns worth carrying in

Ranked by reuse value and fit to a Rokt (checkout/offer/transaction) domain.

1. **Idempotency at the irreversible boundary — DB constraint + request key + terminal-state guard.**
   - Best references: Dreamship `backend\preflight\engine\replay.py` (row-lock `select_for_update` held across guard→revalidate→submit; no-op if already SUBMITTED; re-check idempotency right before the external boundary) + `backend\preflight\idempotency.py` (HTTP `Idempotency-Key` stores body-hash, 409 on key-reuse-with-different-body) + the partial-unique DB constraint in `models.py`. Also ShelfTrace unique `idempotency_key` columns + `Idempotency-Key` header; Efficast `gateway\idempotency.py` ledger; 100 Miles `ON CONFLICT(provider, external_activity_id) DO UPDATE`.
   - Rokt fit: offer impressions, conversions, and revenue events arrive at-least-once from partners — dedupe by a natural composite key, and never let a retried "record conversion" double-count. This is the single highest-value pattern for a Rokt build.

2. **Transactional outbox + worker with backoff, jitter, and dead-letter.**
   - Best reference: ShelfTrace `backend/app/services/orchestrator.py` (`process_outbox_once()` with `.with_for_update(skip_locked=True)`, capped exponential backoff *with jitter*, `DEAD_LETTER` after max attempts) + `dead_letter.py` (structured alert + non-blocking Slack). Efficast `workflow\audit.py` writes outbox events in the *same transaction* as the state change and drains exactly-once. Dreamship uses Celery + Redis for the async replay path.
   - Rokt fit: reliably fan out "conversion happened / offer served" events to billing, partners, and analytics without losing or double-sending under downstream failure.

3. **Immutable, append-only audit spine (upgrade to hash-chained + HMAC where integrity matters).**
   - Best references: Efficast `backend\app\workflow\audit.py` (per-correlation monotonic `seq`, content `entry_hash` chained to prior hash incl. attribution, optional HMAC-SHA256, `verify_audit_chain()` that localizes tampering) — the gold standard. Simpler-but-solid: ShelfTrace `services/audit.py` (caller-supplied strictly-increasing timestamps for causal ordering), Dreamship `AuditEvent` + correlation-ID middleware, NexusWatch `audit_logs` rows with `actor`+`metadata`, 100 Miles `ops_audit_log` + additive correction ledger.
   - Rokt fit: money and partner revenue-share must be reconstructable and tamper-evident. Every decision ("served offer X to session Y because rule Z") becomes an immutable event.

4. **Deterministic decision engine, LLM only explains — with a hard grounding guardrail.**
   - Best references: fanflow `lib\seed.ts` (`scoreGateBreakdown` returns a transparent 7-component `GateScoreBreakdown[]`) + `lib\explain\arrivalExplanation.ts` (`mentionsWrongGate()` discards any LLM output contradicting the rule decision; regex `sanitizeExplanation`; provider cascade Groq→Gemini→template with double timeout). Episode Companion `agent.py` (RRF hybrid retrieval + allow-list guardrail + LLM-as-critic retry + `INSUFFICIENT_MSG` fallback). NexusWatch `lib\nexus.ts` (pure threshold bands). Efficast agent graph where the LLM proposes but never judges/actuates (`security.py` role matrix).
   - Rokt fit: offer selection/ranking is deterministic and explainable ("why you're seeing this"); an LLM may generate the human-readable rationale or creative copy but can never override which offer or price was chosen. This is the safest, most demo-able "AI" story for ad-tech.

5. **Deterministic reconciliation / verification state machine with a single enforcement point.**
   - Best references: ShelfTrace `reconciliation.py` (pure `decide_action()`: mismatch→BLOCKED, timeout→RETRY, all→ELIGIBLE; `_is_held_against_reconcile()` guarantees an integrity hold can't be lifted by wrong-value agreement) + Efficast `workflow\state_machine.py` (legal-transition table, role guards, optimistic-lock version, single `transition()` entry). Dreamship terminal-state guard.
   - Rokt fit: verify a served offer actually rendered/converted correctly across surfaces before "expanding" (rolling out) a campaign; block on mismatch.

6. **Human-in-the-loop review queue with flag derivation + audit on every mutation.**
   - Best reference: NexusWatch `lib\supabaseWrites.ts` (`buildWritableFlags`, `getReviewStatus`/`getRiskStatus`, structured `audit_logs` on each write) feeding a review queue; schema-drift-tolerant writes (`42703` retry).
   - Rokt fit: route low-confidence offer/creative decisions or flagged transactions to a reviewer before they go live.

7. **Layered document/text intake with graceful degradation + confidence ladder.**
   - Best reference: NexusWatch `app\api\uploads\pdf\route.ts` + `lib\pdfOcr.ts` + `lib\invoiceTextParser.ts` (embedded text → literal scrape → Tesseract OCR; status ladder `pdf_text`→`ocr_needs_review`→`manual_review_required` with per-field confidence).
   - Rokt fit: only if the project ingests partner creative assets/offers from files; otherwise lower priority.

8. **Architecture enforced by fitness-function tests (import-graph rules).**
   - Best reference: Efficast `backend\tests\test_architecture.py` (parses `app/` imports via `ast`, fails the build if hexagonal boundaries break, incl. "no machine-control function exists anywhere"). ADRs in `docs\adr\`.
   - Rokt fit: encode the safety invariant as a test — e.g., "no module outside the billing service may write a revenue event," "the ranking engine never imports the LLM client."

---

## B. Frontend patterns worth carrying in

1. **Typed API client with unwrapped return types + a first-class `ApiError`.** Dreamship `frontend\src\lib\api.ts` (axios + `endpoints` object → typed `Promise<T>`, consumed via TanStack Query; UI state in a tiny Zustand store). Efficast `frontend\lib\api.ts` (`ApiError` carrying `status`/`detail`/`code`/`stage`). Clean server-state vs client-state separation.
2. **Store-interface-driven reactive projection with a swappable backend.** fanflow `FanflowStore` interface (`lib\data\`, local vs Supabase by env) + `gameDaySim` singleton pushing `LiveSignal`s into the one store every surface subscribes to; pure derived-intelligence modules feed presentational cards. Zero per-page wiring; SSR-safe formatting to avoid hydration mismatch.
3. **Epoch-stamped polling hook.** ShelfTrace `frontend/lib/useLive.ts` — monotonic epoch per request, commit only the latest; kills stale-overwrite and unmounted-setState bugs. Drop-in for any live dashboard.
4. **Live client-side preview sharing the server's pure engine.** NexusWatch `app\upload\page.tsx` runs `previewInvoiceImpact` client-side before persisting — same `lib/nexus.ts` used server-side. Great for "see the impact of this offer/rule before publishing."
5. **Complete designed state kit (loading / empty / error / locked / offline), a11y-first.** Efficast `frontend\components\forge\states.tsx` (`Skeleton`, `LoadingState` with `role="status"`/`aria-live`, reduced-motion empty states) + `announce.ts` live-region helper.
6. **Token-driven design system.** NexusWatch HSL CSS-variable theme in `tailwind.config.ts` + shared primitives (`StatusBadge`, `EmptyState`, `Toast`, `CsvExportButton`, `AppSidebar`/`TopBar`/`PageHeader`). Episode Companion `design-system.css` (framework-free CSS custom properties). 100 Miles shadcn/Radix + `cn()` (cva + tailwind-merge). Dreamship UI primitives `ScoreRing`/`Timeline`/`JsonPane`/`Drawer`. **Build a fresh Rokt token set — reuse the *structure*, not the old visual identity.**
7. **Guided demo / onboarding narrative as a state machine.** 100 Miles `src/components/demo/` 8-step `DemoContext` + SSE progress + PNG recap card. Good for a self-running proof-of-work walkthrough.
8. **Explainability UI ("Why this decision?") + confidence/source chips.** fanflow "Why this gate?" panel from `GateScoreBreakdown[]`, `SourceChip.tsx`, `ConfidenceChip.tsx`; NexusWatch confidence pills. Directly reusable as "Why this offer?" for Rokt.

---

## C. Testing patterns worth carrying in

1. **Scenario/persona fixtures that drive both tests and a live debug toolbar.** fanflow `lib\scenarios\scenarios.ts` — `(prefs, signals, expectedBehavior)` bundles power `tests/rule-engine.test.ts` *and* a `/debug` UI (133 vitest tests). Single source of truth for behavior.
2. **Real-concurrency tests, not mocks.** ShelfTrace `test_concurrency_pg.py` (actual Postgres row-lock/SKIP-LOCKED), `test_outbox_backoff.py`, `test_deadline_recovery.py`. Dreamship `test_idempotency.py`, `test_hostile_input.py`, `test_money_precision.py`, `test_rule_index_n1.py` (N+1 guard), `test_tenancy.py`, `test_replay_orchestration.py`.
3. **Executable end-to-end "prove" scripts wired into a one-command verify.** ShelfTrace `tests/prove_sequence.py` / `prove_certification.py` + `verify.sh` (compose up → wait `/health` → pytest → prove sequence → reset demo). A credible "it actually works" artifact.
4. **Guardrail tests asserting both block and allow paths.** Episode Companion `tests/test_guardrail.py`, `test_rag_quality.py`. Essential for the deterministic-engine + LLM-explainer pattern.
5. **Anti-fabrication discipline codified in `CLAUDE.md`.** ShelfTrace ("only claim what the repo proves — 410 Postgres tests"). Carry this into the Rokt build's contributor guide.

---

## D. Seeded-storytelling approaches worth carrying in

The strongest demos encode the product thesis directly in the fixtures, and generate seed data *through the real pipeline*:

- **Seed through the real engine, not hand-faked.** Dreamship `seed\orders.py` runs six signature failure modes through ingest→normalize→validate. Efficast `seed\northstar.py` seeds only the substrate *up to the moment the agent takes over*; the rest runs live.
- **A narrative CSV/fixture corpus that is also the test corpus.** ShelfTrace `qa_csvs/` (clean success → valid edges → invalid mixed rows with a "valid row survives" control → duplicates/blanks → timeout recovery with named perishables). fanflow `lib\seed.ts` (WC 2026 Final, MetLife, Maria + 6-year-old, characterful gates) + `gameDaySim` authored dramatic arc.
- **One protagonist, one complete journey.** fanflow ("Maria"), NexusWatch ("Sara", 24 invoices, 13 flags, documented verified demo path in `HANDOFF.md`), Efficast ("Northstar Packaging Plant, Line 4, PO-2841"). For Rokt: pick one shopper + one merchant + one checkout session and follow the offer end-to-end.
- **Emotional/edge fixtures that surface the hard cases.** 100 Miles "quiet list" user; ShelfTrace perishable-deadline timeouts; Dreamship six failure modes. Seed the *interesting* states, not filler.
- **A documented `HANDOFF.md` / verify path.** NexusWatch and ShelfTrace both ship the exact reproducible demo sequence — do this for the Rokt build.

---

## E. DO NOT copy

**Old branding / product identity (must be fully re-themed for Rokt):**
- Any prior product names and visual identity: **AirLock/Dreamship, Efficast/"Verified Recovery Agent"/Northstar, FanFlow, NexusWatch, ShelfTrace, Get Towed, 100 Miles of Summer, Episode Companion**. Reuse the *engineering structure*, never the theme, copy, logos, or seed narrative characters (Maria, Sara, s.vega, Northstar, "quiet list").
- The heavy 3D marketing surfaces: Dreamship `experience/` (Three.js/GSAP/Lenis) and ShelfTrace `/vision/*` — presentation, not reusable logic; rebuild fresh if a marketing page is needed.

**Generic / cloneable / low-signal (adds no proof-of-work value):**
- Generic CRUD dashboards with no domain logic — Get Towed is essentially this; skip it except for the Flask-Admin declarative back-office idea.
- Plain `BrowserRouter`/NavBar scaffolds, boilerplate CRA test files, and vanilla list/detail pages.
- Brittle `if/elif` keyword classifiers (Episode Companion `behavior.py`) — use structured intent/rules instead.
- Duplicated `Premium*` vs plain component pairs (NexusWatch) — dead-code smell.

**Insecure / misleading patterns (never ship):**
- **The "Holographic Database" mock adapter** (100 Miles `src/lib/db.ts`) that silently serves fabricated data and no-ops writes in production. This is the single most dangerous anti-pattern found — it makes a demo *look* real while doing nothing. If a mock mode is needed, it must be explicit, labeled in the UI, and never the production default.
- **Client-trusted money** — Get Towed `/payment` accepting a client-supplied `amount`. Always compute/verify amounts server-side. Critical for a Rokt (revenue) domain.
- **No authorization** — Get Towed mints JWTs but guards nothing; Flask-Admin mounted open. NexusWatch permissive RLS (`anon ... with check (true)`) and hardcoded `actor`/`companyId`. Dreamship throttle-only, no auth. Efficast/ShelfTrace header-based demo identity (`X-VRA-User`, API-key optional). All are documented demo seams — replace with real auth + per-tenant scoping before anything ships.
- `CORS allow_origins=["*"]` **with** `allow_credentials=True` (Episode Companion) — invalid/insecure combination.
- Hardcoded secrets/creds and dev servers in compose: `DJANGO_SECRET_KEY="dev-insecure-change-me"`, `ALLOWED_HOSTS=*`, `dreamship/dreamship`, `vra/vra`, `"my-secret-antigravity-password"`, `runserver`/`makemigrations` at container start.

**Operational hygiene (do the opposite):**
- Committed `node_modules/`, `.db`/`.db-wal`/`.db-shm` binaries, `chroma_db/`, `.env`, `build.log`, `errors.txt` — all present across repos. Keep the Rokt repo clean.
- Ad-hoc "stack of hand-run `alter table ... add column if not exists` SQL + app-side missing-column fallback" (NexusWatch) — use a real migration tool (Alembic/Prisma) with a linear history instead.
- Dual source-of-truth with a fire-and-forget mirror and no reconciliation (100 Miles SQLite + Prisma/Postgres; Efficast SQLite-vs-pgvector) — pick one system of record.
- Artificial `time.sleep` "pipeline theater" (Dreamship `PREFLIGHT_STAGE_DELAY_SECONDS`).
- Sprawling status/planning markdown churn (`STATUS.md`, `TEST_FAILURES.md`, `PRODUCTION_READY.md`) — keep docs lean.

---

## F. Recommended starter stack for the Rokt build (synthesized)

- **Backend:** FastAPI + SQLAlchemy 2.0 (typed) + Alembic + Postgres, with the ShelfTrace/Efficast spine — transactional outbox worker (backoff + jitter + DLQ), hash-chained append-only audit, idempotency keys at the boundary, a pure deterministic decision/reconciliation engine, and hexagonal boundaries enforced by an `ast`-based fitness test.
- **Frontend:** Next.js App Router + TypeScript + Tailwind (fresh Rokt token set) with Dreamship/Efficast's typed API client + `ApiError`, ShelfTrace's epoch-stamped `useLive` hook, Efficast's designed-state kit, and fanflow's "Why this offer?" explainability panel fed by a transparent score breakdown.
- **The narrative:** one shopper + one merchant + one checkout session; deterministic offer ranking with an LLM-generated (guardrailed, `mentionsWrongOffer`-style) rationale; idempotent conversion recording; a tamper-evident audit trail; a QA-CSV/scenario corpus that doubles as the test suite; and a `verify.sh`-style one-command end-to-end proof plus a documented `HANDOFF.md`.

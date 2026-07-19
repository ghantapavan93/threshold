/* ────────────────────────────────────────────────────────────────────────────
   Moment Forge — Volume II · The System. The honest node/edge ledger.
   Nothing renders that isn't here. SHIPPED = code exists in the repo (file named).
   DESIGNED = docs/FUTURE_VISION.md milestone, drawn dashed, never "running".
   Every latency is a BUDGET/goal, never a measured number. Grounded in
   docs/MOMENT_FORGE_SYSTEM_ARCHITECTURE.md §0 and the real backend files.
   ──────────────────────────────────────────────────────────────────────────── */

export type Status = "SHIPPED" | "DESIGNED" | "MODELED";

export type ArchNode = {
  id: string;
  name: string;
  status: Status;
  milestone?: "A" | "B" | "C" | "D" | "E";
  anchor?: string; // real file
  role: string;
  invariants?: string[];
  tables?: string[];
  tone: "teal" | "offer-blue" | "amber" | "muted" | "crimson";
  // position on the level's SVG (0..100 %)
  x: number;
  y: number;
  w?: number;
};

export type ArchEdge = {
  from: string;
  to: string;
  protocol: string;
  detail: string;
  status?: Status;
  thick?: boolean;
};

export const TONE: Record<string, string> = {
  teal: "var(--c-teal)",
  "offer-blue": "var(--c-offer-blue)",
  amber: "var(--c-amber)",
  muted: "var(--c-muted)",
  crimson: "var(--c-crimson)",
};

// ── L1 · System Context ──────────────────────────────────────────────────────
export const L1_NODES: ArchNode[] = [
  { id: "checkout", name: "Merchant checkout", status: "MODELED", role: "The merchant's transaction — Threshold has no synchronous dependency on it.", tone: "offer-blue", x: 14, y: 50, w: 22 },
  { id: "brain", name: "Rokt Brain decisioning", status: "MODELED", anchor: "domain/policy.py", role: "Selects offers in the live path. Threshold never selects — it sits beside the core, offline / pre-release.", tone: "muted", x: 38, y: 24, w: 24 },
  { id: "threshold", name: "Threshold — Policy Change Safety Gate", status: "SHIPPED", role: "Proves a policy change fails closed, preserves checkout, and is eligible only for a holdout. The hero.", tone: "teal", x: 50, y: 58, w: 30 },
  { id: "operator", name: "Operator", status: "SHIPPED", role: "Proposes a change; compiles/simulates it against the live backend.", tone: "offer-blue", x: 84, y: 26, w: 18 },
  { id: "queue", name: "Approval queue / holdout", status: "DESIGNED", milestone: "C", anchor: "FUTURE_VISION Milestone C", role: "A positive verdict enters the manual approval queue + controlled holdout.", tone: "muted", x: 86, y: 74, w: 20 },
];

export const L1_EDGES: ArchEdge[] = [
  { from: "checkout", to: "threshold", protocol: "no sync dependency", detail: "Offer-side failures resolve to No Offer Rendered — checkout is never blocked (Invariant #1).", thick: false },
  { from: "brain", to: "threshold", protocol: "models", detail: "Threshold models the decisioning it protects; it does not run the Brain." },
  { from: "operator", to: "threshold", protocol: "proposes", detail: "compile / simulate against the live backend." },
  { from: "threshold", to: "queue", protocol: "eligibility", detail: "A positive verdict = eligibility for a controlled holdout, never “safe to launch”.", status: "DESIGNED" },
];

// ── L2 · Containers ──────────────────────────────────────────────────────────
export const L2_NODES: ArchNode[] = [
  { id: "frontend", name: "Next.js frontend", status: "SHIPPED", anchor: "frontend/lib/api.ts · hooks.ts", role: "Typed Zod boundary, TanStack Query, offline fallback.", tone: "offer-blue", x: 12, y: 30, w: 20 },
  { id: "fastapi", name: "FastAPI app", status: "SHIPPED", anchor: "backend/app/main.py", role: "Lifespan, router registration, request-id middleware, error-envelope, CORS. The L3 zoom target.", tone: "teal", x: 45, y: 30, w: 22 },
  { id: "core", name: "Pure domain core", status: "SHIPPED", anchor: "backend/app/domain/*", role: "evaluator · diff · constraints · verdict · ope · replay · contexts · failclosed · sessions · audit. No I/O.", tone: "teal", x: 45, y: 66, w: 22 },
  { id: "postgres", name: "Postgres", status: "SHIPPED", anchor: "backend/app/db.py · models.py", role: "SQLite for the zero-config local loop.", tables: ["policy_versions (immutable)", "replay_jobs (idempotent)", "outbox_events", "conversions (dedup)"], tone: "offer-blue", x: 80, y: 34, w: 22 },
  { id: "worker", name: "Outbox worker", status: "SHIPPED", anchor: "main.py _outbox_loop · outbox.drain_once", role: "asyncio background task via asyncio.to_thread; interval OUTBOX_INTERVAL_S=3.", tone: "teal", x: 80, y: 68, w: 22 },
  { id: "otel", name: "OTel SDK", status: "SHIPPED", anchor: "backend/app/observability.py", role: "TracerProvider + MeterProvider; ConsoleSpanExporter gated by OTEL_CONSOLE=1; no-op if packages absent.", tone: "muted", x: 14, y: 68, w: 20 },
  { id: "collector", name: "OTel Collector → backend", status: "DESIGNED", milestone: "D", anchor: "FUTURE_VISION", role: "The export hop. Today only the SDK + gated console/no-op ships.", tone: "muted", x: 14, y: 90, w: 22 },
];

export const L2_EDGES: ArchEdge[] = [
  { from: "frontend", to: "fastapi", protocol: "HTTP · JSON · Zod-validated", detail: "NEXT_PUBLIC_API_BASE default http://localhost:8000; X-Threshold-User header; X-Request-ID echoed back (main.py middleware)." },
  { from: "fastapi", to: "core", protocol: "in-process call", detail: "No serialization. The fitness test guarantees this stays a pure call, not a network hop.", thick: true },
  { from: "fastapi", to: "postgres", protocol: "SQLAlchemy 2.0 / DB-API", detail: "db.py engine; Alembic is the migration source of truth." },
  { from: "fastapi", to: "postgres", protocol: "single txn", detail: "Replay writes the job row + outbox insert in the SAME transaction — commit iff side-effects.", thick: true },
  { from: "worker", to: "postgres", protocol: "SKIP-LOCKED (Postgres only)", detail: "SELECT … WHERE status=PENDING AND next_attempt_at≤now LIMIT 50 FOR UPDATE SKIP LOCKED. On SQLite it degrades to a plain LIMIT 50 (no concurrent drain)." },
  { from: "fastapi", to: "otel", protocol: "in-process spans/metrics", detail: "Console exporter gated by OTEL_CONSOLE=1." },
  { from: "otel", to: "collector", protocol: "OTLP", detail: "DESIGNED — the collector hop is not wired; SDK ships solid, this hop is dashed.", status: "DESIGNED" },
];

// ── L3 · Components (inside the FastAPI app), split by the determinism boundary ─
export const L3_SHELL: ArchNode[] = [
  { id: "routers", name: "Routers ×8", status: "SHIPPED", anchor: "backend/app/routers/*", role: "health · policies · replay · conversions · cancellations · audit · scenarios · momentforge.", tone: "offer-blue", x: 20, y: 20, w: 26 },
  { id: "mf-adapters", name: "Moment Forge adapters", status: "SHIPPED", anchor: "routers/momentforge.py", role: "POST /semantic-compile · /simulations — read-only, non-persisting.", tone: "offer-blue", x: 20, y: 44, w: 26 },
  { id: "outbox", name: "Transactional outbox", status: "SHIPPED", anchor: "backend/app/outbox.py", role: "enqueue (same txn) + drain with capped backoff+jitter, dead-letter after MAX_ATTEMPTS=5.", tone: "offer-blue", x: 20, y: 68, w: 26 },
  { id: "persistence", name: "Persistence adapters", status: "SHIPPED", anchor: "common.load_policy · models", role: "I/O, clock, RNG live here — everything the core must not touch.", tone: "muted", x: 20, y: 88, w: 26 },
];

export const L3_CORE: ArchNode[] = [
  { id: "evaluator", name: "evaluator.evaluate()", status: "SHIPPED", anchor: "domain/evaluator.py", role: "The total decision function (offer / no_offer). InvalidComparison → no_offer (fails closed).", invariants: ["#3 Deterministic evaluation", "#13 Suppression is a decision"], tone: "teal", x: 74, y: 42, w: 22 },
  { id: "constraints", name: "constraints", status: "SHIPPED", anchor: "domain/constraints.py", role: "The missing-attribute counterfactual is its signature.", invariants: ["#7 Single enforcement point", "#8 Missing-attribute safety"], tone: "teal", x: 74, y: 18, w: 22 },
  { id: "verdict", name: "verdict · ope", status: "SHIPPED", anchor: "domain/verdict.py · ope.py", role: "Deterministic verdict + support-guard that refuses on thin support.", invariants: ["#2 Holdout is the only causal mechanism"], tone: "teal", x: 74, y: 66, w: 22 },
  { id: "failclosed", name: "failclosed.prove", status: "SHIPPED", anchor: "domain/failclosed.py", role: "timeout / invalid_output / stale_identity → no_offer.", invariants: ["#1 Fail-closed"], tone: "crimson", x: 74, y: 88, w: 22 },
];

// ── The determinism boundary — the REAL AST fitness test (test_architecture.py) ─
export const FORBIDDEN_TOPLEVEL = [
  "openai", "anthropic", "cohere", "langchain", "langgraph", "llama_index",
  "httpx", "requests", "urllib", "aiohttp",
  "fastapi", "starlette", "uvicorn",
  "sqlalchemy", "psycopg", "sqlite3",
];
export const FORBIDDEN_RELATIVE = ["db", "models", "routers", "main", "config"];

export const AST_TEST_SNIPPET = `def test_domain_engine_is_pure():
    offenders: dict[str, set[str]] = {}
    for f in sorted(DOMAIN.glob("*.py")):
        top, rel = _imports(f)          # AST-parsed imports of each domain module
        bad = (top & FORBIDDEN_TOPLEVEL) | (rel & FORBIDDEN_RELATIVE)
        if bad:
            offenders[f.name] = bad
    assert not offenders, f"domain engine must stay pure (no AI/HTTP/DB/web/persistence): {offenders}"`;

// ── The two live paths ───────────────────────────────────────────────────────
export type Station = { n: string; title: string; caption: string; node?: string; tone: "teal" | "offer-blue" | "amber" | "crimson" | "muted" };

export const PATH_A: Station[] = [
  { n: "1", title: "Frontend", caption: "useSemanticCompile / useSimulation issues an HTTP+JSON request.", node: "frontend", tone: "offer-blue" },
  { n: "2", title: "FastAPI", caption: "Request-id middleware stamps X-Request-ID; routes to the Moment Forge adapter.", node: "fastapi", tone: "teal" },
  { n: "3", title: "read-only load_policy", caption: "The only I/O: a read-only policy load. No row is ever written.", node: "persistence", tone: "muted" },
  { n: "4", title: "Pure core", caption: "build_semantic_delta / run_replay — a pure function, no writes. Budget: policy.latency_budget_ms · 500ms ceiling · Rokt public sub-200ms (all budgets, never measured).", node: "core", tone: "teal" },
  { n: "5", title: "Zod-validated JSON", caption: "The response is validated at the frontend boundary; a mismatch → ApiError{kind:'validation'}.", node: "frontend", tone: "offer-blue" },
];

export const PATH_B: Station[] = [
  { n: "1", title: "POST /replay-jobs", caption: "Authoritative write, carrying an Idempotency-Key.", node: "fastapi", tone: "offer-blue" },
  { n: "2", title: "Idempotency check", caption: "Same key → return the existing job (200), never re-run (Invariant #7).", node: "postgres", tone: "amber" },
  { n: "3", title: "run_replay (pure)", caption: "The deterministic core computes the whole job.", node: "core", tone: "teal" },
  { n: "4", title: "flush → id · enqueue · commit", caption: "job row + outbox events commit atomically in ONE transaction — commit iff side-effects. IntegrityError → rollback → return existing.", node: "postgres", tone: "teal" },
  { n: "5", title: "Outbox worker (every 3s)", caption: "drain_once: SELECT PENDING … LIMIT 50 FOR UPDATE SKIP LOCKED (Postgres).", node: "worker", tone: "teal" },
  { n: "6", title: "PUBLISHED / retry / DEAD_LETTER", caption: "publish → PUBLISHED; else next_attempt_at = now + backoff+jitter; DEAD_LETTER after MAX_ATTEMPTS=5.", node: "worker", tone: "amber" },
  { n: "7", title: "Frontend useOutbox polls", caption: "GET /replay-jobs/{id}/outbox every 2s while any event is PENDING; stops when all drained.", node: "frontend", tone: "offer-blue" },
];

// ── Scaling story ────────────────────────────────────────────────────────────
export const SCALE_SHIPPED: { name: string; anchor: string }[] = [
  { name: "Transactional outbox + worker + capped backoff + jitter + dead-letter", anchor: "outbox.py" },
  { name: "Idempotent replay jobs & conversion dedup", anchor: "replay.py · conversions.py" },
  { name: "Replay-equality / bit-for-bit determinism", anchor: "test_replay_deterministic · TI #3" },
  { name: "N workers via FOR UPDATE SKIP LOCKED (Postgres)", anchor: "outbox.py" },
  { name: "Immutable policy versions · Alembic migrations", anchor: "models.py · migrations/" },
  { name: "HMAC audit spine", anchor: "domain/audit.py" },
];

export const SCALE_DESIGNED: { name: string; milestone: "A" | "B" | "C" | "D" | "E" }[] = [
  { name: "Kafka / Redpanda event-time ingress", milestone: "B" },
  { name: "Read replica for session reads", milestone: "B" },
  { name: "Horizontal worker pool / batched evaluation (Ray batch pool — extrapolation)", milestone: "B" },
  { name: "Feature store / real event-time log adapter", milestone: "A" },
  { name: "Drift sidecar · full OPE (IPS/SNIPS/DR)", milestone: "D" },
  { name: "LLM change-summaries (edge-only, off the hot path)", milestone: "D" },
  { name: "CI/CD deploy-gate + approval-queue integration", milestone: "C" },
  { name: "Consent-aware historical replay", milestone: "E" },
];

export const INVARIANT_RIBBON = [
  "idempotent job",
  "atomic verdict",
  "no partial results",
  "no future-information leakage",
  "deterministic, LLM-free core",
  "checkout preservation 100%",
];

export const ROKT_PUBLIC = [
  { figure: "10B+", label: "transactions annually" },
  { figure: "33,000+", label: "clients" },
  { figure: "sub-200ms", label: "decisioning budget" },
];

// ── Observability plane ──────────────────────────────────────────────────────
export const SPANS: { name: string; depth: number }[] = [
  { name: "momentforge.simulate.run", depth: 0 },
  { name: "replay.load_policies", depth: 1 },
  { name: "replay.run", depth: 1 },
  { name: "momentforge.compile", depth: 0 },
  { name: "momentforge.simulate.resolve", depth: 1 },
];

export const METRICS = {
  counters: ["momentforge_compile_total", "momentforge_simulate_total", "momentforge_inversion_detected_total", "momentforge_validation_error_total"],
  histograms: ["momentforge_compile_duration_ms", "momentforge_simulate_duration_ms", "momentforge_simulate_sessions"],
};

export const SPAN_ATTRS = ["threshold.verdict", "threshold.session_count", "momentforge.inversion_detected", "momentforge.support"];

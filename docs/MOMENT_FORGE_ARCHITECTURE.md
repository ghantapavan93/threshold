# Moment Forge — End-to-End System Architecture (GAP-FREE build spec)

> Scope: the new **Moment Forge** page and its two LIVE features:
> **(A) Semantic Change Compiler** and **(B) Domain Evolution Simulator**.
> Both must execute against the real Threshold backend, with a bundled
> **real-recorded** fallback when the backend is unreachable.
>
> Legend: **[REPO]** = already exists in the repo (file named). **[DESIGNED]** =
> new, proposed here. Every domain function in the decision path is deterministic
> and pure (ADR-002). Nothing below fabricates backend behavior; anything I did
> not execute is flagged **[ASSUMPTION — verify]**.

---

## 0. TL;DR mapping (read this first)

| Moment Forge feature | Powered by (existing) | New surface needed |
|---|---|---|
| **A. Semantic Change Compiler** — static semantic delta + flag the include/exclude inversion | `diff_policies` **[REPO** `diff.py]** incl. `_risk_for_rule_change` → `missing_attribute_flip`; `POST /policy-diff` **[REPO** `policies.py]** | `contexts.py` pure module + `POST …/semantic-compile` **[DESIGNED]** (adds inline-doc input + bounded-context graph). Curated version-vs-version case can call `POST /policy-diff` **[REPO]** unchanged. |
| **B. Domain Evolution Simulator** — edit a rule / mute a context → decision ripple via real event-time replay | `run_replay` **[REPO** `replay.py]**, `evaluate` **[REPO** `evaluator.py]**, `generate_sessions` **[REPO** `sessions.py]**, `evaluate_constraints` incl. `missing_attribute_semantics` counterfactual **[REPO** `constraints.py]**, `decide` **[REPO** `verdict.py]**, `support_guard` **[REPO** `ope.py]**, `failclosed.prove` **[REPO]** | `POST …/simulations` **[DESIGNED]** — ephemeral, non-persisting wrapper over `run_replay` that accepts an **inline / edited** proposed policy or **muted contexts**. Curated version-vs-version case can call `POST /replay-jobs` **[REPO** `replay.py]** unchanged. |

**Why two new endpoints at all.** Both existing write/compute endpoints
(`/policy-diff`, `/replay-jobs`) require `proposed_version` to be a **seeded
`PolicyVersionRow`** (`common.load_policy` **[REPO]** 404s otherwise). Moment
Forge's whole premise is *edit a rule / toggle a context* on the fly, producing a
proposed policy that is **not** in the DB. The new endpoints are **thin HTTP
adapters** that validate an inline `Policy` and call the **existing pure domain
functions verbatim** — zero new decision logic, ADR-002 intact.

---

## 1. What already exists and is reusable

### 1.1 Domain core (pure, deterministic — `backend/app/domain/*`) **[REPO]**

| File | Function | Shape / behavior we reuse |
|---|---|---|
| `evaluator.py` | `evaluate(attrs, policy) -> Decision` | Pure. `Decision{decision:"offer"|"no_offer", matched_rules, failed_rule, fallback_reason}`. Rules ALL-must-pass. The two trap operators: `include_is_not_in` → **MISSING = EXCLUDED**; `exclude_is_in` → **MISSING = INCLUDED**. |
| `diff.py` | `diff_policies(base, proposed) -> {changes[], summary}` | Each change `{path, kind:"added|removed|modified", before, after, risk}`. `_risk_for_rule_change` emits `missing_attribute_flip` when a rule op goes `include_is_not_in → exclude_is_in`. Also `eligibility_widened / eligibility_narrowed / frequency_increase / latency_increase`. **This is Feature A's engine.** |
| `constraints.py` | `evaluate_constraints(base, proposed, sessions, base_dec, prop_dec, diff) -> (results[], violation_ids)` | 10 checks. The star `missing_attribute_semantics` **isolates the inversion by counterfactual**: revert ONLY the flipped op, re-evaluate missing-attribute sessions; a session that was `no_offer→offer` in the proposal but `no_offer` under the reverted op is a proven violation. Returns `ConstraintResult{key,result:PASS|WARN|FAIL,detail,grounding}` + the set of violating `session_id`s. |
| `sessions.py` | `generate_sessions(seed, count) -> [{session_id,event_time,attributes}]` | Seeded → reproducible corpus. ~18% of sessions **omit `customer.cc_bin`** (the real missing attribute). Deterministic `event_time` (no wall-clock). |
| `replay.py` | `run_replay(base, proposed, seed, count, injections, secret) -> job dict` | Orchestrates the whole thing: sessions → evaluate both → diff → constraints → fail-closed proofs → `support_guard` → `decide` → append-only audit. Returns `{base_version, proposed_version, session_count, diff, constraint_results, replay_summary, evaluations, failclosed_proofs, ope_prescreen, verdict, _audit}`. **This is Feature B's engine.** |
| `verdict.py` | `decide(...) -> {value, reasons, holdout_config}` | `value ∈ BLOCKED | INSUFFICIENT_EVIDENCE | ELIGIBLE_FOR_HOLDOUT`. `MIN_SESSIONS=50`. |
| `ope.py` | `support_guard(changed_count, session_count) -> {ess, coverage, support, refuses_estimate, min_ess, note}` | `MIN_ESS=30`. Refuses to estimate on thin support. |
| `failclosed.py` | `prove(kind, attrs, policy) -> {injection, decision, checkout_preserved, offer_state_created, proof_valid}` | Injections: `timeout | invalid_output | stale_identity` → all resolve to `no_offer`. |
| `audit.py` | `AuditTrail` + `verify(records, secret)` | Per-record HMAC-SHA256, tamper-**evident**. |
| `policy.py` | `Policy`, `Rule`, `Operator` pydantic models | Boundary validation for any inline document. `model_config={"extra":"ignore"}` (tolerates `_change_notes`). Namespaced attributes (`purchase.*`, `customer.*`) — the basis for the bounded-context graph. |

### 1.2 HTTP surface (`backend/app/routers/*`, base `/api/v1/merchants/{merchant_id}`) **[REPO]**

| Method + path | Body / params | Response | Reuse in Moment Forge |
|---|---|---|---|
| `GET /health` | — | `{status, version}` | Backend-reachability probe → drives online/offline toggle. `useHealth()` **[REPO** `hooks.ts]** already polls 15s. |
| `GET …/policies` | — | `[{policy_version, name, created_at}]` | Populate the base/proposed pickers and the scenario seeds. |
| `GET …/policies/{version}` | — | full `Policy` document | Load `V17` as the editable **starting point** for the Compiler/Simulator editor. |
| `POST …/policy-diff` | `{base_version, proposed_version}` | `{changes[], summary}` | Feature A **curated** (version-vs-version) path — no new endpoint required for that case. |
| `POST …/replay-jobs` (hdr `Idempotency-Key`) | `{base_version, proposed_version, session_seed, session_count, injections[]}` | full `ReplayJob` (201/200) | Feature B **curated** path. **Persists** a `ReplayJobRow` + fans out via outbox. |
| `GET …/replay-jobs/{id}` | — | same `ReplayJob` | Re-hydrate a persisted curated run. |
| `GET …/replay-jobs/{id}/outbox` | — | `[OutboxEvent]` | Existing fan-out viz (not central to Moment Forge). |
| `GET …/replay-jobs/{id}/audit` · `POST …/audit/verify` | — | audit list · `{verified, records, first_tampered_seq}` | Tamper-evidence viz for the **curated** path. |
| `GET …/scenarios` | — | `[{id, base, proposed, title, teaches, expected_verdict, signature}]` | Seed Moment Forge's preset gallery (trap / safe / fatfinger / consent / immutable). |

### 1.3 Frontend layer (`frontend/lib/*`) **[REPO]**

- `api.ts` — typed `api.*` client; `request()` throws `ApiError{kind:"network"|"http"|"validation", isUnreachable}`. `API_BASE`, `MERCHANT_ID="aurora-tickets"`.
- `schemas.ts` — Zod schemas mirroring the contract; every response validated at the boundary. Reused verbatim; extended in §2.3.
- `hooks.ts` — React Query hooks; `retryPolicy` never retries 4xx/validation.
- `utils.ts` — `CHANGE_KIND_COLOR/LABEL`, `VERDICT_COLOR/LABEL`, `CONSTRAINT_LABEL`, `uuid()`.

### 1.4 Seed corpus (`backend/seed/policies/*.json`) **[REPO]**

Merchant `aurora-tickets`, "Post-purchase parking upsell". `V17` (base) → `V18` (the
trap: `age 25→18`, `freq 1→3`, **`r4` op `include_is_not_in → exclude_is_in`**),
plus `V18-safe`, `V18-fatfinger`, `V18-consent`, `V18-immutable`. Attributes seen:
`purchase.seat_type`, `customer.age`, `customer.loyalty_segment`,
`customer.cc_bin`. These four namespaces + policy-level fields are what the
bounded-context graph is derived from.

---

## 2. New API contracts **[DESIGNED]**

Consistent with the repo: base `/api/v1/merchants/{merchant_id}`, JSON in/out,
CORS, `X-Request-ID` echoed, error envelope `{error:{code,message,request_id}}`
(via the existing `main.py` handlers). Both new routes are **read-only**: they
**never** write `PolicyVersionRow`, `ReplayJobRow`, `OutboxEventRow`, or
`ConversionRow`. Deterministic ⇒ safe to re-issue.

### 2.0 Shared new pure module — `backend/app/domain/contexts.py` **[DESIGNED]**

Pure, no I/O, no LLM. Derives a bounded-context (DDD) graph deterministically from
attribute namespaces + policy field groups, and rolls up the diff into per-context
semantic severity.

```python
CONTEXTS = [
  {"id":"purchase",  "label":"Purchase",   "match": lambda a: a.startswith("purchase.")},
  {"id":"customer",  "label":"Customer",   "match": lambda a: a.startswith("customer.")},
  {"id":"offer",     "label":"Offer",      "match": lambda a: a.startswith("offer.")},
  {"id":"delivery",  "label":"Delivery",   "fields": ["latency_budget_ms","fallback_action","frequency_cap"]},
  {"id":"governance","label":"Governance", "fields": ["requires_holdout","disclaimers",
                                                       "objective","country","language","timezone","consent"]},
]

SEVERITY = {  # deterministic map from diff `risk` / change kind
  "missing_attribute_flip": "critical",
  "eligibility_widened":    "warning",
  "eligibility_narrowed":   "info",
  "frequency_increase":     "warning",
  "latency_increase":       "warning",
  None:                     "info",
}

def build_semantic_delta(base: Policy, proposed: Policy) -> dict: ...
# returns {changes, summary, context_map, meaning_changes, missing_attribute_inversion}
```

- `context_map.contexts[]`: `{id, label, rule_ids[], change_count, max_severity, muted:false}`.
- `context_map.edges[]`: fixed DDD relations, e.g. `{from:"customer", to:"offer", relation:"eligibility_gate"}`, `{from:"purchase", to:"offer", relation:"eligibility_gate"}`, `{from:"delivery", to:"offer", relation:"serving_guard"}`, `{from:"governance", to:"*", relation:"policy_gate"}`. Static, deterministic.
- `meaning_changes[]`: one per diff change whose semantics (not just value) change; each carries `{path, risk, context, severity, before_semantics, after_semantics, explanation, grounding}`. For the op flip: `before_semantics:"MISSING → EXCLUDED"`, `after_semantics:"MISSING → INCLUDED"`.
- `missing_attribute_inversion`: `{detected, rule_id, attribute, direction, effect}` or `null`. Detected purely from the `missing_attribute_flip` risk tag (no sessions needed).

> Discipline: the **static** Compiler can only *flag* the inversion (it has no
> sessions). The **blast-radius proof** (how many sessions actually flip) comes
> only from the Simulator's `missing_attribute_semantics` counterfactual **[REPO]**.
> This split is intentional and honest.

### 2.1 `POST …/semantic-compile` — Semantic Change Compiler **[DESIGNED]**

Stateless, synchronous, no sessions, no persistence.

**Request** (exactly one of `proposed_version` | `proposed_document` required):
```json
{
  "base_version": "V17",
  "proposed_version": "V18",
  "proposed_document": { "...full Policy document..." },
  "muted_contexts": []
}
```
- `base_version` (string, required) — loaded read-only via `load_policy` **[REPO]**.
- `proposed_version` — seeded version, OR
- `proposed_document` — inline `Policy`, validated by `Policy.model_validate` **[REPO]** (422 on schema failure).
- `muted_contexts` (string[], optional) — context ids to drop before diffing (mirrors the Simulator toggle so compile+simulate agree).

**Response 200** `SemanticDelta`:
```json
{
  "base_version": "V17",
  "proposed_version": "V18",
  "changes": [
    { "path": "eligibility_rules.r4.op", "kind": "modified",
      "before": "include_is_not_in", "after": "exclude_is_in",
      "risk": "missing_attribute_flip" }
  ],
  "summary": { "added": 0, "removed": 0, "modified": 3 },
  "context_map": {
    "contexts": [
      { "id": "customer", "label": "Customer", "rule_ids": ["r2","r3","r4"],
        "change_count": 2, "max_severity": "critical", "muted": false },
      { "id": "delivery", "label": "Delivery", "rule_ids": [],
        "change_count": 1, "max_severity": "warning", "muted": false }
    ],
    "edges": [ { "from": "customer", "to": "offer", "relation": "eligibility_gate" } ]
  },
  "meaning_changes": [
    { "path": "eligibility_rules.r4.op", "risk": "missing_attribute_flip",
      "context": "customer", "severity": "critical",
      "before_semantics": "MISSING → EXCLUDED", "after_semantics": "MISSING → INCLUDED",
      "explanation": "Every session with no cc_bin flips from excluded to eligible.",
      "grounding": "Rokt Audience targeting: 'Include (is not in)' vs 'Exclude (is in)' differ only on MISSING values." }
  ],
  "missing_attribute_inversion": {
    "detected": true, "rule_id": "r4", "attribute": "customer.cc_bin",
    "direction": "include_is_not_in→exclude_is_in",
    "effect": "missing values silently become eligible"
  }
}
```

**Status codes:** `200` success · `404` base/proposed version not found · `422`
validation (missing body, bad `Policy`, both/neither proposed provided, unknown
`muted_contexts`) · `500` unexpected (fail-closed envelope).
**Idempotency:** pure function of the body ⇒ inherently idempotent; header ignored.

### 2.2 `POST …/simulations` — Domain Evolution Simulator **[DESIGNED]**

Ephemeral wrapper over `run_replay` **[REPO]**. **Does not persist.** Same
computation and output shape as `/replay-jobs` minus a DB `id`, plus the semantic
delta and OPE pre-screen.

**Request:**
```json
{
  "base_version": "V17",
  "proposed": {
    "from_version": "V18",
    "document": null,
    "rule_overrides": [ { "id": "r4", "op": "include_is_not_in" } ],
    "muted_contexts": ["delivery"]
  },
  "session_seed": 42,
  "session_count": 200,
  "injections": ["timeout","invalid_output","stale_identity"]
}
```
Proposed policy resolution order (deterministic, one pass):
1. Start from `proposed.document` if given, else `proposed.from_version` (loaded read-only), else `base_version`.
2. Apply `rule_overrides` (patch matching `rule.id` fields).
3. Drop rules whose attribute falls in any `muted_contexts` (context toggle OFF).
4. `Policy.model_validate` the result (422 on failure).

Bounds reuse the existing `ReplayJobRequest` limits: `session_count ∈ [1,5000]`,
default seed `42`, default injections all three.

**Response 200** (superset of `ReplayJob`, no persisted `id`):
```json
{
  "base_version": "V17", "proposed_version": "V18",
  "session_count": 200,
  "semantic_delta": { "...§2.1 SemanticDelta minus base/proposed echoes..." },
  "diff": { "changes": [ ... ], "summary": { ... } },
  "constraint_results": [ { "key": "missing_attribute_semantics", "result": "FAIL",
      "detail": "...N sessions silently widened", "grounding": "..." } ],
  "replay_summary": { "unchanged": 150, "nothing_to_offer": 11, "offer_to_nothing": 2,
      "constraint_violation": 37, "base_offers": 8, "proposed_offers": 19, "changed": 50 },
  "evaluations": [ { "session_id": "s-000", "event_time": "...", "base": {...}, "proposed": {...},
      "changed": true, "change_kind": "nothing_to_offer",
      "violation": { "key": "missing_attribute_semantics", "attribute": "customer.cc_bin" },
      "attributes_snapshot": { "customer.age": 22, "customer.cc_bin": null } } ],
  "failclosed_proofs": [ { "injection": "timeout", "decision": "no_offer",
      "fallback_reason": "decision_timeout", "checkout_preserved": true,
      "offer_state_created": false, "proof_valid": true } ],
  "ope_prescreen": { "ess": 50, "coverage": 0.25, "support": "SUFFICIENT",
      "refuses_estimate": false, "min_ess": 30, "note": "..." },
  "verdict": { "value": "BLOCKED", "reasons": [ ... ], "holdout_config": null },
  "context_toggles_applied": ["delivery"],
  "audit": [ { "seq": 0, "event_type": "REPLAY_STARTED", "payload": {...}, "content_hmac": "..." } ]
}
```
`_audit` from `run_replay` is surfaced **inline** as `audit` (computed, not stored;
no `/audit/verify` round-trip for ephemeral sims — noted honestly in the UI).

**Status codes:** `200` · `404` unknown `base_version`/`from_version` · `422`
invalid resolved policy, unknown `muted_contexts`, `session_count` out of range ·
`500` fail-closed envelope.
**Idempotency:** deterministic in `(base, resolved proposed, seed, count,
injections)`; no writes ⇒ header optional and ignored for storage.

**ADR-002 compliance:** both endpoints call only the existing pure functions +
`contexts.py`. No LLM, no I/O, no wall-clock in the compute path. The only I/O is
the optional read-only `load_policy` before the pure core runs.

### 2.3 Frontend additions (`frontend/lib/schemas.ts`, `api.ts`, `hooks.ts`) **[DESIGNED]**

- `schemas.ts`: add `SeveritySchema = z.enum(["info","warning","critical"])`, `BoundedContextSchema`, `ContextMapSchema`, `MeaningChangeSchema`, `MissingAttrInversionSchema`, `SemanticDeltaSchema`; `SimulationResultSchema = ReplayJobSchema.omit({id:true, merchant_id:true, status:true, created_at:true}).extend({ semantic_delta, ope_prescreen, context_toggles_applied, audit })`. Extend `DiffRiskSchema` with `"eligibility_narrowed"` (present in `diff.py` but missing from the frozen enum — see §6 risk R2).
- `api.ts`: `api.semanticCompile(merchantId, body, signal)` and `api.simulate(merchantId, body, signal)`.
- `hooks.ts`: `useSemanticCompile()` (mutation) and `useSimulation()` (mutation), same `retryPolicy`.

---

## 3. Data flow, end-to-end (ASCII)

### 3.A Semantic Change Compiler — happy path
```
[Editor UI]  edit rule / pick version / toggle context
    │  POST /api/v1/merchants/aurora-tickets/semantic-compile
    ▼
[FastAPI route: semantic_compile]  (effectful shell)
    │  load_policy(base)                         [REPO common.py]  ← read-only DB
    │  validate proposed_document -> Policy       [REPO policy.py]
    │  apply muted_contexts (drop rules)          [DESIGNED contexts.py]
    ▼
[pure core]
    │  diff_policies(base, proposed)              [REPO diff.py]  → changes[], summary, risk tags
    │  build_semantic_delta(base, proposed)       [DESIGNED contexts.py]
    │     ├─ classify each change → bounded context
    │     ├─ severity rollup per context
    │     └─ detect missing_attribute_inversion from `missing_attribute_flip`
    ▼
  200 SemanticDelta ──► [Compiler viz: context graph + meaning-change cards + inversion banner]
```
Latency target **p99 < 50 ms** (no sessions). Trace span `momentforge.compile`.

### 3.B Domain Evolution Simulator — happy path
```
[Simulator UI]  rule_overrides / muted_contexts / seed / count / injections
    │  POST /api/v1/merchants/aurora-tickets/simulations
    ▼
[FastAPI route: simulate]  (effectful shell)
    │  load_policy(base) [+ from_version]         [REPO common.py]
    │  resolve proposed: document|version → overrides → mute → validate  [DESIGNED]
    ▼
[pure core: run_replay(base, proposed, seed, count, injections, secret)]   [REPO replay.py]
    │  generate_sessions(seed, count)             [REPO sessions.py]   (deterministic, ~18% missing cc_bin)
    │  evaluate(attrs, base) & evaluate(attrs, proposed) per session   [REPO evaluator.py]
    │  diff_policies + evaluate_constraints        [REPO]  ← missing_attribute_semantics COUNTERFACTUAL proof
    │  failclosed.prove(injection…)                [REPO]
    │  support_guard + decide + AuditTrail(HMAC)   [REPO]
    │  build_semantic_delta(base, proposed)        [DESIGNED contexts.py]  (attached, not recomputed in core)
    ▼
  200 SimulationResult ──► [ripple viz: decision-diff timeline, per-context blast radius, verdict]
```
Latency target **p99 < 150 ms @ 200 sessions**, **< 500 ms @ 5000**. Trace spans
`momentforge.simulate.resolve` + `momentforge.simulate.run`.

### 3.C Degraded / offline path (both features) — REAL recorded fallback
```
[useHealth() 15s poll]  or  ApiError.kind === "network"  (isUnreachable)
    │
    ├─ backend reachable ────────► live POST (3.A / 3.B)
    │
    └─ backend UNREACHABLE ──────► load bundled fixture from
         frontend/lib/fixtures/momentforge/{compile,simulate}.<scenario>.json
         (produced by scripts/record_fixtures.py hitting the REAL backend once;
          byte-for-byte engine output — never fabricated)
         │
         ▼  render identical viz + a visible "Offline — showing recorded engine
            output (seed 42, V17→V18)" banner. Editing is disabled offline
            (only recorded scenarios are available); free-form edits require the
            live backend, and the UI says so.
```
Fixtures cover the canonical demo pairs: `V17→V18` (trap, BLOCKED) and
`V17→V18-safe` (ELIGIBLE_FOR_HOLDOUT), at `seed=42, count=200`.

---

## 4. Data structures — on the wire and in the engine

### 4.1 In-engine (Python) — reused **[REPO]**
- `Decision(decision, matched_rules, failed_rule, fallback_reason)` — frozen dataclass.
- `ConstraintResult(key, result, detail)` → `.as_dict()` adds `grounding`.
- `Policy / Rule / FrequencyCap / Offer` pydantic; `Operator` literal (7 ops incl. the 2 trap ops).
- `AuditRecord(seq, event_type, payload, content_hmac)`.

### 4.2 New typed shapes **[DESIGNED]** (mirror in Zod)
```ts
type Severity = "info" | "warning" | "critical";

interface BoundedContext {
  id: "purchase"|"customer"|"offer"|"delivery"|"governance";
  label: string;
  rule_ids: string[];
  change_count: number;
  max_severity: Severity;
  muted: boolean;
}
interface ContextEdge { from: string; to: string; relation: string; }
interface ContextMap { contexts: BoundedContext[]; edges: ContextEdge[]; }

interface MeaningChange {
  path: string; risk: string | null; context: string; severity: Severity;
  before_semantics: string; after_semantics: string;
  explanation: string; grounding: string;
}
interface MissingAttrInversion {
  detected: boolean; rule_id: string; attribute: string;
  direction: string; effect: string;
}
interface SemanticDelta {
  changes: DiffChange[];               // REPO shape (diff.py)
  summary: { added: number; removed: number; modified: number };
  context_map: ContextMap;
  meaning_changes: MeaningChange[];
  missing_attribute_inversion: MissingAttrInversion | null;
}
interface SimulationResult extends Omit<ReplayJob,"id"|"merchant_id"|"status"|"created_at"> {
  semantic_delta: SemanticDelta;
  ope_prescreen: { ess:number; coverage:number; support:"NONE"|"THIN"|"SUFFICIENT";
                   refuses_estimate:boolean; min_ess:number; note:string };
  context_toggles_applied: string[];
  audit: AuditRecord[];                // computed inline, not persisted
}
```

---

## 5. Observability — no gaps (ties to `observability.py` **[REPO]**)

**Tracing (OTel, `get_tracer()` **[REPO]**).** New spans, attributes set like the
existing `replay.run` span:
- `momentforge.compile` → attrs `threshold.base_version`, `threshold.proposed_version`, `momentforge.inversion_detected` (bool), `momentforge.change_count`.
- `momentforge.simulate.resolve` → `momentforge.muted_contexts`, `momentforge.override_count`.
- `momentforge.simulate.run` (wrap the existing `run_replay`) → `threshold.verdict`, `threshold.session_count`, `momentforge.changed_count`, `momentforge.support`.
Degrades to `_NoopTracer` when OTel absent (existing behavior) — no gap if the SDK is missing.

**Structured logging** (existing JSON formatter in `main.py`). One line per request
at INFO: `{route, merchant_id, request_id, base, proposed, muted_contexts, session_count, verdict|inversion_detected, duration_ms}`. WARN on 4xx (validation/404), ERROR on 500 with `request_id`. Never log `attributes_snapshot` values (PII posture, §8) — log counts only.

**Metrics** (counters + histograms; expose via the same OTel provider):
- `momentforge_compile_total{result}` · `momentforge_simulate_total{verdict}`.
- `momentforge_inversion_detected_total` (the signature catch).
- `momentforge_compile_duration_ms` · `momentforge_simulate_duration_ms` (histograms; buckets 10/25/50/100/250/500/1000).
- `momentforge_simulate_sessions` (histogram of `session_count`).
- `momentforge_validation_error_total{reason}`.

**Error surfacing.** All errors flow through the existing `main.py`
`_envelope()` handlers → `{error:{code,message,request_id}}` + `X-Request-ID`
header. Frontend `ApiError` already carries `requestId`, `code`, `status`, `kind`;
`ErrorState` **[REPO]** renders the request id. Offline is a distinct `kind:"network"`
that triggers §3.C, not an error toast.

---

## 6. Failure modes + edge cases (exhaustive) — deterministic, fail-closed

| # | Trigger | Endpoint behavior | UX |
|---|---|---|---|
| F1 | **Backend down / unreachable** | n/a (never reached) | `ApiError.isUnreachable` → §3.C recorded fixtures + offline banner; free-form edit disabled. |
| F2 | **Unknown `base_version` / `from_version`** | `404` envelope (`load_policy` raises) | Inline "version not found" on the picker; no viz render. |
| F3 | **Malformed proposed document** (bad op, missing field, dup rule ids) | `422` (`Policy.model_validate` / `_rule_ids_unique`) | Field-level validation message; **nothing computed** (fail-closed: no partial delta). |
| F4 | **Neither / both** `proposed_version` & `proposed_document` | `422` `validation_error` | Guarded in the editor before submit. |
| F5 | **Empty policy** (`eligibility_rules: []`) | Valid: `evaluate` returns `offer` for all sessions (no gate). Compile shows all rules removed (`eligibility_widened`). Simulator verdict likely `INSUFFICIENT_EVIDENCE`/`BLOCKED` per constraints. | Explicit "no eligibility gate — every session eligible" callout; not an error. |
| F6 | **`session_count` out of range** (`<1` or `>5000`) | `422` (reuses `ge=1, le=5000`) | Slider clamps; message on manual entry. |
| F7 | **Thin support** (`changed_count < 30`) | `support_guard` → `support:"THIN"/"NONE"`, `refuses_estimate:true`; `decide` → `INSUFFICIENT_EVIDENCE` if `<50` sessions or no change | Show "refuses to estimate — run the holdout" (honest, matches `ope.py`/ADR-005). |
| F8 | **Huge diff** (many rules changed) | Bounded by policy size; O(rules·sessions). At 5000 sessions still < 500 ms | Virtualize the meaning-change list; timeline already wraps/scrolls (`PolicyDiffReplay` pattern). |
| F9 | **Mute ALL contexts / all rules** | Valid: proposed has 0 rules → F5 semantics; deterministic | Warn "all contexts muted → unconditional offer"; still renders. |
| F10 | **Unknown `muted_contexts` id** | `422` `validation_error` | Toggle list is a fixed enum in the UI → not reachable normally. |
| F11 | **Concurrent identical requests** | Pure + non-persisting ⇒ identical bytes, no races, no row conflicts (unlike `/replay-jobs` which needs the `IntegrityError` path) | No special handling needed. |
| F12 | **Non-numeric value in `gte/lte`** | `evaluator.evaluate` catches the invalid comparison and **fails closed to `no_offer`** with `fallback_reason="invalid_comparison"` (the E8 fix) — it never raises out of the pure core, on the main eval path or the fail-closed proof path. | Fail-closed: never an offer; the session shows as `no_offer` with the `invalid_comparison` reason, not a 500. |
| F13 | **Injection subset empty** | `failclosed_proofs: []`; `decide` unaffected by proofs when none invalid | Allowed; UI notes no fail-closed proof requested. |
| F14 | **Backend up but returns off-contract JSON** | Frontend Zod `safeParse` fails → `ApiError.kind:"validation"` (not retried) | "Response did not match the API contract" + request id; does **not** silently fall back to fixtures (a contract bug must be visible). |
| F15 | **Compile & simulate disagree** (different muted set) | Prevented: UI sends the **same** `muted_contexts` to both; `build_semantic_delta` is shared | Single source of truth for the toggle state. |

**Fail-closed invariant:** any uncertainty in the decision path resolves to
`no_offer` / `BLOCKED` / a 4xx-5xx envelope — **never** a fabricated offer or a
green verdict. Mirrors `failclosed.py` and `verdict.decide`.

**Flagged repo risks to verify during build:**
- **R1 [ASSUMPTION — verify]** `AuditRecordSchema` (frontend) requires `created_at`, but `audit.AuditTrail.as_list()` **[REPO]** emits only `{seq,event_type,payload,content_hmac}`. The existing `/audit` GET may already fail Zod validation. The new `simulations.audit` should either add `created_at` or the schema should make it optional. Confirm before wiring the ephemeral audit viz.
- **R2 [verify]** `diff.py` can emit `risk:"eligibility_narrowed"`, which is **absent** from the frozen `DiffRiskSchema` enum in `schemas.ts`. Extend the enum (§2.3) or `policy-diff`/`semantic-compile` responses will fail boundary validation on removed-rule/narrowing changes.

---

## 7. Performance — budgets & why they hold

| Path | Complexity | Budget | Why it stays fast / what to cache |
|---|---|---|---|
| `semantic-compile` | `O(R)` rules + `O(C)` changes; no sessions | **p99 < 50 ms** | Pure dict ops; no DB except one indexed `load_policy` (UniqueConstraint on `merchant_id,policy_version`). Cache `GET /policies/{version}` client-side (React Query) so the base doc isn't refetched per keystroke; **debounce the editor 250 ms** before compiling. |
| `simulations` | `O(N·R)` for base+proposed eval + `O(F·N_missing)` for the counterfactual (F = flipped rules) | **p99 < 150 ms @ N=200**, **< 500 ms @ N=5000** | `generate_sessions` is `O(N)` and seed-deterministic → **precompute & memoize the session corpus per (seed,count)** in a process-local LRU (pure, safe). Evaluations are tight loops over ≤ handful of rules. Counterfactual only runs when a `missing_attribute_flip` exists. |
| Offline fixtures | `O(1)` file read | instant | Static JSON in the bundle; no network. |

No thread/lock contention (pure, non-persisting). The heavy persisted
`/replay-jobs` path (DB write + outbox) is **not** on Moment Forge's live path —
another reason the ephemeral `/simulations` endpoint is the right call.

---

## 8. Security / tenant / consent

- **Read-only demo.** Both new endpoints are pure computes with at most a
  read-only `load_policy`. They create **no** rows — no `PolicyVersionRow`,
  `ReplayJobRow`, `OutboxEventRow`, or `ConversionRow`. Editing a policy in Moment
  Forge **never mutates seeded data**; the edited document lives only in the
  request body and the response.
- **Tenant scoping.** `merchant_id` stays in the path (existing convention);
  `load_policy` already filters by `merchant_id` so cross-tenant reads are
  impossible. Inline `proposed_document.merchant_id` is **ignored for scoping** —
  scope is always the path param (prevents body-driven tenant confusion).
- **No PII.** Sessions are synthetic (`generate_sessions`), values are fake BINs
  and ages. `attributes_snapshot` is fine to return but **never logged** (§5).
  `customer.cc_bin` is a 6-digit BIN prefix, not a full PAN — no cardholder data.
- **Consent semantics preserved.** The `consent` constraint **[REPO]** still runs
  in the simulator: a `sensitive` attribute without `consent_required` → `FAIL` →
  `BLOCKED`. Muting a context cannot bypass consent (a muted rule is simply absent;
  it cannot become an ungated sensitive rule).
- **Secrets.** `audit_secret` stays server-side (`settings.audit_secret`); the
  inline `audit` HMACs are returned but the key is not. Ephemeral sims expose no
  `/audit/verify` (nothing persisted to verify) — stated plainly in the UI.
- **Input hardening.** `Policy` pydantic validation is the trust boundary; `extra:"ignore"` drops unknown keys; `session_count` is bounded `[1,5000]`; `muted_contexts` is a fixed enum. CORS unchanged (localhost:3000).

---

## 9. Build checklist (order of operations)

1. **Backend** `contexts.py` **[DESIGNED]** pure module + unit tests (context classification, severity rollup, inversion detection on `V17→V18`).
2. **Backend** `routers/momentforge.py` **[DESIGNED]** with `semantic-compile` + `simulations`; register in `main.py` router loop. Reuse `load_policy`, `diff_policies`, `run_replay`, `Policy`. Add OTel spans + metrics.
3. **Backend** tests: 404/422 matrix (§6), determinism (same body → same bytes), no-write assertion (row counts unchanged after N calls).
4. **Fixtures** `backend/scripts/record_fixtures.py` **[DESIGNED]** → hit the live endpoints for `V17→V18` and `V17→V18-safe`, write `frontend/lib/fixtures/momentforge/*.json` (real bytes).
5. **Frontend** extend `schemas.ts` (§2.3, incl. R2 enum fix), `api.ts`, `hooks.ts`.
6. **Frontend** `app/moment-forge/page.tsx` + components: `ContextGraph`, `MeaningChangeCard`, `InversionBanner` (Compiler); `SimulatorControls`, reuse `PolicyDiffReplay`-style timeline + `ReleaseVerdict` (Simulator); offline banner wired to `isUnreachable`.
7. **Verify** end-to-end against the running backend (trap → BLOCKED with inversion; safe → ELIGIBLE_FOR_HOLDOUT), then pull the cable and confirm the recorded fallback renders identically.
```
```
```

Everything in the decision path is deterministic and pure (ADR-002). The two new
endpoints are thin adapters over existing engine code; they add zero new
correctness logic, only an inline-input surface and a bounded-context view.
```

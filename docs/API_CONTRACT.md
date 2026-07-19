# Threshold API Contract (frozen v1)

Base: `http://localhost:8000`. All app routes under `/api/v1`. JSON in/out. CORS allows `http://localhost:3000`.
Correlation: every response carries `X-Request-ID`. Auth: demo header `X-Threshold-User` (optional; defaults to `demo-operator`). Tenant scoping by `merchant_id` in the path.

## Health
`GET /health` → `{ "status": "ok", "version": "0.1.0" }`

## Policies
`GET /api/v1/merchants/{merchant_id}/policies` → list of `{ policy_version, name, created_at }` (immutable, seeded).
`GET /api/v1/merchants/{merchant_id}/policies/{policy_version}` → full Policy document (see docs/POLICY_SCHEMA.md).

## Policy diff
`POST /api/v1/merchants/{merchant_id}/policy-diff`
body: `{ "base_version": "V17", "proposed_version": "V18" }`
→ `{ "changes": [ { "path": "eligibility_rules.r4.op", "kind": "modified", "before": "include_is_not_in", "after": "exclude_is_in", "risk": "missing_attribute_flip" }, ... ], "summary": { "added": 0, "removed": 0, "modified": 3 } }`
`risk` ∈ {null,"missing_attribute_flip","frequency_increase","eligibility_widened","latency_increase"}.

## Replay job (the core call) — idempotent
`POST /api/v1/merchants/{merchant_id}/replay-jobs`  (header `Idempotency-Key: <uuid>`)
body:
```json
{ "base_version": "V17", "proposed_version": "V18",
  "session_seed": 42, "session_count": 200,
  "injections": ["timeout","invalid_output","stale_identity"] }
```
→ 201 (or 200 if key already used) ReplayJob:
```json
{
  "id": "uuid", "merchant_id": "aurora-tickets", "status": "COMPLETED",
  "base_version": "V17", "proposed_version": "V18",
  "session_count": 200, "created_at": "...",
  "diff": { ...policy-diff object... },
  "constraint_results": [
    { "key": "missing_attribute_semantics", "result": "FAIL",
      "detail": "Rule r4 op changed include_is_not_in -> exclude_is_in; 37 replayed sessions have a missing cc_bin and flip from EXCLUDED to ELIGIBLE.",
      "grounding": "Rokt Audience targeting: 'Include (is not in)' vs 'Exclude (is in)' differ on missing values." },
    { "key": "frequency_cap", "result": "WARN", "detail": "...", "grounding": "..." }, ...
  ],
  "replay_summary": { "unchanged": 150, "nothing_to_offer": 11, "offer_to_nothing": 2,
                      "constraint_violation": 37, "base_offers": 8, "proposed_offers": 19 },
  "evaluations": [
    { "session_id": "s-000", "event_time": "...",
      "base": { "decision": "no_offer", "fallback_reason": null, "matched_rules": ["r1"], "failed_rule": "r2" },
      "proposed": { "decision": "offer", "fallback_reason": null, "matched_rules": ["r1","r2","r3","r4"] },
      "changed": true, "change_kind": "nothing_to_offer",
      "violation": { "key": "missing_attribute_semantics", "attribute": "customer.cc_bin" } | null,
      "attributes_snapshot": { "customer.age": 22, "customer.cc_bin": null, ... } },
    ...
  ],
  "failclosed_proofs": [
    { "injection": "timeout", "decision": "no_offer", "fallback_reason": "decision_timeout",
      "checkout_preserved": true, "offer_state_created": false, "proof_valid": true } , ...
  ],
  "verdict": { "value": "BLOCKED",
    "reasons": ["missing_attribute_semantics FAIL: 37 sessions silently widened"],
    "holdout_config": null | { "control_pct": 5, "primary_metric": "conversion_rate", "min_uplift_pct": 2,
                               "variant_options": ["Display the page without Rokt","Display a Rokt layout to replicate an existing experience"] } }
}
```
`verdict.value` ∈ `BLOCKED | INSUFFICIENT_EVIDENCE | ELIGIBLE_FOR_HOLDOUT`. `change_kind` ∈ `unchanged|nothing_to_offer|offer_to_nothing|constraint_violation`.

`GET /api/v1/merchants/{merchant_id}/replay-jobs/{id}` → same object.

## Conversion integrity (verified fields only — dedup on conversiontype+confirmationref)
`POST /api/v1/merchants/{merchant_id}/conversions` (header `Idempotency-Key` optional)
body: `{ "conversiontype": "Purchase", "confirmationref": "AUR-10231", "amount": 149.99, "currency": "USD" }`
→ `{ "status": "processed" | "deduplicated", "conversion_id": "uuid", "dedup_key": "Purchase:AUR-10231" }`

## Cancellation (verified: /v1/confirmation/cancel + itemReservationId — modeled, no refund/settlement)
`POST /api/v1/merchants/{merchant_id}/cancellations`
body: `{ "itemReservationId": "res-8842" }`
→ `{ "itemReservationId": "res-8842", "state_transition": ["reserved","confirmed","canceled"], "final_state": "canceled", "reversible": false }`

## Audit (append-only, tamper-EVIDENT via per-record HMAC — not a chain, not tamper-proof)
`GET /api/v1/merchants/{merchant_id}/replay-jobs/{id}/audit` → `[ { seq, event_type, payload, content_hmac, created_at } ]`
`event_type` ∈ `REPLAY_STARTED|DECISION_RECORDED|CONSTRAINTS_EVALUATED|FAILCLOSED_PROVEN|VERDICT_ISSUED`.
`POST /api/v1/merchants/{merchant_id}/replay-jobs/{id}/audit/verify` → `{ "verified": true, "records": 214, "first_tampered_seq": null }`

## Error envelope
`{ "error": { "code": "string", "message": "string", "request_id": "..." } }` with appropriate 4xx/5xx.

# Policy Contract Schema (frozen)

A **Policy** is a versioned, immutable JSON document describing how placement offers are gated for one merchant at the Transaction Moment. Threshold never *selects* offers (that is Rokt Brain's job); it validates that a **change** from one policy version to the next is safe.

## Top-level shape
```jsonc
{
  "policy_version": "V17",            // string, unique per merchant, immutable once created
  "merchant_id": "aurora-tickets",
  "name": "Post-purchase parking upsell",
  "latency_budget_ms": 200,            // decision must resolve within this; grounded in Rokt "sub-200ms" (VERIFIED)
  "fallback_action": "no_offer",       // MUST be "no_offer" (grounded: "wrapped content renders normally", VERIFIED)
  "requires_holdout": true,            // MUST be true (grounded: 5% Page Holdout, VERIFIED)
  "frequency_cap": { "max_impressions": 1, "per_days": 30 },
  "offer": { "id": "parking-pass", "category": "parking" },   // category checked vs brand-safety list
  "eligibility_rules": [ Rule, ... ]   // ordered; ALL must pass for an OFFER; else No Offer Rendered
}
```

## Rule shape
```jsonc
{
  "id": "r3",
  "attribute": "customer.cc_bin",      // dotted path into the session snapshot
  "op": "include_is_not_in",           // see operators below
  "value": ["411111", "511111"],
  "sensitive": false,                  // if true, requires consent_required=true or -> consent FAIL
  "consent_required": false
}
```

## Operators (deterministic; pure function of the session snapshot)
| op | semantics | **behavior when attribute is MISSING** |
|---|---|---|
| `equals` / `not_equals` | scalar compare | missing → rule fails (not eligible) |
| `gte` / `lte` | numeric compare | missing → rule fails |
| `in` | value ∈ list | missing → rule fails |
| **`include_is_not_in`** | **Rokt "Include (is not in)"**: eligible ONLY if attribute present AND value ∉ list | **MISSING → EXCLUDED (rule fails)** |
| **`exclude_is_in`** | **Rokt "Exclude (is in)"**: excluded if present AND value ∈ list; otherwise eligible — **including when the attribute is absent** | **MISSING → INCLUDED (rule passes)** |

> The last two rows are the **verified, documented Rokt trap** (Audience targeting docs, word-for-word): the two operators diverge *only* on missing values. Switching a rule from `include_is_not_in` to `exclude_is_in` silently widens eligibility to every session whose attribute is absent. Threshold's centerpiece is catching exactly this.

## Constraint catalog (each grounded in a VERIFIED fact — see docs/VERIFIED_FACTS.md)
| key | check (V_current → V_proposed) | result rule | grounding |
|---|---|---|---|
| `latency_budget` | proposed `latency_budget_ms` vs current | ≤ current: PASS · >current & ≤500: WARN · >500: FAIL | "sub-200ms"; `fallback-timeout` 5000ms |
| `fallback_explicit` | proposed `fallback_action` == "no_offer" | else FAIL | "wrapped content renders normally" |
| `consent` | any rule with `sensitive:true` && `consent_required:false` | → FAIL | `noFunctional`/`noTargeting` flags; sensitive PII |
| `brand_safety` | offer.category ∈ {gambling,alcohol,tobacco} without age gate | → FAIL | Rokt Ads prohibited categories |
| `frequency_cap` | proposed max_impressions > 2× current | → WARN | frequency management |
| `holdout_required` | proposed `requires_holdout` != true | → FAIL | 5% Page Holdout page |
| **`missing_attribute_semantics`** | a rule's op changed such that MISSING-value behavior flips (esp. `include_is_not_in` → `exclude_is_in`) AND ≥1 replayed session has that attribute absent | → **FAIL** (silent scope expansion) | Include(is not in) vs Exclude(is in) CC BIN docs |

## Verdict rule (deterministic)
- any constraint **FAIL** OR any fail-closed proof invalid → **BLOCKED**
- else any **WARN**, or replayed `session_count` < `min_sessions` (default 50) → **INSUFFICIENT_EVIDENCE**
- else if ≥1 decision changed between versions and all checks pass → **ELIGIBLE_FOR_HOLDOUT**
- else (no decisions changed) → **INSUFFICIENT_EVIDENCE** (nothing to test)

Never emits "safe to launch" / "guaranteed uplift". A positive verdict is *only* eligibility for a controlled online holdout.

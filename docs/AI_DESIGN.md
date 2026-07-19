# AI Design — where AI is used, where it is prohibited

The headline decision: **no AI in the critical path.** This is not an omission; it is the design. (ADR-002.)

## Why deterministic beats an LLM here
The core job is structured: evaluate ordered eligibility rules over a session snapshot, check hard constraints, prove a fail-closed outcome, emit a verdict. For that shape, a deterministic engine is **faster, reproducible, auditable, and free** — and an LLM would be slower, non-deterministic, costly, and unauditable. Report `research/rokt/09_AI_AND_DECISION_SCIENCE.md` reached the same conclusion: for real-time offer/eligibility decisions, tabular/deterministic logic beats LLMs, which are "decorative and actively harmful" in the hot path.

## Prohibited — AI must NEVER touch these
| Path | Why deterministic is the correct answer |
|---|---|
| Rule evaluation / eligibility | must be reproducible + explainable per decision |
| Constraint checks (consent, brand-safety, frequency, missing-attribute) | policy correctness; a hallucination here is a safety failure |
| Fail-closed handling | the checkout-preservation guarantee cannot depend on a probabilistic system |
| Verdict | a release gate must be defensible line-by-line |
| Audit truth | the tamper-evident record must be exact |
| Idempotency / dedup | financial-state correctness |

The product is **fully useful with every LLM disabled.**

## Permitted — periphery only (deferred, off the hot path)
| Use | Contract |
|---|---|
| Plain-language change summary in the audit/changelog | advisory only; grounded on the deterministic diff; degrades to nothing if unavailable; never gates anything |
| Unstructured metadata enrichment (future) | structured-output only, feeding the *deterministic* checks, human-reviewed |
| Internal knowledge retrieval (future) | RAG over Rokt public docs for operator help; never in a decision |

## Decision-science considered and deferred (honest)
From report `09`, these are high-value but intentionally **not** in the MVP:
- **Off-policy evaluation (IPS/SNIPS/Doubly-Robust):** needs logged action propensities (no public evidence Rokt exposes them) and must never replace the mandatory holdout. Interface designed; implementation deferred (ADR-005).
- **Contextual bandits / uplift / calibration:** belong to *offer selection* (Rokt Brain's job), not a change-safety gate. Out of scope by boundary (ADR-001).
- **Drift monitoring:** a real production add at the input-distribution layer (FUTURE_VISION Milestone D).

## The one AI-adjacent thing we DO ship
The missing-attribute trap is caught by a **counterfactual** (revert just the flipped operator; see if the proposed OFFER disappears) — causal-style reasoning, implemented deterministically. It demonstrates decision-science literacy without putting a model in the path. `constraints.py`, `test_only_missing_attribute_sessions_flagged`.

## Differentiator
In an AI-first hiring process, *"correctness does not depend on a language model"* is a stronger signal than bolting on an LLM. Threshold shows judgment about **when not to use AI** — which report `09` and the six-AI review both flagged as the mature call.

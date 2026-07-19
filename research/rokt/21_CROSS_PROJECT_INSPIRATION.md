# 21 — Cross-Project Inspiration (what each prior build contributed to Threshold)

Threshold reuses *engineering patterns* from Pavan's prior projects — never their branding, themes, or seed characters (per the repo-audit's DO-NOT-copy list). This catalogs what each project inspired and where it landed in Threshold.

| Project | Pattern borrowed | Where it lives in Threshold |
|---|---|---|
| **Dreamship** | Immutable audit events; replay; idempotency at the irreversible boundary; failure scenarios | append-only HMAC audit (`audit.py`); deterministic replay (`replay.py`); `Idempotency-Key` on replay jobs; the fail-closed injections |
| **Efficast** | Hash/HMAC audit with a `verify` that localizes tampering; **ast-based architecture fitness tests** ("no machine-control function exists anywhere") | `audit.verify()` returns `first_tampered_seq`; **`tests/test_architecture.py`** enforces the pure, no-AI hot path as code |
| **ShelfTrace** | Execution-gate **plausibility guard** (flags a price that looks like a data-entry error — decimal slip, below-cost); certification-grade verify; the cinematic `/vision` layer + design system | **`plausibility` constraint** (catches fat-finger age/cap/latency errors); the `verify.sh`/`verify.ps1` one-command proof; the frontend cinematic rebuild + `/vision` keynote |
| **fanflow** | Scenario/persona fixtures that double as **tests AND a live debug picker**; "why this decision" explainability | **scenario library** (`routers/scenarios.py` + 5 seed policies + `test_scenarios.py`); the "Why this / grounding" strings on every constraint tile |
| **NexusWatch** | Human-in-the-loop review framing; confidence/status pills | the release verdict as a reviewer-facing gate (BLOCKED/INSUFFICIENT/ELIGIBLE); constraint PASS/WARN/FAIL pills |
| **100 Miles of Summer** | Idempotency, dedup, reconciliation; the lesson "a backend can return success while the user experiences the wrong outcome" | conversion dedup (`conversions.py`); the whole thesis — *fail closed so the customer never gets the wrong outcome* |
| **Episode Companion** | Retrieval with an allow-list guardrail + `INSUFFICIENT` fallback | the `INSUFFICIENT_EVIDENCE` verdict; the "never claim safe-to-launch" discipline |

## What this added in this pass (all test-gated, 33 tests green)
1. **Plausibility guard** (ShelfTrace) — a new deterministic constraint that catches data-entry errors (age gate < 13 or > 100, absurd frequency cap or latency budget) *before* the subtler missing-attribute check. Honest grounding: this one is an **operational guard**, not a Rokt-doc rule (labeled as such in its `grounding`).
2. **Architecture fitness test** (Efficast) — `tests/test_architecture.py` ast-parses `app/domain/*` and fails the build if the engine ever imports an LLM/HTTP/DB/web module or the app's persistence/routing layers. The "no AI in the hot path" invariant is now enforced by CI, not just documented.
3. **Scenario library** (fanflow) — `GET /scenarios` + four new proposed policies, each BLOCKING for a **distinct** reason: the missing-attribute trap, a fat-finger age gate (plausibility), a consent gap (sensitive attribute un-gated), and an immutable-field edit (country change). This makes the constraint catalog's breadth demonstrable in one click and gives the cinematic UI a richer picker than just V18 / V18-safe.

## The discipline (unchanged)
Reuse the *structure*, never the theme. No AirLock/ShelfTrace/FanFlow/NexusWatch branding, no old seed characters, no copied 3D marketing surfaces. Every borrowed pattern is re-grounded in Rokt's verified public facts or labeled honestly as an operational guard.

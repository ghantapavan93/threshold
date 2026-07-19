# Threshold — a Policy Change Safety Gate for the Transaction Moment

> Before a placement-policy change reaches a single real customer, **Threshold** proves — with replayable, doc-grounded evidence — that it **fails closed** to *No Offer Rendered*, **preserves the merchant's checkout**, **respects hard constraints** (latency, consent, brand safety, frequency, and the subtle *missing-attribute* semantics), handles **duplicate & cancelled conversions** safely, and is eligible **only** for a controlled online holdout.

Threshold is an independent proof-of-work project built while studying Rokt's **public** product direction. It is **not** a claim about Rokt's internal roadmap, and it does **not** try to replace Rokt Brain, the experimentation platform, or Integration Monitor. It is *serious homework* — a focused demonstration of how one would reason about safety at the Transaction Moment, grounded entirely in Rokt's public documentation.

**No AI in the critical path.** The decision engine is deliberately deterministic. LLMs are excluded from every correctness path. That is a feature.

---

## The 2-minute story (Aurora Tickets — a fictional merchant)

An operator proposes a policy change **V17 → V18** for a post-purchase parking upsell:
- lower the age gate 25 → 18,
- raise the frequency cap 1 → 3,
- and flip one eligibility rule's operator from `include_is_not_in` to `exclude_is_in`.

That last edit *looks cosmetic*. It is not. Per Rokt's **own** Audience-targeting docs, "Include (is not in)" and "Exclude (is in)" behave **differently for a missing value**: the flip silently makes every session with a **missing `cc_bin` eligible**.

Threshold replays 200 event-time sessions through both versions and returns:

```
VERDICT: BLOCKED
  ✕ missing_attribute_semantics — "op change flips missing-cc_bin sessions
     from EXCLUDED to ELIGIBLE: 21 sessions silently widened"
  ⚠ frequency_cap — cap raised 1 → 3
  ✓ latency / fallback / consent / brand-safety / holdout
  ✓ fail-closed proofs valid (timeout, invalid_output, stale_identity → No Offer Rendered; checkout green)
```

Fix the operator flip (**V18-safe**) and re-run:

```
VERDICT: ELIGIBLE_FOR_HOLDOUT   (5% control, verbatim Rokt holdout config)
```

A one-operator edit that silently exposes 21 sessions — **caught before a single customer**, with the exact Rokt doc it violates cited inline.

---

## Architecture

```
 Operator (browser console, Next.js)
     │  proposes V17 → V18
     ▼
 ┌──────────────────────────── Threshold API (FastAPI) ────────────────────────────┐
 │  Policy Diff ──► Policy Diff Replay (deterministic, event-time-bounded)          │
 │      generate seeded sessions ─► evaluate base & proposed (PURE function)        │
 │      ─► constraint validator (incl. missing-attribute counterfactual isolation) │
 │      ─► fail-closed injector (timeout / invalid_output / stale_identity)         │
 │      ─► verdict (BLOCKED | INSUFFICIENT_EVIDENCE | ELIGIBLE_FOR_HOLDOUT)         │
 │      ─► append-only, tamper-evident audit (per-record HMAC)                      │
 │  Conversion dedup (conversiontype+confirmationref)  ·  Cancellation transition   │
 └──────────────────────────────────────────────────────────────────────────────────┘
     │  Postgres (Docker) / SQLite (local)
     ▼
 NO Rokt Brain replacement · NO offer selection · NO settlement math · NO LLM in the hot path
```

The decision engine never *selects* offers (that is Rokt Brain's job). It validates that a **change** between two immutable policy versions is safe. See [docs/PRODUCT_THESIS.md](docs/PRODUCT_THESIS.md) and [docs/POLICY_SCHEMA.md](docs/POLICY_SCHEMA.md).

---

## What is VERIFIED vs. modeled

Every citable fact was checked against primary Rokt docs (`research/rokt/verification/`). Highlights:

| Grounded in a verified fact | Modeled (clearly fictional) |
|---|---|
| `/v1/cart/*` + `/v1/confirmation/cancel` + `itemReservationId` | the "Aurora Tickets" merchant + seeded policies |
| dedup on `conversiontype` + `confirmationref` | synthetic sessions (mechanism, not efficacy) |
| `<rokt-thank-you fallback-timeout>` = 5000ms; "sub-200ms" | the constraint thresholds' exact numbers |
| "Include (is not in)" vs "Exclude (is in)" missing-value semantics | — |
| Page Holdout: 5% control + verbatim variant names | — |
| "show the right content or show nothing"; "minimum reserve quality threshold" | — |

Deliberately **kept out** (hallucinations other tools produced): SDK enums like `TIMEOUT`/`NO_OFFERS`, a `SHOW_NOTHING` code constant, "thousands of signals", per-transaction settlement math. See [docs/LIMITATIONS.md](docs/LIMITATIONS.md).

---

## Run it

**Backend** (Python 3.13):
```bash
cd backend
python -m venv .venv
.venv/Scripts/python -m pip install -r requirements.txt   # Windows; use .venv/bin/pip on *nix
.venv/Scripts/python -m uvicorn app.main:app --port 8000
```

**Frontend** (Node 22):
```bash
cd frontend
npm install
npm run dev        # http://localhost:3000  (expects the API on :8000)
```

**Verify everything** (tests + smokes):
```bash
cd backend && ./verify.sh          # or  .\verify.ps1  on Windows
```

**Docker** (Postgres): `docker compose up` (see [docker-compose.yml](docker-compose.yml)).

---

## Docs
- [PRODUCT_THESIS.md](docs/PRODUCT_THESIS.md) — thesis, IS/IS-NOT, why-not-a-clone
- [WORKFLOW.md](docs/WORKFLOW.md) — **the seam**: where Threshold fits in Rokt's verified approval loop
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) — layered stack, replay lifecycle, sequences, ERD, scale notes
- [FUTURE_VISION.md](docs/FUTURE_VISION.md) — the staged path from prototype to Rokt-scale, grounded in Rokt's direction
- [POLICY_SCHEMA.md](docs/POLICY_SCHEMA.md) · [API_CONTRACT.md](docs/API_CONTRACT.md) · [DESIGN_BRIEF.md](docs/DESIGN_BRIEF.md)
- [TRANSACTION_INVARIANTS.md](docs/TRANSACTION_INVARIANTS.md) · [THREAT_MODEL.md](docs/THREAT_MODEL.md) · [EVALUATION.md](docs/EVALUATION.md)
- [DATA_MODEL.md](docs/DATA_MODEL.md) · [AI_DESIGN.md](docs/AI_DESIGN.md) · [FAILURE_MODES.md](docs/FAILURE_MODES.md) · [SECURITY_PRIVACY.md](docs/SECURITY_PRIVACY.md)
- [LIMITATIONS.md](docs/LIMITATIONS.md) — read this; it is honest about what this is and isn't
- [INTERVIEW_QA.md](docs/INTERVIEW_QA.md) — staff-engineer questions + honest answers
- [OUTREACH.md](docs/OUTREACH.md) · [VIDEO_SCRIPT.md](docs/VIDEO_SCRIPT.md) · [TECHNICAL_WALKTHROUGH.md](docs/TECHNICAL_WALKTHROUGH.md) — the storytelling package (30s / 2min / 10min)
- [ADR/](docs/ADR/) — the load-bearing decisions
- `research/` — the full trail incl. [six-AI synthesis](research/rokt/19_MULTI_AI_SYNTHESIS_AND_FINAL_THESIS.md), [verification](research/rokt/verification/), and the [change-management deep-dive](research/rokt/20_CHANGE_MANAGEMENT_DEEPDIVE.md)

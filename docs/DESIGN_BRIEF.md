# Threshold — Frontend Design Brief (frozen)

**Product identity:** an internal, mission-critical **deployment safety console** — not a marketing site, not a glowing analytics dashboard. High information density, monospace for data/hashes/rules, restrained motion, evidence-first. It should read to a senior engineer, in 10 seconds, as "a serious transaction-safety tool."

**Theme:** dark-first, theme-aware. Palette: base `#0B0F19`, surfaces `#12172090`, borders `#222F48`, text `#E6EAF2`/`#9AA7BF`, accent teal `#22E6C8` (safe/eligible), amber `#F5B84B` (warn/insufficient), crimson `#FF4D6A` (fail/blocked), offer-blue `#5B8CFF`. Fonts: system UI + a monospace stack (ui-monospace, "Cascadia Code", Menlo). Provide a light theme too via `prefers-color-scheme` and a manual toggle.

**Non-negotiables:**
- NO fabricated data. The UI calls the real backend (`docs/API_CONTRACT.md`). If the API is unreachable, show an explicit error state — NEVER invented numbers.
- NO analytics vanity charts. No revenue/uplift lines. This is a *safety* tool.
- Every constraint / label is traceable to a verified Rokt fact — surface the `grounding` string the API returns.
- Terminology: "No Offer Rendered" (never SHOW_NOTHING), "Policy Diff Replay" (never Shadow Replay), "tamper-evident" (never tamper-proof).
- Accessible: semantic HTML, keyboard nav, visible focus rings, `aria-live` on the run log and verdict, color never the sole signal (pair with icon+text). Responsive; desktop-first but no horizontal body scroll; wide tables scroll in their own container.

## The single-page golden path (top to bottom, one scrollable console)
1. **Header** — `THRESHOLD · Policy Change Safety Gate`, merchant `Aurora Tickets`, `V17 → V18` selector, live status chip, current run's audit HMAC (short).
2. **Policy Diff** — two-column, monospace, syntax-highlighted. Changed lines flagged; the `r4` operator change carries a small **"missing-attribute risk"** tag. Toggle: All rules / Modified only.
3. **Constraint Heatmap** — grid of constraint tiles (latency, consent, brand safety, frequency, fallback, holdout, **missing-attribute semantics**) each PASS/WARN/FAIL with the `detail` + `grounding` on hover/expand. The missing-attribute tile is the star — when FAIL, it's the visual focal point.
4. **Policy Diff Replay** — run controls (session seed, count, inject failures). A **decision-diff timeline**: one mark per session, colored by change_kind (unchanged / nothing→offer / offer→nothing / constraint_violation). Click a session → right-side drawer with its event-time attribute snapshot, base vs proposed decision, matched/failed rule, and any violation. The hero is the diff, not a chart. Pause / step controls.
5. **Fail-Closed Proof** — a compact request-pipeline lane (Ingest → Consent → Rule Match → Response). Buttons inject timeout / invalid output / stale identity; the lane visibly drops to a **"No Offer Rendered"** track while a parallel **Checkout timeline (Cart → Payment → Confirmation) stays green/untouched**. Each proof appends an audit line.
6. **Conversion Integrity** — send a duplicate conversion (same `conversiontype`+`confirmationref`): first Processed, second **Deduplicated** (no double obligation). Then a cancellation: `reserved → confirmed → canceled` via `itemReservationId`. Verified fields only; no money/settlement.
7. **Release Verdict** — large card: `BLOCKED` (crimson) / `INSUFFICIENT_EVIDENCE` (amber) / `ELIGIBLE_FOR_HOLDOUT` (teal), with reasons. On eligible, an **Export Holdout Config** button showing the verified 5%-control config (variant names verbatim). Never "safe to launch."
8. **Evidence drawer** — click any decision or audit row → full record: decision id, policy version, inputs snapshot, outcome, fallback reason, constraint results, `content_hmac`. A **Verify integrity** button calls the verify endpoint and shows `verified: true / first_tampered_seq`.

## The signature screenshot
Constraint Heatmap with the **missing-attribute-semantics tile FAILED (crimson)** beside the Policy Diff showing the innocuous-looking `r4` operator flip — and the Fail-Closed lane resolving to "No Offer Rendered" while the Checkout timeline stays green. That one frame tells the whole story: a cosmetic-looking edit, silently dangerous, caught before a single customer.

## Tech
Next.js (App Router) + TypeScript + Tailwind + TanStack Query + Zod (validate API responses) + a tiny typed API client. Restrained Framer Motion for state transitions only. Playwright smoke test for the golden path (1-week).

# Threshold — Policy Change Safety Gate (frontend)

An internal, mission-critical **deployment safety console**. It validates that a
change from one placement policy version to the next is *safe* — before a single
customer is affected. It never selects offers; it gates changes.

This is the frontend only. It calls the real Threshold backend described in
`../docs/API_CONTRACT.md`. There is **no mock data**: if the API is unreachable,
the UI shows an explicit error state and renders nothing fabricated.

## Stack

- Next.js 14 (App Router) + TypeScript (strict)
- Tailwind CSS (dark-first palette, manual light/dark toggle + `prefers-color-scheme`)
- TanStack Query v5 (server state)
- Zod (validates **every** API response at the boundary; TS types are inferred from the schemas)
- Framer Motion (restrained — state transitions only)

## Prerequisites

- Node.js 22+
- npm
- The Threshold backend running on `http://localhost:8000` (CORS must allow `http://localhost:3000`)

## Run

```bash
# from this directory (frontend/)
npm install
npm run dev
```

Then open `http://localhost:3000`. The app expects the backend on `http://localhost:8000`.

### Configuration

Copy `.env.local.example` to `.env.local` to override defaults:

```bash
NEXT_PUBLIC_API_BASE=http://localhost:8000   # backend base URL
NEXT_PUBLIC_THRESHOLD_USER=demo-operator     # sent as X-Threshold-User
```

If `NEXT_PUBLIC_API_BASE` is unset it defaults to `http://localhost:8000`.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Dev server on `:3000` |
| `npm run build` | Production build |
| `npm start` | Serve the production build on `:3000` |
| `npm run typecheck` | `tsc --noEmit` (strict) |
| `npm run lint` | Next.js ESLint |

## The single-page golden path

One scrollable console, top to bottom:

1. **Header** — identity, merchant (Aurora Tickets), `V17 → V18` selector, live status chip, current run's short audit HMAC.
2. **Policy Diff** — two-column monospace diff; the `r4` operator change carries a *missing-attribute risk* tag. All rules / Modified only toggle.
3. **Constraint Heatmap** — PASS/WARN/FAIL tiles with `detail` + `grounding`. The **missing-attribute-semantics** tile is the focal point when it FAILs.
4. **Policy Diff Replay** — run controls (seed / count / injections); a decision-diff timeline (one mark per session, colored by `change_kind`); click a session for the event-time snapshot drawer; play / pause / step.
5. **Fail-Closed Proof** — inject timeout / invalid output / stale identity; the decision lane drops to **No Offer Rendered** while the parallel Checkout timeline stays green.
6. **Conversion Integrity** — duplicate conversion (Processed → Deduplicated); cancellation (`reserved → confirmed → canceled`).
7. **Release Verdict** — `BLOCKED` / `INSUFFICIENT_EVIDENCE` / `ELIGIBLE_FOR_HOLDOUT` with reasons; Export Holdout Config on eligible (verbatim variant names).
8. **Evidence Drawer** — full decision/audit record with `content_hmac`; a Verify integrity button calls the verify endpoint.

## Terminology (enforced)

- **No Offer Rendered** (never "SHOW_NOTHING")
- **Policy Diff Replay** (never "Shadow Replay")
- **tamper-evident** (never "tamper-proof")

Never "safe to launch": a positive verdict is only eligibility for a controlled
online holdout.

## Project layout

```
frontend/
├─ app/
│  ├─ globals.css        # palette tokens + dark/light theming
│  ├─ layout.tsx         # root layout, skip link, providers
│  ├─ page.tsx           # the 8-section console
│  └─ providers.tsx      # React Query + theme context
├─ components/
│  ├─ console-context.tsx    # shared cross-section state
│  ├─ Header.tsx             # section 1
│  ├─ PolicyDiff.tsx         # section 2
│  ├─ ConstraintHeatmap.tsx  # section 3
│  ├─ PolicyDiffReplay.tsx   # section 4
│  ├─ SessionDrawer.tsx      # section 4 detail drawer
│  ├─ FailClosedProof.tsx    # section 5
│  ├─ ConversionIntegrity.tsx# section 6
│  ├─ ReleaseVerdict.tsx     # section 7
│  ├─ EvidenceSection.tsx    # section 8 (audit list)
│  ├─ EvidenceDrawer.tsx     # section 8 (record + verify)
│  └─ ui/                    # hand-built primitives (Button, Card, Chip, Drawer, …)
└─ lib/
   ├─ api.ts            # typed fetch client + ApiError + X-Request-ID
   ├─ schemas.ts        # Zod schemas for every API_CONTRACT response
   ├─ hooks.ts          # TanStack Query hooks
   └─ utils.ts          # color/label maps, formatting helpers
```

## Accessibility

Semantic HTML, keyboard navigation with visible focus rings, `aria-live` on the
run log and verdict, color always paired with icon + text, responsive with no
horizontal body scroll (wide tables scroll in their own container).

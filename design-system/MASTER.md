# Threshold — Design System (MASTER)

Single source of truth for the UI. **Every page and component must use this system — never invent a new visual style per page.** The implementation lives in `frontend/app/globals.css`, `frontend/tailwind.config.ts`, `frontend/app/layout.tsx`, and `frontend/components/visual/*`; this doc is the contract.

> **Authority note.** This authored file is derived from the *implemented, shipped* system and is authoritative. `design-system/threshold/MASTER.md` is a generic auto-suggestion from the `ui-ux-pro-max` tool — kept for reference/inspiration only. We deliberately **do not** adopt its recommendation: it proposes a red/blue "Liquid Glass" style that its own output flags as **"⚠ Text contrast"** and an external Google-Fonts `@import`. Both contradict what we ship — our **teal** semantic accent, our WCAG-AA contrast fix, and **self-hosted** fonts. Contrast and brand win over trend.

## Brand & mood
An internal, mission-critical **transaction-safety control plane** that reads as a premium shipped product — reflecting Rokt's aesthetic (dark premium foundation, bold editorial headlines, confident restraint, teal accent). Not a glowing generic dark dashboard; evidence-first, cinematic but disciplined.

## Color (AA-verified)
| Token | Hex (dark) | Use |
|---|---|---|
| base | `#0B0F19` | app background |
| surface / surface-2 | translucent over base | cards / panels (`.glass`, `.holo-card`) |
| text | `#E6EAF2` | primary text (high contrast) |
| muted | `#9AA7BF` (≈7.9:1 on base) | secondary text — **solid only, never fractional alpha** |
| border | `#222F48` | hairlines |
| **teal** `--c-teal` | `#22E6C8` | SAFE / ELIGIBLE / primary accent |
| **crimson** `--c-crimson` | `#FF4D6A` | BLOCKED / danger / FAIL |
| **amber** `--c-amber` | `#F5B84B` | WARN / INSUFFICIENT / PENDING |
| offer-blue | `#5B8CFF` | offer / neutral-info |

**Semantic rule (never break):** teal = safe/eligible/published · crimson = blocked/fail/dead-letter · amber = warn/insufficient/pending. Status is ALWAYS conveyed by **color + icon/glyph + text**, never color alone.

**Contrast law (the bug we fixed):** no fractional-alpha text utilities (`text-muted/50`, `text-text/90`) — they drop below AA. Use solid tokens. `.gradient-text` sets a **solid high-contrast color first**, applying the clip-gradient only inside `@supports (background-clip:text)` so gradient text can never vanish. Verify AA in light AND dark.

## Typography
- **Display** (`--font-display`): **Space Grotesk**, self-hosted via `next/font` — h1/h2/h3, bold, editorial, tight tracking.
- **Body** (`--font-sans`): **Inter**, self-hosted — body/UI.
- **Mono**: `ui-monospace` stack — data, hashes, rule IDs, ids.
- Scale: `text-display` (hero) → h1 → h2 → body → sm → mono. Consistent rhythm; generous spacing.
- Fonts are bundled into the build (no runtime CDN request; offline-safe).

## Surfaces & components
- `.glass` — frosted panel (default card). `.holo-card` — frosted + 1px gradient edge + hover lift + sheen (interactive/feature cards).
- `Section` primitive — numbered badge + display-font title + refined type scale. Every console section uses it.
- Chips: PASS/WARN/FAIL and status chips carry the semantic color + `glow-teal/glow-crimson/glow-amber`.
- Verdict card = cinematic centerpiece (crimson-glow BLOCKED / teal ELIGIBLE / amber INSUFFICIENT).

## Motion system
- **LivingBackground** (`components/visual/LivingBackground.tsx`) — GPU-light "Transaction Moment" particle-network canvas, fixed `z-0`, opacity ~0.5, ≤72 particles, one rAF loop; pauses on hidden tab; behind all content (never reduces legibility).
- **SmoothScroll** (Lenis) — site-wide smooth scroll.
- **Reveal** / **Parallax** (GSAP ScrollTrigger) — scroll-triggered entrances + depth. Cinematic pages (Vision, Builder) may add pinning, clip-path reveals, line-by-line text reveals, and scrubbed timelines.
- **Reduced-motion law (non-negotiable):** every animation (canvas, Lenis, GSAP, pulses) is gated by `prefers-reduced-motion: reduce` → instant final/static state. A global freeze block enforces it.

## Illustration system
Bundled inline SVG (no external URLs), theme-aware, in `components/visual/illustrations.tsx`:
- `TransactionMomentMotif` — the decision gate (hero).
- `SilentWideningDiagram` — missing-attribute sessions flipping eligible.
- `FailClosedLaneMotif` — the fail-closed → No Offer Rendered path.
- `IntegrityShield` — tamper-evident/audit motif.
Use them to make the story visual in section intros/empty states — not decoration for its own sake.

## Data-integrity law
The console renders **only real API data** — never fabricated numbers. Empty / loading (skeleton) / explicit error states are mandatory; if the backend is unreachable, say so. Narrative pages (Vision, Builder) are clearly non-API content.

## Accessibility law
Semantic landmarks, correct heading order, keyboard nav, visible focus rings, `aria-live` on dynamic status/captions, no horizontal body scroll (wide content scrolls in its own container), responsive down to mobile.

## Do / Don't
- DO reuse `Section`, `.glass`/`.holo-card`, the color tokens, the fonts, `Reveal`/`Parallax`, and the illustrations.
- DON'T introduce new fonts, new accent colors, fractional-alpha text, per-page bespoke styling, external image/font URLs, fabricated data, or ungated animation.

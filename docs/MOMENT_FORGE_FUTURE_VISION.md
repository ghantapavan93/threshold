# Moment Forge — Future Vision ("The Horizon")

> Art-direction + build spec for a distinct, cinematic Future-Vision movement inside Moment Forge.
> It presents the eight future bounded-context **hypotheses** from `research/rokt/28_FUTURE_DOMAIN_EVOLUTION.md` as a
> forward-looking, emotionally-resonant gallery — anchored to the *shipped* engine so the vision reads as a credible
> trajectory, not a mood board.
>
> **Non-negotiable honesty frame.** The site is offline-safe and self-hosted. There is **no external image, video, font,
> or CDN asset anywhere in this design.** Every "cinematic background" below is an **original**, in-browser motif built
> from SVG geometry, CSS gradients, and one GPU-light canvas — described here precisely enough to build from. Every
> future idea is tagged **HYPOTHESIS** and cited to doc 28 (G1–G8). No fabricated metric, no claimed partnership, no
> claimed lift. This document is a design contract, subordinate to `design-system/MASTER.md`.

---

## 0. Recommendation — where it lives (and why not the alternatives)

**Build it as the penultimate movement of `/moment-forge/system` (Volume II · "The System"), replacing and elevating the
existing `sec-future` / Fig. 08 "Future contexts" plate — then landing directly into `sec-evidence` / Fig. 09.**

Concretely: `Fig. 08 — The Horizon`, a **full-bleed cinematic band** that deliberately breaks out of the monograph's
drafting-table grid (`BlueprintSubstrate`) for one act, then hands back to the shipped-evidence plate.

Why here, and not the two alternatives:

| Option | Verdict | Reasoning |
|---|---|---|
| **A section on `/moment-forge/system` (chosen)** | ✅ | The arc *needs* the anchor. Placed one plate before `sec-evidence` (Fig. 09, the working engine), the vision is bracketed by proof on both sides — the shipped domain map before it, the shipped outbox/replay after it. The `MomentNav` Volume II tab, `PlateRail`, `SmoothScroll`, and reduced-motion freeze already exist here — reuse, no new page shell. The break from grid → cosmos *is* the "distinctly more textured" beat the brief asks for; it only reads as a beat because the reader just came through eight grid-bound figures. |
| A section on `/moment-forge` (Vol. I) | ➖ | Vol. I is "The Domain" — the *present* language and context map. Dropping a future band there muddies "what is" vs. "where it goes." The narrative payoff of the horizon depends on having earned it through the system. |
| A standalone companion route (`/moment-forge/horizon`) | ➖ | A separate route floats free of the shipped engine and re-introduces the exact "floaty vision" failure mode `docs/FUTURE_VISION.md` warns against. It also duplicates nav/scroll/rail scaffolding for no gain. Keep it one scroll away from the evidence that grounds it. |

The whole movement is `<section id="sec-future" aria-labelledby="future-h">`, so the existing `PlateRail` entry
(`{ id: "sec-future", label: "Future contexts", fig: "08" }`) still targets it — no rail change required.

---

## 1. The signature backdrop — "The Horizon of the Moment"

The motif: **the Transaction Moment rendered as a celestial horizon.** A dark teal-rimmed disc (a "moon" that is really
*the moment itself*) sits low on a horizon line; consented signals rise toward it as a slow star-drift; an aurora of
teal/offer-blue light banks behind it; and a single scroll-scrubbed **trajectory arc** carries the eye from the moment
we own today up and over toward where it goes next. Everything is generated in the browser.

### 1.1 Composition (back-to-front layer stack)

The backdrop is a `HorizonBackdrop` positioned `absolute inset-0` *inside the Fig. 08 band only* (never `fixed`, never
site-wide — it must not fight `LivingBackground` on other sections). `z-0`, `pointer-events-none`, `aria-hidden`.
Content columns sit at `z-10`.

| # | Layer | Technique (offline-safe) | Parallax rate (scroll-scrub) |
|---|---|---|---|
| L0 | **Void** | CSS `radial-gradient(130% 90% at 50% 118%, #0E1524 0%, #0B0F19 56%, #070A11 100%)` — a faint lift just above the horizon so the disc reads as *rising*. | fixed |
| L1 | **CosmicField** (stars / rising signals) | `<canvas>`, 40–90 capped points, r 0.4–1.4, colors teal `34,230,200` / offer-blue `91,140,255` / soft-white `230,234,242`, alpha 0.30–0.60, slow **upward** drift (`vy ≈ −0.05…−0.12`) — "first-party signals rising toward the moment." One rAF loop. | slowest (0.15×) |
| L2 | **Aurora banks** | 2–3 wide SVG `<path>` ribbons, fill = teal→offer-blue `linearGradient`, `filter:blur(46px)`, opacity 0.10–0.16, seated in the mid-band behind the disc. Undulate via a 34s CSS `transform: translateX/skewY` keyframe. | mid (0.4×) |
| L3 | **Threshold Disc** ("the moon") | SVG `<circle>` ~46vmin: body = `radialGradient` `#0E1B22`→`#0A121A` (barely-there teal-tinted sphere), a **1px teal rim** (`stroke:#22E6C8`, opacity 0.5) + soft outer glow (`filter` feGaussianBlur, teal, opacity 0.18). Over the body: 4–5 concentric **latitude arcs** (thin teal ellipse strokes, opacity 0.06–0.09) → a wireframe-globe texture reading as "the moment has structure." | rises (translateY −0 → −40px) |
| L4 | **Horizon line** | Single hairline at the disc's base: `linear-gradient(90deg, transparent, rgba(34,230,200,0.40) 50%, transparent)`, 1px, plus a 2px teal bloom beneath at opacity 0.12. This is the literal **threshold** the offers cross. | mid (0.4×) |
| L5 | **Film grain** ⭐ | SVG `feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2"` painted on a full-band `<rect>`, `mix-blend-mode:overlay`, opacity **0.045**. Procedural, static, zero bytes of asset. **This is the single thing that makes it read as *film* rather than *dashboard*** — a real cinematic grain with no photo behind it. | fixed |
| L6 | **Legibility scrim** | `linear-gradient(180deg, rgba(11,15,25,0) 0%, rgba(11,15,25,0.55) 58%, rgba(11,15,25,0.86) 100%)` behind the text column. Guarantees text sits on ≥0.86-opacity base. See §1.4. | fixed |

### 1.2 The parallax / scrub motion

- **Scrub, not autoplay.** The disc-rise (L3), aurora drift lock, and the `VisionArc` draw-on are driven by **scroll
  progress through the band** (GSAP `ScrollTrigger` `scrub`), already the house pattern for cinematic pages per
  MASTER §Motion. The only continuously-animating pieces are CosmicField drift (L1) and the aurora keyframe (L2), both
  slow, both capped, both gated.
- **CosmicField** reuses `LivingBackground`'s proven primitives verbatim: DPR-capped canvas, single rAF, no per-frame
  allocation, `visibilitychange` pause, hard particle cap. Only the velocity field changes (upward drift instead of
  drift-and-link).
- **Depth** comes from the three different scrub rates (L1 0.15× / L2–L4 0.4× / content 1×): the stars barely move, the
  moon rises, the arc draws — parallax with three planes is enough to feel filmic without a fourth.

### 1.3 Palette discipline (strictly within MASTER)

Only MASTER tokens: base `#0B0F19`, teal `#22E6C8`, offer-blue `#5B8CFF`, text `#E6EAF2`, muted `#9AA7BF`,
border `#222F48`, amber `#F5B84B`, crimson `#FF4D6A`. **No new hue enters for the cosmos** — the "void" shades
(`#0E1524`, `#070A11`, `#0E1B22`) are darker *values* of base, not new colors. Crimson appears **only** on each
hypothesis's "Honest risk" line — semantically consistent with `LivingBackground`, where crimson is the rare "risk"
node, never decoration.

### 1.4 How it stays AA-legible behind text

- **Text never floats over the disc or aurora directly.** The L6 scrim puts every text column on ≥0.86-opacity base;
  `#E6EAF2` on `#0B0F19` is ~15.8:1, so even at 0.86 scrim it clears AA for body and large text comfortably.
- **Solid tokens only.** Body copy uses `text` / `muted` solid tokens — **never** `text-muted/50` or any fractional-alpha
  text utility (the exact bug MASTER's "Contrast law" fixed). Eyebrows use solid teal on scrimmed base (teal `#22E6C8`
  on `#0B0F19` ≈ 9.6:1).
- **Verify at the worst point.** AA is checked against the *lightest* point the scrim can sit over (the teal rim / aurora
  peak), not just the void. If any headline crosses the disc's bright rim, the scrim opacity floor is raised locally to
  0.9 rather than tinting the text.
- **The disc is kept in the margin,** offset toward one side / lower third, so the primary reading column overlaps only
  its dim body, never its rim.

### 1.5 Reduced-motion — the beautiful static frame (law, not afterthought)

Under `prefers-reduced-motion: reduce` (and the MASTER global freeze block), the band renders **one deliberately-composed
still**:

- CosmicField paints a **single static starfield frame** and stops (identical pattern to `LivingBackground`'s
  `draw(false)`), never rAF.
- Aurora keyframe → frozen at its **designed pose** (banks arranged for balance, not a random frame): CSS
  `animation: none` inside the reduced-motion block.
- Disc sits at its **final risen position**; `VisionArc` renders **fully drawn** (no dash-offset animation, no active-node
  pulse — all nodes at rest state).
- Grain (L5) and scrim (L6) are static anyway — they carry the "film" texture with zero motion, which is *why* the still
  frame still looks cinematic.

The reduced-motion frame is treated as a first-class deliverable: it is the poster of the movie, and it must look
intentional on its own.

---

## 2. The narrative arc — "Where the Transaction Moment goes next"

The eight hypotheses are **not** a grid. They are sequenced as a rising trajectory along the `VisionArc`, in four
movements that map to doc 28's own cross-cutting grouping (§"Cross-cutting pattern"), ordered so the emotional stakes
climb: *the moment learns restraint → reaches the agents → becomes a network → becomes the unit of account.*

| Arc pos | Movement | Hypothesis (doc 28 §) | One-line thesis | Verified signal |
|---|---|---|---|---|
| 1 | **I — The moment learns restraint** | **Attention Yield** (§2) | Sell *the decision not to show* — suppression as yield-managed inventory. | G2 "Suppression becomes as valuable as exposure"; G3 trend 5 (restraint). |
| 2 | I | **Future-Value Decisioning** (§3) | Optimize the moment for predicted *incremental lifetime value*, not the next click. | G2 (Transaction Moment "most predictive signals for future value"); G3 trend 2. |
| 3 | **II — The moment reaches the agents** | **Agent Consideration Surface** (§7) | Win the cart *before* checkout, in the agent's comparison step. | G6 (ACP pivoted to discovery); G1 (Decisioning Layer independent of surface). |
| 4 | II | **Agent Offer Exchange** (§1) | Become the incrementality-proven offer-decision API that shopping agents call. | G6 (UCP checkout live); G1 (Decisioning vs Experience layer). |
| 5 | **III — The moment becomes a network** | **Consented Intent Cooperative** (§4) | A first-party signal co-op with a data-network-effect moat. | G3 trend 2; G5 ("eroding match rates"). |
| 6 | III | **Reward Economy** (§8) | A two-sided in-purchase rewards marketplace; rewards as acquisition currency. | G8 (Gift with Purchase); G3 trend 4 (loyalty → in-purchase). |
| 7 | **IV — The moment becomes the unit of account** | **Unified Moment OS** (§6) | One brain across checkout + rewards + onsite media + post-purchase. | G3 trend 3 (teams converge); G7 (>90% ancillary revenue potential). |
| 8 | IV (climax) | **Assurance & Settlement** (§5) | Turn verified incremental lift into a portable credential and settle contracts on it. | G2 (incrementality by holdout); Incrementality Performance Standard. |

The arc *lands* on Assurance & Settlement because it is the horizon's furthest point — "verified lift becomes the unit of
account" is the most ambitious reframe and the natural summit before the descent back into shipped evidence.

Each movement gets a short **movement header** (mono eyebrow + display line), so the reader feels four beats, not eight
cards. The two genuinely non-obvious bets doc 28 flags (Attention Yield §2, Agent Consideration §7) open movements I and
II respectively, so the surprising ideas land first in their beat.

---

## 3. The gallery — `HypothesisPlate` (per-hypothesis composition)

Each hypothesis is one `HypothesisPlate`, an evolution of the chassis `Plate` grammar (Fig. number, display title,
mono caption) tuned for the future band. Layout: two-column on desktop (`lg:grid-cols-[1.2fr_0.8fr]`), stacked on mobile.

**Left column (the argument):**
- **HYPOTHESIS tag** — a mandatory pill, top-left, `border-amber/40 bg-amber/10 text-amber`, mono, `H-0X · HYPOTHESIS`.
  Amber = "insufficient / pending / not-yet-proven" per MASTER semantics — exactly the right register for an unproven
  bet. It is never omittable; it is the honesty contract made visual.
- **Thesis** — one bold display sentence (`MaskText`, line-by-line reveal on scrub).
- **Revenue mechanism** — labeled block (`Eyebrow`: "How it makes money"), 2–3 sentences.
- **How a holdout proves it** — labeled block (`Eyebrow`: "How a holdout proves it"), framed strictly as an *experiment
  design*, never a number. Copy pattern: "Randomize X into decisioned vs. holdout; measure the incremental Δ — reported
  per {protocol/surface}. No claimed lift; only the holdout delta counts." (Verbatim discipline from doc 28.)

**Right column (the frame):**
- **Verified signal** — a `Marginalia`-style block citing the exact G-ref(s) with the quoted public fact, visually
  separated so the reader always sees *what is Rokt's word vs. what is the candidate's inference* (doc 28's own
  "everything below the Signal line is inference" rule, made spatial).
- **Domain framing chip-row** — the new bounded-context name + 2–3 domain events in mono (`OfferDecisioned`,
  `SuppressionDecided`, …) as small `border-border` chips → "this is DDD, not vibes."
- **Honest risk** — a single line prefixed with a small crimson glyph, `text-text` on a faint `crimson/8` wash. The only
  crimson in the section. It is present on **every** plate; a hypothesis with no stated risk would read as a claim.

**Substrate note.** Where doc 28 says a hypothesis sits on a doc-26 safety substrate (mandate verifier → §1; cross-surface
integrity → §6; reward idempotency → §8; clean-room certificate → §5), the plate shows a small "Substrate:" mono line
linking the money-layer to the safety-floor — this is the connective tissue to §4's shipped bridge.

**`VisionArc` binding.** Each plate has a node on the arc. As the plate enters the viewport, its arc node brightens
(teal fill + ring) and the arc's drawn length advances to it. The arc is the spine; the plates hang off it.

---

## 4. The honest bridge — from "what I built" to "where it goes"

The movement **opens and closes** on shipped reality so the vision is anchored, per `docs/FUTURE_VISION.md`'s core
discipline ("the prototype's job is to make the mechanism undeniable; the vision's job is to show it was built by someone
who thinks past the demo").

**Opening bridge (before hypothesis 1) — "The moment we already hold."**
A short plate, *still on the drafting grid, before the cosmos opens*, restating in one breath what is shipped: the pure
deterministic engine (`app/domain/*`), the tamper-evident audit, the real transactional outbox + draining worker
(`app/outbox.py`, `tests/test_outbox.py`, `GET /replay-jobs/{id}/outbox`), the holdout-only verdict. Copy: *"Everything
past this line is a hypothesis. Everything before it runs."* The horizon backdrop fades in **through** this plate — the
literal visual grammar of leaving solid ground.

**Closing bridge (after hypothesis 8) — "Every horizon attaches at the edges."**
A landing plate that maps each future context back to the **invariant shipped core** and its substrate, reusing
`FUTURE_VISION.md`'s "attaches at the edges, engine never changes" spine:

| Future context (HYPOTHESIS) | Attaches at the edge via | Shipped/verified substrate it stands on |
|---|---|---|
| Agent Offer Exchange (§1) | mandate-conformance boundary, `DecisionReceipt` | doc-26 #2 Mandate Verifier; core stays deterministic, fail-closed |
| Agent Consideration (§7) | truthfulness + envelope gate | same fail-closed contract as shipped verdict |
| Attention Yield (§2) | deterministic, audited suppression *policy* | Threshold's silent-widening scrutiny — a suppression edit is exactly a policy change |
| Future-Value Decisioning (§3) | consent-scoping boundary, fail-closed | `FUTURE_VISION.md` Milestone E consent-aware replay |
| Intent Cooperative (§4) | deterministic consent lineage + revocation purge | replayable "no revoked signal after time T" audit |
| Reward Economy (§8) | exactly-once issuance, reconciled balance | doc-26 #4 Reward Idempotency/Reconciliation |
| Unified Moment OS (§6) | deterministic surface arbitration | doc-26 #6 Cross-Surface integrity |
| Assurance & Settlement (§5) | holdout-derived, tamper-evident certificate | doc-26 #8 clean-room certificate; WHS ledger |

Closing line ties to the North-star: *"The core never learns, never calls an LLM, never joins the serving path. The
money is probabilistic; the trust is deterministic. That is the one invariant the horizon does not move."* Then the band
closes back into the drafting grid → `sec-evidence` (Fig. 09).

This is the emotional payoff: the cosmos is not escapism, it is a **cantilever off shipped code.**

---

## 5. Reusable components to build

All in `frontend/components/moment-forge/` (or `components/visual/` where shared), TypeScript, `"use client"` only where
needed, no external imports.

| Component | Responsibility | Reuses / adapts | Reduced-motion behavior |
|---|---|---|---|
| **`HorizonBackdrop`** | The full-bleed layered backdrop container (L0 void, L2 aurora SVG, L3 disc SVG, L4 horizon, L5 grain, L6 scrim) + slots `CosmicField`. `absolute inset-0`, `aria-hidden`, `pointer-events-none`, band-scoped. | New; SVG defs pattern mirrors `BlueprintSubstrate`. | Static composed frame; aurora `animation:none`; disc at final position. |
| **`CosmicField`** | GPU-light canvas starfield with slow upward drift ("rising signals"). Capped, DPR-limited, single rAF, `visibilitychange` pause. | Fork of `LivingBackground` primitives (seed/resize/loop/stop, static `draw(false)`). | Single static frame, no rAF (identical to `LivingBackground`). |
| **`VisionArc`** | The scroll-scrubbed trajectory arc (SVG parabola) + 8 nodes; advances draw + active-node highlight with band scroll progress. | GSAP `ScrollTrigger scrub` (house pattern); `stroke-dasharray`/`offset`. | Fully drawn arc, all nodes at rest, no scrub, no pulse. |
| **`HypothesisPlate`** | One hypothesis: HYPOTHESIS tag, thesis, revenue mechanism, holdout-proof, verified-signal marginalia, domain-event chips, honest-risk line, substrate link, arc node id. | Extends `Plate` + `Marginalia` + `Eyebrow` + `MaskText`/`ClipReveal`. | `MaskText`/`ClipReveal` already degrade to final state via shared primitives. |
| **`MovementHeader`** | The four movement dividers (mono eyebrow + display line) that chunk 8 plates into 4 beats. | `Eyebrow` + `MaskText`. | Static final text. |
| **`ShippedBridge`** | Opening + closing anchor plates (the "what I built → where it goes" table). | `Plate`, existing `holo-card`. | Static. |

`VisionArc`, `MovementHeader`, `ShippedBridge`, and `HypothesisPlate` data (the 8 entries + G-cites) live in a single
typed `horizon.data.ts` so copy is auditable against doc 28 in one place — no metric appears that isn't a G-cite or an
experiment description.

---

## 6. Interaction, motion, a11y, mobile

**Interaction.**
- Arc nodes and `PlateRail` are the only interactive backdrop elements; keyboard-focusable anchor links jump between
  hypotheses. The backdrop itself is inert (`pointer-events-none`).
- Domain-event terms reuse the existing `DomainTerm` popover (focusable, `aria-describedby`) for definitions — no new
  tooltip system.
- No hover-only information; every popover opens on focus too (`group-focus-within`), matching `DomainTerm`.

**Motion (and its static fallback — cited).**
- Continuous: CosmicField drift + aurora keyframe only, both slow/capped, both **gated** → static frame under
  reduced-motion (§1.5).
- Scrubbed (not autoplay): disc rise, arc draw, `MaskText`/`ClipReveal` entrances — all tied to scroll, all resolve to
  final state instantly under reduced-motion via the shared primitives + MASTER global freeze block.
- Tab hidden → CosmicField `stop()` (visibility pause, inherited).

**Accessibility (MASTER Accessibility law).**
- Heading order: `sec-future` `<h2 id="future-h">The Horizon` → each `MovementHeader` `<h3>` → each `HypothesisPlate`
  `<h4>` (via `Plate as="h4"`). No skipped levels.
- All backdrop layers `aria-hidden`; the arc SVG is decorative (`role="presentation"`) — the *content* (thesis, signal,
  risk) is real DOM text, fully readable by screen readers with the visuals off.
- Visible focus rings (`focus-visible:ring-teal`) on every interactive element; `aria-current` on the active arc node /
  rail item.
- `aria-live="polite"` is **not** used here (no dynamic status) — the movement is static narrative content, correctly
  distinct from the API console per MASTER's data-integrity law.
- Contrast verified in **both** light and dark themes (the band is dark-committed; in light theme the void gradient
  lightens to a dawn-horizon variant using `--c-*` tokens, keeping AA — no hardcoded dark hex that breaks light mode).

**Mobile.**
- Backdrop degrades gracefully: disc scales to ~62vmin and moves to the lower third; aurora blur radius drops (perf);
  CosmicField particle cap scales by viewport area (inherited formula) so phones stay cheap.
- `PlateRail` is already `hidden xl:block` — on mobile, the movement headers carry wayfinding instead.
- Plates stack single-column; the verified-signal marginalia moves **below** the thesis (never hidden), so the
  Rokt-word-vs-inference separation survives the stack.
- No horizontal body scroll; the domain-event chip row scrolls inside its own `overflow-x:auto` container.

---

## 7. Where a tempting choice would violate MASTER — and the compliant alternative

| Tempting (cinematic) choice | Why it violates MASTER | Compliant alternative used here |
|---|---|---|
| A real photo of a moon / nebula / aurora, or an AI-generated space render, as the backdrop. | External/binary image asset; not offline-safe; not self-hosted; risks non-original/AI-photo provenance. | **`HorizonBackdrop`** — original SVG disc + CSS-gradient void + `feTurbulence` grain + canvas starfield. Zero image bytes, provably original. |
| A looping ambient background video for "filmic" feel. | External/binary asset; ungated autoplay motion; bandwidth; violates offline-safe. | Scroll-**scrubbed** disc/arc + one slow gated canvas drift. Motion is user-driven, not autoplay, and freezes under reduced-motion. |
| A CDN font (Orbitron / a "space" display face) to feel futuristic. | External font URL; breaks self-hosted + offline law; MASTER explicitly rejects the Google-Fonts `@import`. | **Space Grotesk** (already self-hosted) at large display sizes + wide mono eyebrows carry the futurist register. No new font. |
| Showing a projected "3.2× incremental lift" or "$XXM new revenue" to make the bet concrete. | Fabricated metric; violates data-integrity law and doc 28's "never a claimed lift." | **Experiment design only** — "how a holdout proves it," reported as a Δ to be measured, plus the amber HYPOTHESIS tag. No number that isn't a cited G-fact. |
| Naming real agent platforms as Rokt "partners" for the Agent contexts. | Fabricated partnership. | Cite only **verified public** facts (G6: UCP live at named merchants; ACP pivot) as *industry context*, never as Rokt's roadmap or a Rokt partnership. |
| White or teal body text sitting directly over the glowing disc/aurora for drama. | Low contrast over a bright, variable backdrop; fails AA; repeats the exact fractional-alpha bug MASTER fixed. | **L6 legibility scrim** (≥0.86 base) + solid `text`/`muted` tokens + disc kept in the margin. AA verified at the worst point. |
| A continuously pulsing/animating arc and twinkling stars, always on, for "life." | Ungated looping motion; violates the reduced-motion law; battery/perf cost. | All continuous motion **gated** + capped + tab-paused; the reduced-motion **static frame** is a designed deliverable (§1.5). |
| A fabricated "roadmap date" per hypothesis (Q3'26, 2027…) to feel like a plan. | Invented commitment; not in doc 28; reads as a claim about Rokt's roadmap. | Sequence by **narrative arc**, not calendar. The only ordering claim is "ambition rising," explicitly framed as the candidate's framing. |

---

## 8. Build order (small, testable)

1. `CosmicField` (fork `LivingBackground`, swap velocity, verify static-frame + visibility pause).
2. `HorizonBackdrop` static layers (void, disc SVG, horizon, grain, scrim) — ship the **reduced-motion frame first**, so
   the poster exists before any motion.
3. `horizon.data.ts` — the 8 hypotheses transcribed from doc 28 with G-cites; review for zero fabricated metrics.
4. `HypothesisPlate` + `MovementHeader` + `ShippedBridge` (content correct before motion).
5. `VisionArc` + GSAP scrub binding (disc rise, arc draw, node highlight).
6. AA + heading-order + keyboard + reduced-motion audit against MASTER Accessibility law, light **and** dark.

---

### Provenance
- Hypotheses, theses, revenue mechanisms, holdout designs, domain events, risks, substrates: `research/rokt/28_FUTURE_DOMAIN_EVOLUTION.md` (G1–G8).
- Shipped-engine bridge + "attaches at the edges" spine + North-star/guardrails: `docs/FUTURE_VISION.md`.
- Cross-project (ShelfTrace `/vision` cinematic precedent; reuse-structure-not-theme discipline): `research/rokt/21_CROSS_PROJECT_INSPIRATION.md`; adjacent surfaces: `research/rokt/22_ADDITIONAL_OPPORTUNITIES.md`.
- Visual contract, tokens, motion/reduced-motion/contrast/data-integrity laws: `design-system/MASTER.md`.
- Reused primitives: `frontend/components/visual/LivingBackground.tsx`, `frontend/components/moment-forge/chassis.tsx`.

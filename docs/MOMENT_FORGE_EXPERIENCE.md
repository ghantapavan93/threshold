# Moment Forge — Experience Specification

**Page:** `/moment` — a Domain-Driven-Design experience for Rokt's **Transaction Moment**.
**Author's intent:** an Eric-Evans-grade *domain monograph* you can walk through — part gallery, part essay, part working instrument. A senior architect should feel they are reading a beautifully-set book about a real system and then discover the figures are *alive*.

This document is a **design + interaction + motion spec only**. It designs the *experience*; the domain *content* (context names, relationship patterns, definitions, laws) is sourced from the parallel DDD document and rendered here as structure. Nothing in this page fabricates numbers — see §0.4.

Every decision below obeys `design-system/MASTER.md`. Where a "jaw-dropping" choice would break the system, I call it out inline as **⚠ Temptation → Discipline**.

---

## 0. Identity, discipline, and how this differs from the other two pages

### 0.1 The three experiential identities (must stay distinct, one family)
| Page | Genre | Reader posture | Signature motion |
|---|---|---|---|
| `/` Console | Instrument / control plane | Operating | Status transitions, verdict reveal |
| `/vision` Keynote | Keynote / manifesto | Being led | Pinned hero, scrubbed roadmap spine |
| `/builder` Builder | Cinematic scenes | Watching | Looping workflow illustrations, seams |
| **`/moment` Moment Forge** | **Architectural monograph / museum plate essay** | **Wandering, studying, discovering** | **Spatial exploration + a scrubbed containment sequence + in-place semantic mutation** |

Moment Forge is the only page whose *primary verb is "explore"* rather than "read" or "watch". It is the only one with a persistent **plate rail** (figure index in the left margin, like a monograph) and the only one whose centerpiece is a **manipulable spatial diagram**, not a linear narrative. Same family: identical tokens, fonts, motion primitives, reduced-motion law, teal accent.

### 0.2 The editorial-spatial system (the thing that makes it feel architectural)
- **Measure:** body essay sits in a narrow **~62ch** column, offset to a **12-column blueprint grid**. Generous outer margins. Text is never full-bleed.
- **Plates:** every interactive figure is a **framed plate** that breaks out wider than the text column (to a 10-col span on desktop), with a hairline `--c-border` frame, a **figure number** (`Fig. 02`), and a museum-style **caption** below in mono. This is the museum grammar: read prose → arrive at a plate → study it → return to prose.
- **Blueprint substrate:** a faint fixed **hairline grid + baseline rhythm** (opacity ≈ 0.05, `--c-border`) behind content — the "drafting table". It is decorative, `aria-hidden`, and pauses like `LivingBackground`. **⚠ Temptation:** a photoreal blueprint/architecture photo. **Discipline:** MASTER forbids external images → the substrate is 2 CSS gradients + one SVG `<pattern>`, offline-safe.
- **Marginalia:** short mono annotations in the left margin (pattern names, "see Fig. 5", a defined term) — the scholarly texture. Solid `--c-muted` only (never fractional alpha — contrast law).
- **Typography ladder:**
  - Plate titles + pull-quotes → **Space Grotesk**, large, tight tracking (editorial confidence).
  - Essay body → **Inter**, relaxed leading (~1.7), for long-form readability.
  - Domain terms, context names, relationship patterns, IDs → **mono**, small-caps-ish `tracking-[0.18em]` uppercase for labels.
  - **Term treatment:** every first-use domain term is a `DomainTerm` — teal underline-offset dotted, focusable, opens a definition popover. This is the "ubiquitous language made tangible" texture running through the whole essay.

### 0.3 Motion philosophy applied (cited)
- **Emil Kowalski — "ease-out for entrances":** everything entering uses `power3.out`/`power4.out` (reuses `Reveal`, `MaskedLines`). Entrances feel responsive; nothing floats in linearly.
- **Emil Kowalski — "animate transform & opacity only, keep it cheap":** all figure motion is `transform`/`opacity`/`clip-path`/SVG attr — no layout animation, no jank (pbakaus: zero CLS).
- **Emil Kowalski — "origin-aware motion":** the Fracture ripples propagate *from the failing node outward*; the Ripple sim animates *from the edited node along real edges*; language mutates *at the boundary line it crosses*. Motion always starts where the cause is.
- **Emil Kowalski — "duration scales with distance/importance":** micro-interactions 120–220ms; plate reveals ~700–950ms; the scrubbed Fracture is tied to scroll distance, not a fixed clock.
- **Emil Kowalski — "reduced motion is a first-class layout, not an afterthought":** every scene ships a *complete, meaningful static final frame* (the illustrations file already does this).
- **pbakaus — impeccable:** focus rings on every interactive node, honest empty/loading/error states, failsafes so a scene can never ship blank, no horizontal body scroll.
- **Taste / Apple — deference & restraint:** the substrate recedes, content leads; teal is used *semantically and sparingly* as a spotlight, not a wash; one idea per plate; whitespace does the framing.

### 0.4 Data-integrity & MASTER compliance (page-wide)
- **No fabricated numbers.** The only live numbers on the page come from the **Semantic Change Compiler** (§4), which renders **real backend output only**, with mandatory loading/empty/error states. Everywhere else is qualitative (patterns, names, laws) or a Rokt-verified public statement clearly attributed. **⚠ Temptation:** label map edges with throughput ("1.2M evt/s"). **Discipline:** invented → forbidden. Edges carry *pattern names* only.
- **No color-alone status.** Relationship-pattern edges are distinguished by **color + line style (dash/solid/double) + glyph + text label** — never hue alone (MASTER semantic rule). Crimson stays reserved for failure/containment (Fracture), teal for the healthy/core, amber for pending/warn, offer-blue for neutral flows.
- **Contrast law:** any text over a glowing or fractured plate sits on a solid scrim (`--c-base` at solid alpha), never over raw glow. Muted text is solid `--c-muted`. Gradient text keeps a solid fallback color first.
- **Self-hosted, offline-safe:** all visuals are inline SVG/canvas built from tokens; no external URL, font, image, or video anywhere.

---

## 1. Reusable component library (build these)

Small set, composed everywhere. Props/states listed; all are `"use client"` where interactive, all reuse the existing `useGsapScene` / `prefersReducedMotion` / `playInView` plumbing.

### `Plate`
The museum frame. Wraps any figure.
- **Props:** `figure` (e.g. `"03"`), `title`, `caption`, `span?: "text" | "wide" | "bleed"` (default `wide`), `children`, `tone?: "neutral" | "teal" | "crimson" | "amber"` (frame accent).
- **Composition:** hairline frame, figure number top-left in mono, title in Space Grotesk, caption in mono below. Reveals via `ClipReveal` (wipe up) + `MaskedLines` title.
- **States:** default / in-view (loop may run) / reduced-motion (static). Never a loading state itself (children own that).
- **a11y:** renders as `<figure>` + `<figcaption>`; title is the section's heading at the correct level.

### `ContextMap` — the living bounded-context map (signature)
- **Props:** `contexts: Context[]` (6–8), `edges: Relationship[]`, `coreId`, `layout: {id → {x,y}}` (precomputed, deterministic).
- **State:** `activeContext`, `activeEdge`, `focusedNodeIndex` (keyboard), `pinnedContext` (click to lock a detail panel).
- **Sub-parts:** `ContextNode`, `RelationshipEdge`, `MapDetailPanel`, `PatternLegend`.
- Detail in §2.

### `RelationshipEdge`
- **Props:** `pattern: "ACL" | "OpenHost" | "Conformist" | "CustomerSupplier" | "Partnership" | "SharedKernel" | "Published" | "SeparateWays"`, `from`, `to`, `direction?`, `state: "idle" | "active" | "dimmed"`.
- Encodes pattern as **stroke style + endpoint glyph + label**, not color alone (table in §2.3).

### `LanguageLens` — ubiquitous-language collision (stop-scrolling piece)
- **Props:** `term` (e.g. `"Order"`), `boundaries: {contextName, definition, shape, connotation}[]`.
- **State:** `position` (0..1 across the boundary), `settledContext`.
- Detail in §3.

### `CompilerConsole` — Semantic Change Compiler
- **Props:** `endpoint`, `examples: Sample[]`.
- **State:** `input`, `status: "idle" | "loading" | "ok" | "empty" | "error"`, `result`.
- Real backend only. Detail in §4.

### `FractureScene` — context fracture cinematic
- **Props:** `contexts`, `epicenterId`, `containmentBoundaryId`.
- **State (scroll-driven):** `phase: "stable" | "stress" | "fracture" | "propagate" | "contain" | "recovered"` derived from scroll progress `0..1`.
- Detail in §5.

### `LawCard`
- **Props:** `index`, `law` (title), `body`, `motif` (which inline SVG glyph), `evidenceHref?`.
- Editorial law card; hover lifts, motif animates once on reveal. Detail in §6.

### `RippleSim` — domain evolution simulator
- **Props:** `contexts`, `edges`, `changeCatalog: Change[]`.
- **State:** `selectedChange`, `impacted: Set<id>`, `waveT`.
- Detail in §7.

### `HypothesisCard`
- **Props:** `title`, `premise`, `contextSketch` (mini SVG), `confidence: "exploratory"` (label, never a fake %).
- Forward-looking gallery card. Detail in §8.

### Support: `DomainTerm`, `Marginalia`, `PatternLegend`, `PlateRail`, `SectionSpine`
- `DomainTerm`: inline focusable term → definition popover (dotted teal underline, `aria-describedby`).
- `PlateRail`: fixed left-margin figure index (desktop) that highlights the current plate as you scroll.
- `SectionSpine`: thin left progress line that *draws* with scroll (reuses the Vision roadmap-spine idea, scrubbed).

All motion via the existing `vision/motion.tsx` + `builder/anim.tsx` primitives; **no new animation engine**.

---

## 2. §Core intro + §The Living Bounded-Context Map (Fig. 01–02)

### 2.1 Core-domain intro (Fig. 01)
**Layout:** an opening spread. Full-width **pull-quote** in Space Grotesk (the Evans-style thesis of the Transaction Moment as the core domain), set against wide margins with a single teal hairline underline. Below, a two-column editorial intro: left = 62ch prose; right margin = `Marginalia` naming the subdomains (Core / Supporting / Generic) as a scholarly key.

**Interaction:** minimal — this is the "cover page." The three subdomain terms are `DomainTerm`s; focusing one dims the others (`opacity`, not display) to spotlight. A small `TransactionMomentMotif` (reused from MASTER illustrations) sits as the frontispiece.

**Motion:** `MaskedLines` line-by-line reveal of the pull-quote (Emil: ease-out `power4.out`, stagger 0.12). The motif assembles via `IllustrationReveal`. Nothing loops here — the cover is calm (taste: restraint sets the register).

**Typography/spatial:** largest type on the page is this quote (editorial hierarchy). One idea, lots of air.

**Empty/loading:** none (static narrative).
**Reduced-motion:** quote fully visible, motif static final frame.
**Mobile:** single column; marginalia collapses into an inline dividered key below the prose.
**a11y:** `<h1>` = page title above; the pull-quote is a `<blockquote>` (not a heading). Subdomain key is a `<dl>`.

### 2.2 The Living Bounded-Context Map — signature interaction (Fig. 02)
**This is the signature interaction of the page.** A spatial, explorable graph of the 6–8 bounded contexts of the Transaction Moment, with edges that *are* the DDD relationship patterns and that **explain themselves** on hover/focus.

**Layout/composition:**
- A **wide `Plate`** (bleed on desktop) rendered as **inline SVG on the blueprint substrate**. Contexts are positioned on a **deterministic, hand-authored layout** (not a random force sim) so it reads like a considered architectural drawing — the **Core context sits center**, upstream/supplier contexts to one side, downstream/customer contexts to the other, generic contexts at the periphery. Position encodes meaning (upstream ↔ downstream = left ↔ right).
- A docked **`MapDetailPanel`** (right on desktop, sheet on mobile) shows the selected context's role, its ubiquitous-language anchor terms, and its relationships.
- A **`PatternLegend`** strip beneath the plate: each pattern with its glyph + line style + one-line definition.

**Interaction model (what the user does → what responds):**
- **Hover/focus a context node** → node lifts (`scale` 1→1.04, teal ring), its edges brighten to `active`, unrelated nodes+edges drop to `dimmed` (opacity 0.4). The `MapDetailPanel` shows that context.
- **Hover/focus an edge** → the edge's **pattern card** surfaces inline near it: name (e.g. "Anticorruption Layer"), the two roles (upstream *supplier* / downstream *customer*), and a one-sentence "why this pattern here." A small directional glyph animates *in the direction of dependency*.
- **Click a node** → `pinnedContext` locks the panel so the reader can study while scrolling; a "clear" affordance unpins. Click empty space or Esc unpins.
- **Keyboard:** nodes are a roving-tabindex list ordered by domain importance (Core first); `←/→` move between related contexts *along edges* (spatial navigation by relationship, which is delightful and teaches the graph), `Enter` pins, `Esc` unpins. Edges are reachable via a "relationships" sub-list in the panel so edge semantics are never mouse-only.

**Motion language:**
- **Entrance:** the map *assembles* — nodes fade+scale in from their centroid (origin-aware, Emil), then edges **draw** via `stroke-dashoffset` from supplier→customer (direction encodes dependency). Uses `IllustrationReveal`'s staggered-children pattern; `power3.out`, stagger ≈ 0.05.
- **Ambient:** a *very* restrained idle — a faint teal pulse travels along the Core's edges (like a heartbeat of the Transaction Moment), one `playInView` loop, paused off-screen and under reduced-motion. **⚠ Temptation:** animate packets flowing on every edge continuously (busy, "slop"). **Discipline:** one pulse, on the core edges only, low opacity — signal not noise (taste).
- **Hover transitions:** 160ms `power2.out` on dim/brighten (interruptible; Emil: fast, reversible micro-interactions).

**Typography/spatial:** context names in mono uppercase inside rounded node cards; the Core node is visually primary (slightly larger, teal edge, a `▚` core glyph). Pattern labels in mono; the panel's prose in Inter.

**Empty/loading:** the map data is static (from the DDD doc), so no async — but the plate has a **skeleton** (node ghosts) for the brief hydration window so it never flashes unstyled.
**Reduced-motion:** **fully-drawn static map** (all edges solid at rest, no pulse, no assemble). Hover/focus still works but transitions are instant. This is the deterministic-layout payoff: the static frame is already a complete, readable architectural drawing.
**Mobile:** the graph reflows to a **vertically stacked, hierarchically-indented map** (Core at top, relationships as labeled connectors) rather than a pannable canvas — no pinch-zoom trap. The detail panel becomes a bottom sheet. Pattern legend becomes an accordion.
**a11y:** the SVG has `role="group"` + `aria-label`; each node is a `<button>` (or focusable `<g>` with role) with an `aria-label` like *"Attribution context, core domain, 3 relationships"*. Edges announce pattern + direction. Heading order: plate title is the section `<h2>`. `aria-live="polite"` on the detail panel so screen readers hear the selected context. **No color-alone:** patterns carry glyph+style+text (§2.3).

### 2.3 Relationship-pattern encoding (color + style + glyph + label — never color alone)
| Pattern | Line style | Endpoint glyph | Accent | One-liner shown on hover |
|---|---|---|---|---|
| Anticorruption Layer (ACL) | solid + a small "wall" tick at the downstream end | `▛` shield-notch | teal | downstream translates the supplier's model, refusing to be corrupted by it |
| Open-Host Service | double line | `⌾` open ring | offer-blue | supplier publishes a stable, general protocol for many consumers |
| Published Language | double line + dot | `≋` | offer-blue | a shared, documented interchange schema |
| Conformist | single arrow, no wall | `→` filled | amber | downstream conforms to the upstream model as-is (no ACL) |
| Customer–Supplier | arrow with `C`/`S` end tags | `⇄` | teal | negotiated priorities; supplier serves the customer's needs |
| Partnership | thick, symmetric | `⧓` | teal | two contexts succeed or fail together; coordinated change |
| Shared Kernel | overlapping seam | `▤` | amber | a small shared model both teams jointly own (high coupling — flagged) |
| Separate Ways | dashed, terminated | `∥` | muted | intentionally no integration |

Amber on Conformist/Shared Kernel is a *considered warning* (coupling/risk), consistent with MASTER's amber=warn semantic — and it teaches the architect where the fragile seams are.

---

## 3. §Ubiquitous-Language Collision — `LanguageLens` (Fig. 03) — the stop-scrolling moment

**The one thing that makes a senior architect stop scrolling.** Every architect has lived the pain: the word "Order" (or "Customer", "Offer", "Conversion") means something *different* on the other side of a boundary, and nobody noticed until it broke. This plate makes that abstraction **physical**: you take one word and drag it across a bounded-context boundary, and its **definition, shape, and connotation visibly mutate at the line.**

**Layout/composition:** a wide `Plate` split by a single vertical **boundary line** (the seam), labeled with the two context names top-left/top-right in mono. A single **term token** (a rounded mono chip, e.g. `Order`) sits on the left. Below the seam, a **definition slab** shows the *current* meaning: a one-line gloss, a tiny SVG "shape of the concept" (e.g. left = a cart glyph; right = a fulfillment record glyph), and a connotation tag (mono).

**Interaction model:**
- The reader **drags the token** (pointer) or uses **`←/→` / a slider** (keyboard) to move it across the seam, `position` 0→1.
- As the token **crosses the seam**, its label **glitch-morphs** for ~180ms and the definition slab **cross-fades** to the other context's meaning; the concept-shape SVG **morphs** (path tween) from cart→record; the connotation tag flips.
- A subtle **"same word, different model"** caption updates via `aria-live`.
- Snapping: the token **settles** to whichever side it's closest to (spring settle) so the state is always unambiguous — you're always definitively "in" one context.
- Optional term switcher (chips: `Order` / `Customer` / `Offer` / `Conversion`) to run the collision on multiple words.

**Motion language:**
- The crossing morph is **origin-at-the-seam** (Emil, origin-aware): the mutation emanates from the boundary line, not the token center — a thin teal light sweeps along the seam at the moment of crossing.
- Label morph = a brief character-scramble/opacity swap (transform+opacity only), 160–200ms `power2.out`. Concept-shape = SVG path `morphSVG`-style tween (or a 2-frame crossfade if we avoid the paid plugin — **discipline: use crossfade + scale, no paid GSAP plugin dependency**).
- Settle = a small `power3.out` spring, ≤ 240ms. **⚠ Temptation:** an elastic/overshoot bounce for "delight." **Discipline:** overshoot on a semantic control feels toy-like (taste); a crisp ease-out reads as precise/engineered — more impressive to this audience.

**Typography/spatial:** the term is the hero — large mono chip. Definitions in Inter; connotation + context names in mono. The seam is a hairline with a `∥`-style boundary glyph, echoing the map's "Separate Ways" language for visual rhyme.

**Empty/loading:** static content; token defaults to left context fully settled.
**Reduced-motion:** **no drag animation** — the plate becomes a **two-column comparison table**: same word, left meaning vs right meaning, with a "crosses the boundary →" caption. The insight survives 100% without motion (this is the reduced-motion-as-first-class rule). A segmented toggle switches context instead of dragging.
**Mobile:** drag works with touch; the two definition slabs stack; the seam becomes horizontal. Big touch target (≥44px) on the token.
**a11y:** the token is a `role="slider"` with `aria-valuetext` = current context name; `aria-live="polite"` announces "Now in {context}: {definition}." Fully keyboard-operable. Focus ring on the token. Heading = section `<h2>`.

---

## 4. §Semantic Change Compiler — `CompilerConsole` (Fig. 04)

A **live console embedded in the essay** — the moment the monograph proves it's connected to a *real system*. It calls the actual backend (the Threshold policy/semantics service) and renders **only real output**.

**Layout/composition:** a `Plate` styled as a **terminal set into the page margin** — mono, `--c-base` deep surface, a `.glass` frame. A prompt line, an input, a "Compile" affordance, and a result region. Framed as "paste a policy/semantic change; the compiler tells you what it means and what it touches." Editorial lead-in prose sets up *why* (semantic diffing) before the console appears — console-in-an-essay.

**Interaction model:**
- Reader edits a sample (or picks from `examples`) → presses **Compile** (or ⌘/Ctrl-Enter).
- Console shows **loading**, then the real result: parsed semantic delta, affected contexts (which cross-links to the map §2), and a verdict chip (reusing MASTER PASS/WARN/FAIL semantics).
- Affected-context names are **live links that highlight those nodes on the map** if the map is on screen (shared state), tying the instrument back to the drawing.

**Motion language:** deliberately *quiet* — a terminal shouldn't bounce. Result lines **type/reveal** with a fast `power2.out` opacity+y stagger (≤ 40ms each), caret blink respects reduced-motion. The verdict chip uses the existing MASTER chip glow. Emil: motion matches the object's character — instruments are precise, not playful.

**Typography/spatial:** all mono. Verdict uses semantic color **+ glyph + text** (PASS ✓ teal / WARN ▲ amber / FAIL ✕ crimson).

**States (mandatory — data-integrity law):**
- **idle:** prompt + example loaded, no fabricated result shown.
- **loading:** skeleton lines + "compiling…" (`aria-busy`).
- **ok:** real parsed output.
- **empty:** valid call, nothing to report → explicit "No semantic change detected" (not a blank).
- **error / backend unreachable:** explicit, honest message ("Compiler service unreachable — this is a live call, not a mock") with retry. **⚠ Temptation:** show a canned pretty result when the backend is down so the demo "always looks good." **Discipline:** MASTER forbids fabricated data → we say it's down. Honesty *is* the flex for this audience.

**Reduced-motion:** results appear instantly, no typing effect, no caret blink.
**Mobile:** console goes full-column; input font ≥16px (no iOS zoom); horizontal overflow of long output scrolls *inside* the console (no body scroll — MASTER).
**a11y:** input is a labeled `<textarea>`; results in an `aria-live="polite"` region; `role="log"` for streamed lines; the whole console is keyboard-complete; visible focus. Errors announced `aria-live="assertive"`.

---

## 5. §Context Fracture — `FractureScene` (Fig. 05) — cinematic scroll sequence

The essay's dramatic center: a **scroll-scrubbed** sequence showing a failure **originate, propagate, and get contained** at a bounded-context boundary — the visceral argument for boundaries + anticorruption layers + fail-closed.

**Layout/composition:** a **pinned** full-viewport plate (desktop). A constellation of context nodes (a focused subset of the map) sits on the substrate. As the reader scrolls, the scene advances through phases, with a single line of Space-Grotesk caption per phase pinned in a corner (masked reveal).

**Scroll-driven phases (progress 0→1, origin-aware):**
1. **stable** — nodes calm, hairline edges, one Core node teal-steady.
2. **stress** — the epicenter node's edges start to vibrate faintly (amber), a hairline crack SVG path begins to draw *from the epicenter*.
3. **fracture** — the crack splits an edge; the epicenter goes crimson; a shock **ripple expands outward** (origin at the failing node — Emil origin-aware).
4. **propagate** — the ripple races toward neighbors along real edges; downstream nodes flash amber (at-risk).
5. **contain** — the **Anticorruption Layer / fail-closed boundary lights teal** and the ripple **stops at the seam** — the containment line holds; beyond it, nodes stay calm. This is the payoff beat.
6. **recovered** — crimson drains to steady; a mono note: "contained at the boundary. No Offer Rendered rather than a wrong one" (ties to the fail-closed law).

**Motion language:**
- All phase progress is **tied to scroll distance** (GSAP `scrub`), not a timer — the reader controls the drama, can scrub back and forth (Emil: give control; scrubbed timelines feel cinematic yet precise). Uses `useGsapScene` + `matchMedia`, desktop-pinned only.
- Crack = `stroke-dashoffset` draw. Ripple = expanding SVG circle `r`+opacity, **origin at epicenter**. Node color shifts are attribute tweens. Containment seam = a teal `stroke` fill + a soft, *bounded* glow that **does not** wash out any text.
- Easing: stress builds with `power1.in` (tension), fracture snaps `power4.out` (release), containment settles `power2.out` (relief). The easing *tells the story*.

**Typography/spatial:** one caption at a time, large, high-contrast on a **solid scrim** (never floating over glow — contrast law). Phase index shown as `01 / 06` in mono.

**⚠ Temptation:** full-screen crimson flash + screen shake for "cinematic" impact. **Discipline:** (a) a full crimson wash would break AA for any text and feels like slop; (b) screen-shake is nauseating and violates reduced-motion spirit. **Instead:** contained, *local* glow with generous dark space around it — the restraint is what reads as senior/tasteful.

**Empty/loading:** static SVG scene; no async.
**Reduced-motion / no-pin fallback:** the sequence degrades to a **static 6-panel "storyboard" plate** — six small frames (stable → recovered) laid out as a filmstrip with captions. Same narrative, zero motion, no pin. (Emil: reduced-motion is a designed layout, not a switch-off.)
**Mobile:** no pinning (perf + scroll-jacking). Falls back to the **storyboard filmstrip** vertically, or a *tap-to-advance* stepper — reader taps through phases. No scroll-jacking on touch.
**a11y:** the scene is `aria-hidden` for the *animation*, but each phase caption is real text in the DOM in order (screen readers get the full 6-step narrative regardless of motion). A visible "reduce motion / view as storyboard" affordance. `prefers-reduced-motion` respected globally.

---

## 6. §Laws of the Moment — `LawCard` gallery (Fig. 06)

Editorial **law cards** — the invariants of the Transaction Moment stated as a numbered codex (fail-closed, deterministic core, idempotency, tamper-evident audit, ubiquitous language, boundary integrity…). This is the "principles" spread of the monograph.

**Layout/composition:** a **numbered editorial grid** (2-up desktop, 1-up mobile) of `.holo-card`s. Each card: a large index numeral (Space Grotesk, ghosted), the **law** as a bold one-liner, a short gloss (Inter), a small **original SVG motif** (reuse the MASTER illustration set: `FailClosedLaneMotif`, `IntegrityShield`, `SilentWideningDiagram`, `TransactionMomentMotif`), and a subtle cross-link to implementation evidence (§9).

**Interaction model:** hover/focus lifts the card (existing `.holo-card` sheen) and plays the motif's *single* micro-animation once (`playInView` style, but on-hover). Click → expands an inline `Disclosure` with the "why it exists / what breaks without it" detail (reuse builder `Disclosure`).

**Motion language:** cards reveal in a `StaggerGroup` (Emil ease-out, stagger 0.09). Motif animates once, then rests. The ghosted numeral does a tiny parallax drift (`Parallax`, low speed) for editorial depth. No looping — a codex is still.

**Typography/spatial:** big index numerals give the page its "chapter" rhythm; laws in Space Grotesk; glosses in Inter; law IDs in mono. Generous gutters.

**Empty/loading:** static.
**Reduced-motion:** cards fully visible, motifs at static final frame, no parallax drift.
**Mobile:** single column; numerals scale down but stay prominent.
**a11y:** each card is an `<article>` with an `<h3>` law; disclosures are proper `<button aria-expanded>` + region; keyboard/focus complete; heading order h2 (section) → h3 (each law).

---

## 7. §Domain Evolution Simulator — `RippleSim` (Fig. 07)

An **interactive ripple**: pick a plausible domain change and watch its impact **propagate along the real relationship edges** — teaching *why boundaries localize change* and where the coupling costs are.

**Layout/composition:** a wide `Plate` reusing the **same context layout as the map** (visual rhyme — the reader already knows this drawing). A left rail of **change chips** (`changeCatalog`: e.g. "Add a new offer attribute," "Split the Attribution context," "Change the eligibility rule shape"). The graph is the canvas.

**Interaction model:**
- Reader **selects a change** → the origin context pulses, then an **impact wave** travels outward **along edges**, lighting each reached context and annotating *how* it's affected (mono tag: "schema change," "ACL absorbs it," "conformist → forced change").
- Crucially, **ACL / Separate-Ways edges DAMP the wave** (it stops or weakens), while **Conformist / Shared-Kernel edges TRANSMIT it fully** — so the simulator *demonstrates the value of the patterns* from §2. Impacted count is qualitative (highlighted set), **never a fabricated metric.**
- Hovering an impacted node explains the mechanism; a "reset" clears.

**Motion language:** origin-aware wave (Emil) from the selected node; edge transmission animates as a traveling dash pulse whose **reach depends on the pattern** (ACL edge shows the pulse *hitting a wall glyph and fading*). `power2.out`; ~600–900ms total; interruptible (selecting another change restarts cleanly). One wave at a time (restraint).

**Typography/spatial:** change chips in mono; mechanism annotations in mono; the "boundaries contain change" thesis as a short Inter caption that updates per selection.

**Empty/loading:** idle state = graph calm, prompt "Select a change to trace its blast radius." No pre-fired result.
**Reduced-motion:** selecting a change **instantly highlights** the impacted set + shows the annotations as a static list ("This change touches: A (schema), B (ACL absorbs), C unaffected"). No wave. Full insight retained.
**Mobile:** change chips become a horizontal scroller or select; graph uses the stacked/indented layout from §2; wave still animates but simplified.
**a11y:** change chips are `role="radio"` in a `radiogroup`; the impact result is an `aria-live="polite"` list so screen-reader users get "This change impacts: …"; each impacted node focusable with its mechanism in `aria-label`. Keyboard-complete.

**⚠ Temptation:** show a shrinking "blast radius: 42% of the system" gauge for punch. **Discipline:** fabricated → forbidden. The qualitative highlighted-set + pattern mechanics are *more* credible to an architect anyway.

---

## 8. §Future Bounded-Context Hypotheses — `HypothesisCard` gallery (Fig. 08)

A **forward-looking gallery** of speculative future contexts — clearly framed as *hypotheses*, not roadmap or fact. The monograph's closing "open questions" plate.

**Layout/composition:** an asymmetric **editorial gallery** (masonry-ish, 3 columns desktop) of `HypothesisCard`s. Each card: a title, a one-line premise, a **mini SVG context-sketch** (a tiny version of the map grammar — a node + its proposed edges), and an honest label **"Exploratory hypothesis"** in mono (never a fake confidence %).

**Interaction model:** hover/focus flips a subtle detail (the premise expands; the mini-sketch draws its proposed edges). Optional: a card can drop a **ghost node onto the main map** (if in view) to show *where it would attach* — a lovely tie-back, purely illustrative and labeled speculative.

**Motion language:** cards reveal staggered (ease-out). Mini-sketch edges **draw** on hover (`stroke-dashoffset`), echoing the map's assemble motion — visual continuity. Restrained; a gallery is browsed, not performed.

**Typography/spatial:** titles Space Grotesk; premises Inter; the "Exploratory" tag mono in amber-muted to signal "not committed." Airy gallery spacing.

**Empty/loading:** static.
**Reduced-motion:** cards visible, sketches at static final frame.
**Mobile:** single/two column; ghost-drop disabled (no map on screen), replaced by a text "would attach to: {context}".
**a11y:** `<article>` + `<h3>`; the speculative nature is in text, not just color; keyboard/focus complete.

**⚠ Temptation:** present hypotheses with confidence percentages or projected impact numbers for gravitas. **Discipline:** fabricated → forbidden; labeled "exploratory," full stop.

---

## 9. §Implementation-Evidence Cross-Links (Fig. 09 / running)

Threads the monograph back to the *real build* — the proof it's not just theory.

**Layout/composition:** two forms:
1. **Running marginalia:** throughout the essay, small mono "→ see Fig. X / → `builder`§ / → Console" cross-links in the left margin (scholarly citation texture).
2. **A closing evidence plate:** a compact index mapping each *law/context/pattern* to where it's implemented (Console feature, Builder scene, an ADR in `docs/ADR`, an invariant in `TRANSACTION_INVARIANTS.md`). Reuses the existing `EvidenceSection` / `Cite` components.

**Interaction model:** links navigate (internal routes / anchors only — no external URLs, MASTER). Cross-links that point to a map node highlight it on arrival (deep-link `#context-attribution` focuses + spotlights that node). Hovering an evidence row previews the target (title + one-liner) without navigating.

**Motion language:** none dramatic — links get a fast underline-grow on hover (120ms). Arrival-highlight on a deep-linked node is a single teal pulse (respects reduced-motion → static ring).

**Typography/spatial:** mono index table; generous row height; PASS/coverage indicators use semantic color **+ glyph + text**.

**Empty/loading:** if evidence is data-driven and unavailable, honest empty state; if static, none.
**Reduced-motion:** instant highlight, no pulse.
**Mobile:** marginalia collapses inline; evidence plate becomes a stacked list.
**a11y:** real `<a>`s with descriptive text; the evidence index is a `<table>` with headers; deep-link focus moves to the target and is announced; heading order preserved. Skip-link to main respected.

---

## 10. Page-level scaffolding

- **Nav:** same sticky header pattern as Vision/Builder, with `Console · Vision · Builder · Moment` — `Moment` marked `aria-current`. Theme toggle reused. This slots Moment Forge into the existing family navigation.
- **Substrate:** `LivingBackground` reused at low opacity behind everything, **plus** the blueprint hairline grid (both `aria-hidden`, both pause on hidden tab / reduced-motion).
- **Spine:** `SectionSpine` left progress line + `PlateRail` figure index (desktop ≥1024px only; hidden on mobile to protect the measure).
- **Scroll:** site-wide `SmoothScroll` (Lenis) reused; disabled under reduced-motion by the global law.
- **Landmarks:** `<header>`, `<main>`, `<nav aria-label>`, one `<h1>`, sections each `<section aria-labelledby>` with a single `<h2>`; figure titles are the `<h2>`/`<h3>` at correct depth. No horizontal body scroll anywhere — wide plates/consoles scroll internally.
- **Perf:** every loop is `playInView` + paused off-screen + single rAF where canvas is used; SVG-first; no WebGL; no external assets. **⚠ Temptation:** a Three.js force-graph for the map. **Discipline:** heavier, non-offline-safe risk, and MASTER favors GPU-light — hand-built SVG with deterministic layout gives a better static/reduced-motion frame anyway.

## 11. Build order (suggested)
1. `Plate`, `DomainTerm`, `Marginalia`, `PlateRail`, `SectionSpine` (the editorial chassis).
2. `ContextMap` + `RelationshipEdge` + `PatternLegend` (signature; everything else rhymes with it).
3. `LanguageLens` (stop-scrolling piece).
4. `RippleSim` (reuses map layout).
5. `FractureScene` (reuses map subset).
6. `LawCard`, `HypothesisCard`, evidence cross-links.
7. Reduced-motion + mobile fallbacks + a11y pass (non-negotiable gate before "done").

---

### Compliance checklist (every item verified against MASTER)
- [x] Teal `#22E6C8` accent, `#0B0F19` base, Space Grotesk/Inter/mono only — no new fonts/colors.
- [x] No fractional-alpha text; solid `--c-muted`; gradient text keeps solid fallback.
- [x] Status = color **+ glyph + text** everywhere (map edges, verdicts, fracture, evidence).
- [x] No fabricated numbers; only the real Compiler emits live values, with loading/empty/error states.
- [x] Every animation gated on `prefers-reduced-motion` → complete static final frame.
- [x] Self-hosted/offline: all inline SVG/canvas, no external image/font/video/URL.
- [x] Full keyboard nav, visible focus, correct heading order, aria-live on dynamic regions, no horizontal body scroll, responsive to mobile.
- [x] Reuses existing primitives (`Reveal`, `Parallax`, `MaskedLines`/`MaskText`, `ClipReveal`, `IllustrationReveal`, `useGsapScene`, `playInView`, `LivingBackground`, `SmoothScroll`, MASTER illustrations) — no reinvented engine.

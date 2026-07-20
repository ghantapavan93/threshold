# /media — the cinematic reel manifest

Every slot below is already wired into the app via `components/visual/SceneMedia.tsx`.
**Adding a clip is two steps: (1) drop the file into this folder with the exact name,
(2) add that filename to `manifest.json`'s `available` array.** Until then the page
renders its designed illustration / nothing — never a broken box, and never a 404 in
devtools (only manifest-listed files are ever requested).

Example manifest once the first two clips land:

```json
{ "available": ["scene-design.webm", "scene-design.jpg", "ambient-moment.webm", "ambient-moment.jpg"] }
```

Two classes of media, per the project's honesty posture (nothing fabricated):

- **Real screen recordings** for anything that shows the app. Never AI-generate app UI —
  video models garble interface text, and a fabricated recording of our own app would
  contradict the "every number computed live" thesis.
- **AI ambient loops (Veo / Gemini)** only for abstract, text-free atmosphere.

---

# ★ BUILDER KEYNOTE — the ten cinema clips (`/builder`)

The primary experience. Each of the ten chapters has a code-drawn environment already
on screen; these ambient loops layer **on top at 30% opacity under a scrim**, so they
add depth and life without ever fighting the copy or the live UI. One clip per chapter.

**Platform:** Google **Veo 3** via the Gemini app or Google Flow (labs.google/flow) is the
top pick — extend/loop tools, best physical realism. Kling AI or Runway Gen-3 also work.

**File naming (exact):** `kc-<chapter>.webm` for the loop **and** `kc-<chapter>.jpg` for the
poster still, dropped in this folder, then added to `manifest.json`. Chapters:
`kc-moment · kc-change · kc-customers · kc-failure · kc-machine · kc-evidence · kc-experiment · kc-frontier · kc-handoff · kc-afterglow`.

## ① Paste this CONTEXT PREAMBLE first, once per session

> You are generating **cinematic product-demo footage — clips that look like a real
> screen recording of a premium dark-mode software product in action** — for **"Threshold
> — Builder Keynote"**. Threshold is a deterministic safety gate that proves an e-commerce
> checkout-policy change is safe *before any customer sees it*. Each clip should read as
> *"this is the actual app doing the thing"* — real-feeling dashboards, a checkout screen,
> a policy editor, analytics grids, monitoring panels — captured as a smooth, high-end
> product walkthrough. Visual identity — museum-dark and precise:
> • base / void: deep ink-navy **#0B0F19**
> • teal **#22E6C8** = safe, verified, alive
> • crimson **#FF4D6A** = blocked, failure, leak
> • amber **#F5B84B** = a visible, honest warning
> • soft blue **#5B8CFF** = offers, customers, value
> The feel to match is our product's own: **premium, dark-mode SaaS — museum-grade,
> editorial, Awwwards-caliber, restrained and expensive, never busy or gamer-flashy.**
> Think Linear / Vercel / Stripe product films: real-looking interfaces, smooth cursor
> movement, panels and charts animating, numbers ticking, all in slow confident motion.
> Style for EVERY clip: cinematic screen-recording / product-walkthrough aesthetic,
> clean modern dark-mode interface, shallow depth of field, subtle screen glow, faint film
> grain, extremely slow and deliberate motion. HARD RULES (obey on every clip — this
> saves credits): the model **cannot spell — so keep ALL on-screen text, labels and
> numbers soft, blurred, and unreadable; never rely on legible words**; **no real brand
> logos or watermarks**; keep any people peripheral, from behind, out of focus (no faces).
> Seamless loop; no camera cuts; hold the same mood start to end; 16:9; about 10 seconds;
> keep the centre calmer/darker so our overlaid text stays legible.

### Google Veo / Flow — run settings (do this once)

- **Aspect ratio:** 16:9. **Duration:** 8s (Veo 3 default; we loop it in the player).
- **Audio:** none needed — the loops play muted. If Veo insists, ask for *"ambient
  silence, no music, no dialogue"* and strip audio in encode (`-an`, see File specs).
- **Negative prompt** (paste into Flow's negative field, or append "avoid:" to the prompt):
  `readable text, legible words, sharp typography, captions, subtitles, real brand logos,
  watermark, brand names, distorted faces, deformed hands, extra fingers, cluttered,
  garish neon, cartoonish`
  *(Note: we WANT interfaces/screens/dashboards now — just with unreadable, soft text.)*
- **Style tail** — append to any prompt for batch consistency: *"premium dark-mode SaaS
  product-demo aesthetic, clean modern interface, smooth cursor and micro-animations,
  shallow depth of field, subtle screen glow, faint film grain, extremely slow deliberate
  motion, on-screen text soft and unreadable, seamless loop, calm dark centre."*
- Generate one clip per prompt; if a fake letter/screen appears, re-roll — do not keep it.

## ② The ten prompts (each inherits the preamble)

Each reads as a screen recording of the app doing that chapter's job. On-screen text stays
soft/unreadable (the model can't spell); the *shapes* of the UI carry the story.

**kc-moment** — *00 · The Moment.* Cinematic screen-recording of a sleek dark-mode
e-commerce checkout interface at the exact instant a purchase is confirmed: a clean
confirmation panel softly illuminating in teal (#22E6C8) on a deep ink-navy (#0B0F19) UI,
a gentle success glow spreading, cursor resting, subtle interface micro-animations. The
calm after "buy." On-screen text soft and unreadable; no logos.

**kc-change** — *01 · The Change.* Cinematic screen-recording of a dark-mode policy / rules
editor showing two configuration versions side by side; a single toggle flips and one row
in the diff highlights crimson (#FF4D6A) against ink-navy (#0B0F19) with teal (#22E6C8)
accents, cursor gliding, panels updating. A small edit with big weight. Text soft/blurred
and unreadable; no logos.

**kc-customers** — *02 · The Customers.* Cinematic screen-recording of a dark-mode analytics
dashboard visualizing a huge grid of thousands of customer-session cells; a live replay
sweeps left to right lighting cells teal (#22E6C8) while a scattered few flip crimson
(#FF4D6A) and soft blue (#5B8CFF), counters ticking up. Watching thousands of shoppers at
once. On ink-navy (#0B0F19); numbers/text soft and unreadable; no logos.

**kc-failure** — *03 · The Failure.* Cinematic screen-recording of a dark-mode monitoring
dashboard: one panel (the optional offer) flashes, drops into a crimson (#FF4D6A) error
state and dims out, while the adjacent order-confirmation panel stays solid and healthy in
teal (#22E6C8). The extra fails, the purchase survives. On ink-navy (#0B0F19); text
soft/unreadable; no logos.

**kc-machine** — *04 · The Machine.* Cinematic screen-recording of a dark-mode pipeline /
trace visualization: a horizontal flow of connected nodes and stages lights up one after
another as a teal (#22E6C8) pulse travels through them over a faint grid, a waterfall of
spans filling in beneath. The system checking every layer. On ink-navy (#0B0F19); labels
soft/unreadable; no logos.

**kc-evidence** — *05 · The Evidence.* Cinematic screen-recording of a dark-mode audit /
verification interface: a before-and-after comparison where cluttered crimson (#FF4D6A)
flagged rows resolve into fewer clean verified rows glowing teal (#22E6C8), checkmarks
appearing down a ledger. Proof being distilled. On ink-navy (#0B0F19); text soft/unreadable;
no logos.

**kc-experiment** — *06 · The Experiment.* Cinematic screen-recording of a dark-mode
experimentation dashboard: a controlled A/B split with a small highlighted treatment cohort
in teal (#22E6C8) beside a large protected control group in soft blue (#5B8CFF), gauges and
a verdict panel settling into place. A careful, contained test. On ink-navy (#0B0F19);
numbers/text soft/unreadable; no logos.

**kc-frontier** — *07 · The Frontier.* Cinematic screen-recording of a near-future
agentic-commerce interface: a glowing AI-assistant panel autonomously moving through a
checkout flow and pausing at a permission / consent prompt, approved steps lighting soft
blue (#5B8CFF) and teal (#22E6C8). The future of the checkout. On ink-navy (#0B0F19); text
soft/unreadable; no logos.

**kc-handoff** — *08 · The Hand-off.* Cinematic shot where a soft, out-of-focus haze
resolves and sharpens into a fully rendered dark-mode product console assembling panel by
panel in teal (#22E6C8) on ink-navy (#0B0F19) — a dreamlike view becoming a real, working
dashboard. The film becoming the product. Text soft/unreadable; no logos.

**kc-afterglow** — *09 · The Afterglow.* Cinematic screen-recording of a dark-mode dashboard
at rest in an all-verified state: every status calm and teal (#22E6C8), a completed
transaction summary and a quiet audit trail glowing softly on ink-navy (#0B0F19), no
alerts, everything settled. The work is done; the evidence remains. Text soft/unreadable;
no logos.

## ③ Poster stills (`.jpg`, required — reduced-motion users see these)

For each clip, generate one still (ChatGPT / any image model) with the SAME prompt prefixed
by: *"A single static cinematic frame, photographic quality —"*, save as `kc-<chapter>.jpg`.

## ④ Manifest once the keynote clips land

```json
{ "available": [
  "kc-moment.webm","kc-moment.jpg","kc-change.webm","kc-change.jpg",
  "kc-customers.webm","kc-customers.jpg","kc-failure.webm","kc-failure.jpg",
  "kc-machine.webm","kc-machine.jpg","kc-evidence.webm","kc-evidence.jpg",
  "kc-experiment.webm","kc-experiment.jpg","kc-frontier.webm","kc-frontier.jpg",
  "kc-handoff.webm","kc-handoff.jpg","kc-afterglow.webm","kc-afterglow.jpg"
] }
```

---

# Real app recordings — the TRUE colors + fonts + premium feel

AI video cannot render our real UI (it garbles fonts and text). For anything that must
look like the actual product — real Space Grotesk headings, Inter body, real teal
buttons, real live numbers — **screen-record the running app**. It is pixel-perfect
because it *is* the app. Our ground-truth identity (already rendered live by the app):

- **Display font:** Space Grotesk (600/700) · **Body:** Inter · **Mono:** the code voice.
- **Palette:** base #0B0F19 · text #E6EAF2 · teal #22E6C8 · crimson #FF4D6A · amber
  #F5B84B · offer-blue #5B8CFF. Dark theme is the hero look.

**Capture recipe for a premium result:**
1. Run backend (:8000) + frontend (:3000); use the **dark** theme; full-screen the browser,
   hide bookmarks, 1920×1080, 100% zoom, cursor visible.
2. Record with OBS / ScreenToGif / Win+G at 60fps, then trim to 5–10s per action.
3. **One deliberate action per clip**, paused ~1s on the end state so it loops clean.
4. Keep motion slow and intentional — no frantic scrolling; let the app's own animations
   (mark-by-mark replay, celebration burst, blur-in headlines) carry it.
5. Encode like the ambient clips (`-c:v libvpx-vp9 -crf 34 -an`, ≤4 MB) + a `.jpg` poster.

The keynote already embeds the LIVE components, so it doesn't *need* recordings — but the
same captures make a killer 30–60s demo reel for LinkedIn / outreach. Strongest shots:
Console "Play the story" → BLOCKED; the 480-seat audience lighting up; the Reconciliation
toggle 33 → 0; the Unit Wall raising UnitMismatchError live.

---

## File specs (all slots)

- `webm` (VP9) preferred, `mp4` (H.264) also works — if you use mp4, update the `src`
  paths in `SCENE_MEDIA` (Scenes.tsx) and the two hero backdrops.
- 1920×1080, 24–30 fps, **5–10 s**, seamless loop, **no audio track** (played muted).
- Target ≤ 3 MB per clip (`ffmpeg -i in.mp4 -c:v libvpx-vp9 -crf 38 -b:v 0 -an out.webm`).
- Each clip should have a matching poster: same basename, `.jpg`, ~1280 px wide
  (`ffmpeg -i clip.webm -vf "select=eq(n\,0)" -frames:v 1 poster.jpg`). The poster is
  what reduced-motion users see — it is required by the design system's motion law.

## Slots

### Builder scenes (real screen recordings — record at 1080p, dark theme, one deliberate action)

| File | Scene | What to record (5–10 s) |
|---|---|---|
| `scene-design.webm` + `.jpg` | 01 · Design & build | Console hero: click **Play the story** → V17→V18 lands **BLOCKED** (crimson verdict). |
| `scene-ai.webm` + `.jpg` | 02 · Accelerate with AI | Moment Forge **Semantic Change Compiler**: run compile → inversion flag appears. |
| `scene-collab.webm` + `.jpg` | 04 · Collaborate & innovate | **Reconciliation Lane**: toggle dual-write → outbox, silent divergences 33 → 0. |
| `scene-scale.webm` + `.jpg` | 05 · Optimize & scale | **Policy Diff Replay**: click ↻ Replay marks → mark-by-mark pop, changed marks flash. |

Windows capture: Win+G (Game Bar), ScreenToGif, or OBS. Crop to the section, keep the
cursor visible, pause ~1 s at the end state so the loop reads.

### Hero backdrops (AI ambient — generate with the prompt below)

| File | Where it plays |
|---|---|
| `ambient-moment.webm` + `.jpg` | Builder hero + Vision hero (shared — one generation covers both). |

Rendered at 30% opacity under a base-color scrim; legibility never depends on it.

## Veo / Gemini prompt — clip A "The Transaction Moment"

> Slow cinematic macro shot, abstract: hundreds of tiny luminous teal (#22E6C8) light
> particles drifting through deep ink-navy darkness (#0B0F19), slowly converging toward
> a thin vertical seam of light in the center, a few particles glowing soft blue
> (#5B8CFF). Shallow depth of field, gentle bokeh, volumetric haze. Extremely slow,
> calm, precise motion. Seamless loop, no camera cuts. No text, no letters, no numbers,
> no logos, no UI. 5 seconds, 16:9.

Prompt discipline (saves credits): always end with the no-text clause — regenerating
because a fake word appeared is the #1 credit sink; ask for *extremely slow* motion
(hides artifacts, loops cleanly); generate once at 5 s and loop in the player.

Optional clips B–D (gate-refusal, ledger, scale) from the same session's prompt pack can
be added later as backdrops for Vision's direction plates — wire them the same way with
`<SceneMedia variant="backdrop" …/>`.

---

# Moment Forge cinema bands (AI ambient — one distinct clip per seam)

Five intro bands are wired on `/moment-forge` (`CinemaIntro` in MomentForge.tsx). Each
section's intro text floats over its own dimmed loop once the file + manifest entry
exist; until then the page is unchanged.

| File | Section | Concept the clip must evoke |
|---|---|---|
| `mf-translation.webm` + `.jpg` | Fig. 03b Translation Map | a stream filtered at a luminous wall — only the true part crosses |
| `mf-reconciliation.webm` + `.jpg` | Fig. 03c Reconciliation Lane | two diverging paths pulled back into lockstep; one break flares visibly |
| `mf-unitwall.webm` + `.jpg` | Fig. 03d The Unit Wall | two unlike substances meet and refuse to blend |
| `mf-compiler.webm` + `.jpg` | Fig. 04 Semantic Compiler | a form decomposed and recomposed through a prism; one fragment flags red |
| `mf-sim.webm` + `.jpg` | Fig. 07 Evolution Simulator | a wave sweeping a dark field of tiles, a few flipping color |

## Context preamble — paste FIRST into any Gemini / Omni / Veo session

> You are generating abstract cinematic background loops for "Threshold — Moment Forge",
> a dark, premium engineering monograph about a deterministic safety gate that proves an
> e-commerce checkout policy change is safe before any customer sees it. The visual
> identity is museum-dark and precise: deep ink-navy base #0B0F19; luminous teal #22E6C8
> means safe/verified; crimson #FF4D6A means blocked/leak; amber #F5B84B means a visible,
> honest warning; soft blue #5B8CFF means offers/value. Style for every clip:
> macro-photography abstraction, volumetric haze, shallow depth of field, extremely slow
> and deliberate motion, elegant and calm — never chaotic. HARD RULES for every clip:
> no text, no letters, no numbers, no logos, no UI, no people, no products; seamless
> loop; no camera cuts; 16:9; about 10 seconds.

## Per-clip prompts (each is one generation; all inherit the preamble)

**mf-translation** — Clip: a wide slow stream of mixed teal (#22E6C8) and crimson
(#FF4D6A) light particles flows toward a thin standing wall of light; at the wall the
teal particles pass through cleanly and continue right in a calm ordered stream, while
the crimson ones are gently deflected downward and fade into darkness. The passed stream
is visibly thinner than the arriving one — the honest, smaller number.

**mf-reconciliation** — Clip: two parallel ribbons of teal light travel left to right
through darkness and slowly drift apart; a third, thinner amber (#F5B84B) thread sweeps
across, catches them, and draws them back into perfect lockstep; at one point the amber
thread flares briefly where a ribbon was broken — the break is made visible, then the
ribbons continue in step.

**mf-unitwall** — Clip: extreme macro of two slow liquid-light currents meeting head-on,
one luminous teal (#22E6C8), one soft blue (#5B8CFF); at the meeting line they refuse to
blend — a shimmering, softly crackling boundary holds them apart, each current turning
back along the wall. Beautiful surface tension, no mixing ever.

**mf-compiler** — Clip: a single elegant geometric form of teal light is pulled apart
into drifting faceted fragments, passes through an invisible prism plane, and reassembles
on the other side into a slightly different form; as it reassembles, exactly one facet
pulses crimson (#FF4D6A) and holds — the one change whose meaning shifted.

**mf-sim** — Clip: a vast dark plane of tiny dormant square tiles seen at a low angle; a
single smooth wave of teal illumination sweeps across them left to right, lighting each
tile in sequence; in the wave's wake a scattered few tiles flip to crimson (#FF4D6A) and
soft blue (#5B8CFF) and stay lit; the wave exits and the field rests, calm.

## Poster stills (.jpg) — ChatGPT / any image model

For each clip, generate one still with the SAME prompt prefixed by: "A single static
cinematic frame, photographic quality —" and drop it beside the clip as `name.jpg`.
The still is what reduced-motion users see, so it must stand alone beautifully.

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

> You are generating abstract cinematic background loops for **"Threshold — Builder
> Keynote"**, a dark, premium engineering film about a deterministic safety gate that
> proves an e-commerce checkout-policy change is safe *before any customer sees it*. The
> film is told as chapters; each loop is the atmospheric backdrop behind one chapter's
> text and live product UI, so it must be **calm, out-of-focus, and never compete for
> attention**. Visual identity — museum-dark and precise:
> • base / void: deep ink-navy **#0B0F19**
> • teal **#22E6C8** = safe, verified, alive
> • crimson **#FF4D6A** = blocked, failure, leak
> • amber **#F5B84B** = a visible, honest warning
> • soft blue **#5B8CFF** = offers, customers, value
> The feel to match is our product's own: **museum-grade, editorial, Awwwards-caliber —
> restrained, precise, expensive, confident, never busy or gamer-flashy.** Think a
> high-end film title sequence for a serious engineering product, not a tech demo.
> Style for EVERY clip: cinematic macro/wide abstraction, volumetric haze, shallow depth
> of field, film grain, gentle bokeh, extremely slow and deliberate motion, elegant and
> restrained. HARD RULES (obey on every clip — this saves credits): **no text, no
> letters, no numbers, no logos, no UI, no readable screens, no people, no faces, no
> brand marks**; seamless loop; no camera cuts; hold the same mood start to end; 16:9;
> about 10 seconds; leave the centre calmer/darker so overlaid text stays legible.

### Google Veo / Flow — run settings (do this once)

- **Aspect ratio:** 16:9. **Duration:** 8s (Veo 3 default; we loop it in the player).
- **Audio:** none needed — the loops play muted. If Veo insists, ask for *"ambient
  silence, no music, no dialogue"* and strip audio in encode (`-an`, see File specs).
- **Negative prompt** (paste into Flow's negative field, or append "avoid:" to the prompt):
  `text, letters, numbers, words, captions, subtitles, logos, watermark, UI, interface,
  screens, buttons, people, faces, hands, brand names`
- **Style tail** — append to any prompt for batch consistency: *"Shot on a cinema camera,
  anamorphic, volumetric haze, film grain, shallow depth of field, extremely slow
  deliberate motion, seamless loop, no camera cuts, calm dark centre for text overlay."*
- Generate one clip per prompt; if a fake letter/screen appears, re-roll — do not keep it.

## ② The ten prompts (each inherits the preamble)

**kc-moment** — *00 · The Moment.* A premium, empty movie theatre at rest, seen wide from
the back rows: a large screen glowing a soft teal (#22E6C8) haze, raked rows of dark
seats catching faint teal rim-light, slow dust motes drifting through a projector beam.
Warm, expectant, still — a moment about to begin. Deep ink-navy (#0B0F19) throughout.

**kc-change** — *01 · The Change.* A dark chamber of thin converging perspective lines
receding to a single glowing crimson (#FF4D6A) vanishing point; two tall monolithic slabs
of faint light face each other in the space, one cool and neutral, one edged in crimson.
Tension held, nothing moving fast — the instant before a decision. Ink-navy void.

**kc-customers** — *02 · The Customers.* An immense dark auditorium rendered as a vast
field of tiny luminous points, like an audience of soft blue (#5B8CFF) lights receding
into haze; one slow wave of teal (#22E6C8) illumination sweeps across them, and a
scattered few points quietly flare crimson (#FF4D6A) in its wake, then settle. Awe, scale.

**kc-failure** — *03 · The Failure.* Two parallel streams of light flow left to right
through the dark; the upper stream (the optional offer) breaks apart into drifting crimson
(#FF4D6A) embers and dissolves, while the lower stream (the purchase) continues perfectly
steady and unbroken in teal (#22E6C8). A calm, clean separation — failure contained, never
chaotic. Ink-navy background.

**kc-machine** — *04 · The Machine.* A slow travelling shot gliding through the interior of
an immense, precise machine: luminous teal (#22E6C8) pulses of energy flow along fine
conduits, passing in sequence through a series of softly-lit gates and chambers, over a
faint blueprint grid. Ordered, mechanical, accountable — like watching a clockwork engine
from inside. Deep navy metal and shadow.

**kc-evidence** — *05 · The Evidence.* A dark archive of translucent luminous planes
floating in space (abstract records, no readable text); a clean vertical boundary of light
sweeps slowly across, and where it passes, cluttered scattered crimson (#FF4D6A) fragments
resolve into fewer, calmer, ordered teal (#22E6C8) planes. Truth being distilled — less,
but truer. Ink-navy void.

**kc-experiment** — *06 · The Experiment.* A vast dark field of faint points of light; a
small, bright cohort of teal (#22E6C8) points sits isolated inside a soft luminous ring,
clearly separated from the larger surrounding field which glows calm and protected in soft
blue (#5B8CFF). Controlled, careful, quiet — a contained experiment. Deep navy expanse.

**kc-frontier** — *07 · The Frontier.* A single luminous capsule of soft-blue (#5B8CFF)
light travels slowly toward a tall shimmering vertical membrane (a consent boundary); as it
meets the membrane, approved light passes through and continues as clean blue, while a thin
haze of unsupported particles dissolves away at the surface. Futuristic, permissioned,
trustworthy. Ink-navy depth with teal (#22E6C8) accents.

**kc-handoff** — *08 · The Hand-off.* A soft cinematic haze in deep ink-navy slowly
crystallizes and resolves into a clean, precise architectural lattice of fine teal
(#22E6C8) lines — the moment a dreamlike film settles into a real, engineered structure.
Calm, confident, grounded. No UI, purely abstract geometry emerging from fog.

**kc-afterglow** — *09 · The Afterglow.* An empty movie theatre after hours, lights down:
the screen dark, the raked seats barely visible in deep ink-navy (#0B0F19), and a single
faint teal (#22E6C8) trace-line still glowing quietly across the space as the last dust
settles. Resolved, calm, the end of the story — stillness with one light left on.

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

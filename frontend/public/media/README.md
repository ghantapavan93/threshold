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

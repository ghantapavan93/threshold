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

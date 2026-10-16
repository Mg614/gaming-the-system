# Cinematic animation pipeline

This toolkit gives **GAMING THE SYSTEM** two animation modes without requiring paid AI video generation.

## The simple rule

- Use **Framer Motion** for animation that must react immediately to the player: clicking, choosing, hovering, character reactions, camera responses, and `onComplete` callbacks. Framer Motion is the library already used by the game for real-time React animation.
- Use **Remotion** for a sequence that must happen at exact times: a six-second cutscene, a precise reaction beat, subtitles synchronized to frames, or a previewable cinematic timeline. Remotion turns React components into a frame-controlled timeline.
- Keep game decisions outside Remotion. The game decides *what happens*; a Remotion composition only presents a known sequence.

## ZERO-COST RULE

The default production pipeline must work without paid AI video generation. React, Framer Motion, Remotion, SVG/CSS layers, existing media, and browser-native audio are the required path.

External AI video may later be an optional enhancement for motion that is unusually difficult to reproduce with layers, such as a crowded classroom, complex walking, or highly organic multi-character movement. Never connect a paid service automatically, never make game logic depend on generated video, and always keep a code-based fallback.

## File map

```text
src/cinematics/
├── CinematicToolingDemo.tsx          browser demo: Framer + Remotion Player
├── cinematics.css
├── shared/engine/                   reusable presentation; follows repository boundary
│   ├── CharacterRig/CharacterRig.tsx layered 2D character
│   ├── CinematicCamera/CinematicCamera.tsx
│   ├── DialogueLayer/DialogueLayer.tsx
│   ├── EnvironmentMotion/EnvironmentMotion.tsx
│   ├── audio/useCinematicAudio.ts
│   ├── timeline/animationMath.ts
│   ├── timeline/useIrregularBlink.ts
│   └── types.ts
└── remotion/
    ├── Root.tsx                      Studio entry + composition registration
    └── scenes/CinematicToolingDemoComposition.tsx
```

Future Level 1, 2, and 3 scenes should live beside `remotion/` in their own folders. Do not move gameplay state into those folders.

## Character asset convention

A production character can gradually add these transparent layers:

```text
character-name/
├── body/base
├── head/base
├── eyes/center, left, right, down, blink
├── eyebrows/neutral, raised, concerned
├── mouth/neutral, small-smile, open, uncertain
└── arms/idle, hand-up, writing, checking-rubric
```

All layers for one character should use the same canvas size and anchor point. Exporting every layer from the same artboard keeps eyes and mouths aligned. The `layers` prop is optional, so a partial rig falls back gracefully instead of failing. Arm art is selected with `pose.arms`; missing poses use the idle placeholder. `previousPose` plus a `blend` value from `0` to `1` crossfades old and new facial layers.

The current demo character is a clearly labelled temporary SVG. It proves the layer system; it is not production artwork.

## Add or change an expression

1. Add the new expression name to `Expression` in `shared/engine/types.ts`.
2. Add its eyebrow and mouth artwork to the character's `CharacterRigLayers` object.
3. Pass the expression name in the character `pose`.
4. In interactive mode, let Framer Motion crossfade between the old and new layer groups. In a Remotion composition, calculate opacity from `useCurrentFrame()` and `interpolate()`.

Do not require every character to have the new layer. Keep a neutral fallback.

## Blink

Interactive scenes use `useIrregularBlink()`. It uses seeded, changing delays so blinks do not repeat mechanically at exactly the same interval. Remotion scenes use short `pulse()` windows at deliberately uneven frame positions, which makes rendering deterministic: the same frame always looks the same.

Keep a blink short—roughly 100–150 ms—and avoid blinking exactly on every dialogue beat.

## Gaze and head movement

Set `pose.gaze` to `center`, `left`, `right`, or `down`. For small procedural eye tracking, optionally pass `gazeTarget: {x, y}` with values around `-1` to `1`; production art can still replace that direction with a dedicated layer.

Use `headTilt` for only a few degrees and `headY` for a very small nod or look-down movement. Small values read as acting; large values read as interface animation.

## Breathing

Pass a slow sine-like value from `-1` to `1` into `breathing`. `CharacterRig` converts it to less than one percent scale and about two pixels of movement. Disable or greatly simplify it when `prefers-reduced-motion` is enabled.

## Camera moves

Wrap a scene in `CinematicCamera` and provide a `CameraPose`:

- `scale`: `1` is wide; values around `1.04–1.10` make a gentle push-in.
- `x` and `y`: small percentages shift focus without replacing the whole page.
- `blur`: optional depth emphasis; avoid continuous expensive blur.
- `vignette`: subtle edge darkening.

In the game, Framer Motion animates the wrapper from one camera pose to another. In Remotion, calculate the pose with `useCurrentFrame()` and `interpolate()` so every frame is reproducible.

## Environmental life

`EnvironmentMotion` demonstrates independent glow, object, and light movement. Its offsets are seeded so repeated renders match, while separate objects do not move in sync. Prefer a few cheap transforms and opacity changes over many large transparent images or continuous filters.

## Audio hooks

`useCinematicAudio()` accepts a map of real audio file URLs and provides `play()` and `stop()`. Missing sources safely do nothing. Browser audio normally needs the player's first click before playback can start.

Use cue groups such as `ambience`, `ui`, `reaction`, and `transition`. Do not create fake audio files, and do not add a paid sound service for this pipeline.

## Create a Remotion timeline

1. Make a scene component under `src/cinematics/remotion/scenes/`.
2. Read `frame` from `useCurrentFrame()` and `fps` from `useVideoConfig()`.
3. Convert seconds to frames with values such as `2 * fps`.
4. Animate with `interpolate()` or a frame-based helper—never CSS transitions or CSS keyframe animation inside a rendered composition.
5. Register one explicit `<Composition>` in `remotion/Root.tsx` with its duration, fps, width, and height.

## Test in the browser

Run:

```bash
npm run dev
```

This starts Vite, the local development server that shows the normal React game. Open the printed local address for the existing opening. Add `?cinematic=demo` to the address to view both the interactive Framer Motion demo and the embedded Remotion Player, for example:

```text
http://127.0.0.1:5173/?cinematic=demo
```

## Test in Remotion Studio

Run:

```bash
npm run cinematic:studio
```

This opens the Remotion timeline development server. It previews `CinematicToolingDemo`; it does not render an MP4. Stop either local server with `Control-C` in its Terminal window.

## Before merging a cinematic change

Run `npm run typecheck`, `npm run build`, open the normal game, complete the existing opening, open `?cinematic=demo`, and confirm the Studio composition loads without an error overlay.

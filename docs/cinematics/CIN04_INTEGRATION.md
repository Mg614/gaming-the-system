# CIN-04 — Ending / Theory Reveal

Independent feature branch: `feature/cinematic-ending-theory-reveal`.
Base: `05d0fda`. No upstream branch merges or gameplay changes.

## Approved sources

The previous preflight read all three V2 sources and all six Ending workbook
sheets. The same identified files are copied, not moved, from the original
checkout. Mechanism meaning > player progression > narrative > storyboard.

- `docs/game-design/GAMING THE SYSTEM_Narrative V2.pdf`
- `docs/game-design/Gaming_the_System_玩家路径与界面清单_v2.0.docx`
- `docs/game-design/Gaming_the_System_游戏机制与结果总览_v2.0(1).docx`
- `docs/storyboard/Storyboard_CIN_04_Ending_TheoryReveal_v01.xlsx`
- All four `docs/visual-style/references/ending-theory-reveal/REF-END-*` images.
- `assets/characters/CHAR-L1-001 — Alex Character Set.png` is identity reference.
- `assets/backgrounds/BG_Office_FirstPerson_v01.png` remains the office.

REF-END images are composition references, never full-screen final scenes.
Their baked annotations and different office layout do not override sources.

## Selective upstream reuse

The following committed leaf components are copied byte-for-byte to their
original paths. They are not forked or edited for Ending. Their original
orchestrators, clocks, debug pages and gameplay integration are not copied.
This allows a later integration to deduplicate identical files naturally.

| Checkpoint | Unchanged files | Use |
| --- | --- | --- |
| CIN-01 `1bdd0c4` | `src/cinematics/level1/{ConsequenceScene.tsx,level1Content.ts,branch.css}` and six referenced plates | Actual frame-driven Level 1 consequence renderer |
| CIN-02 `c8c1c83` | `src/cinematics/level2/{AlexCheckingSequence.tsx,ChecklistSystem.tsx,checklistPresentation.ts,alexCheckingTimeline.ts,alexChecking.css,checklist.css}` and its three production images | Actual checklist and pen-contact animation |
| CIN-03B `0b35379` | `src/cinematics/level3b/{ResultVisuals.tsx,presentation.ts,types.ts,level3b.css}` | Actual supplied-result comparison renderer |

CIN-03A `ba9f81e` was inspected but its full scene dependencies are not copied.
Level 3 behaviour thumbnails remain an explicitly DEV-only approved-reference
adapter, as in CIN-03B's development preview. This is not CIN-03A animation reuse.

## Boundaries

Near-equal weights improve effort distribution. Percentages still shape effort.
Ending does not score, classify weights, change choices, or implement Design Lab.
The integration teammate supplies immutable prior results and the real Level 3
memory renderer. The local Ending input is a presentation proposal; shared
gameplay contracts remain untouched pending joint integration.

## Preview and integration

Development preview: `http://127.0.0.1:5178/?cinematic=ending`.
Optional `scene=office`, `scene=goodhart`, `scene=recap`, `frame=660`, or
`reduced=1` query parameters support direct inspection. The preview starts paused.
The separate Studio entry is `src/cinematics/ending/StudioRoot.tsx`.

Mount `EndingTheoryRevealSequence` with `input`, `WeightMemory`, `reducedMotion`,
`onComplete`, and `onHandoff`. Supply the player's prior results; Ending never
calculates them. Give each intentional replay a fresh `input.requestId`.
`onComplete` emits `animationComplete` once per mounted request after playback
ends; seeking alone does not emit it. Repeated ends within the same request are
ignored. `onHandoff` emits `design_lab_requested` once after the final button's
fade. The integration owner routes that event to the actual Design Lab.
The final frame remains visible. Development controls are optional and hidden
by default. The production entry excludes the development preview and fixtures.

## Changed implementation files explained

| File | Purpose |
| --- | --- |
| `src/main.tsx` | Opens the independent Ending preview only during development. |
| `src/cinematics/ending/endingTimeline.ts` | Holds the 12 shot timings, approved lines and once-only completion guard. |
| `src/cinematics/ending/types.ts` | Describes the results and notifications exchanged with the integration owner. |
| `src/cinematics/ending/EndingComposition.tsx` | Selects the visible shot from the current frame. |
| `src/cinematics/ending/EndingMemories.tsx` | Arranges existing Level 1, checklist and comparison renderers into memories. |
| `src/cinematics/ending/OfficeReveal.tsx` | Preserves the Opening office perspective and reveals the question and theory. |
| `src/cinematics/ending/ending.css` | Styles only Ending, including a scale-independent checklist crop. |
| `src/cinematics/ending/EndingTheoryRevealSequence.tsx` | Owns playback, seek, completion and final handoff controls. |
| `src/cinematics/ending/EndingDevPreview.tsx` | Supplies inspection controls and visible notification counters. |
| `src/cinematics/ending/devInput.tsx` | Isolates sample results and approved reference crops from production. |
| `src/cinematics/ending/preview.css` | Styles the development controls outside the cinematic. |
| `src/cinematics/ending/StudioRoot.tsx` | Provides an independent frame inspection entry. |
| `scripts/test-ending.mjs` | Checks timeline coverage, reveal order, completion, upstream integrity and production isolation. |
| `docs/cinematics/CIN04_INTEGRATION.md` | Records provenance, file roles, integration and validation limits. |

## Validation and remaining limits

- Type checking and production build pass; the build reports existing
  Framer Motion ignored `use client` directive warnings.
- Five automated checks pass. Run the build before the test script, which inspects
  its output. The upstream integrity test uses source commits available locally.
- The timeline covers all 1746 frames at 30 fps: 58.2 seconds, 12 shots.
- Office artwork and first-person perspective are the original Opening assets.
- Development Level 3 images are approved reference crops, not the live CIN-03A
  renderer. Replace the injected memory component during final integration.
- Audio was not supplied. No narration or soundtrack has been invented.
- Design Lab is a development destination only. Gameplay and shared contracts
  are unchanged. Human visual approval remains pending.

### Browser screening (2026-10-20)

All 12 shot samples inspected in the actual browser. Normal-speed playback,
pause/resume, replay, seek, final-frame retention and Design Lab handoff verified.
Completion remains 1 after seeking backward and playing to the end again;
handoff reaches 1. Reduced-motion replay is separately screened.
The checklist framing fix is scoped to Ending and keeps the live pen and marks.

The local preview server had stopped across the interrupted session; restarting
it and reloading restored playback. Earlier connection/module-load errors belong
to that stopped-server state. Image decode warnings were logged while switching
scenes; inspected visible images loaded successfully and playback continued.
This is not a clean-warning browser run; final integration should recheck those
warnings in its target browser. No playback error alert appeared in the screening.

# CIN-03A checkpoint

Worktree: `/Users/mg/Documents/GitHub/gaming-the-system-level3a`
Branch: `feature/cinematic-level3-metric-adaptations`
Approved base: `05d0fda` (shared toolkit only; CIN-01/CIN-02 implementations are not on this branch).

## Implementation

- S01 entry, S02–S19 (six metrics × three intensities), S20 three-clip orchestration, S21 exit implemented.
- Supplied metric order and intensity are preserved. No weight calculation or gameplay progression.
- Existing `CinematicRequest` / `CinematicComplete` contract used unchanged. Completion is `animationComplete`, `cinematicId: level3`, echoing the request ID, once per request.
- Only the current clip is mounted. Original triptychs are cropped through viewports; captions and neighbouring states are excluded.
- Preparation: reading closes / reading plus task / multiple preparation requirements and notes.
- Participation: one / two / three editorial hand-raise beats with listening and reaction inserts.
- Focus: task → phone → task / phone put aside through a cut / sustained upright screen attention using corrected S10 art.
- Discussion: agreement / conversational exchange / sentence-stem consultation and return to classmates.
- Reflection: two lines and submission / fuller response with thinking pause / cumulative rubric-led revisions.
- Peer response: short reply / specific suggestion after reading / three posts with criteria checks.
- Reflection framing and criteria-paper placement adjusted after rendered inspection.
- DEV playback: pause, replay, seek, OS or manual reduced motion, four sequence fixtures, completion counter.

## Preview

Run `npm run dev -- --port 5176 --strictPort` from this worktree. npm runs the project's saved commands. Success prints the local URL; if it fails, retain the error text after the command heading.

Open `http://127.0.0.1:5176/level3a.html`.

Single-state queries use `?metric=<alias>&intensity=low|medium|high`:

| Alias | Official metric |
| --- | --- |
| preparation | Pre-class Preparation |
| participation | In-class Participation |
| focus | On-task Focus |
| discussion | In-class Discussion Quality |
| reflection | Learning Reflection Quality |
| peer-response | Online Peer Response Quality |

Sequences: `?sequence=mixed`, `?sequence=equal`, `?sequence=priority`, `?sequence=balanced`.
The mixed H/M/L fixture is deliberately synthetic and displays no percentages. A real 100% weighting cannot contain both a ≥67% High and a ≥34% Medium. Fixtures inject states; they do not classify weights.
For frame inspection add `&paused=1&t=2.8`; for reduced motion add `&reduced=1`.
The separate HTML/DEV entry leaves the shared game entry untouched and is absent from the normal production build.

## Verified provenance and asset usability

All copied files matched the originals byte-for-byte; original files were preserved. Paths below are relative to the worktree above.

| Source | Exact path / usability |
| --- | --- |
| Narrative V2 | `docs/game-design/GAMING THE SYSTEM_Narrative V2.pdf` — readable, approved title, six pages |
| Player flow V2 | `docs/game-design/Gaming_the_System_玩家路径与界面清单_v2.0.docx` — readable V2 |
| Mechanism V2 | `docs/game-design/Gaming_the_System_游戏机制与结果总览_v2.0(1).docx` — readable V2 |
| Storyboard | `docs/storyboard/Storyboard_CIN_03A_Level3_MetricAdaptations_v01.xlsx` — S01–S21 verified |
| Preparation reference | `docs/visual-style/references/level3-metric-adaptations/REF-L3A-001.png` — C: temporary single-shot plate |
| Participation reference | `docs/visual-style/references/level3-metric-adaptations/REF-L3A-002.png` — C: temporary single-shot plate |
| Focus reference | `docs/visual-style/references/level3-metric-adaptations/REF-L3A-003.png` — C for Low/Medium; original High not used |
| Discussion reference | `docs/visual-style/references/level3-metric-adaptations/REF-L3A-004.png` — C: temporary single-shot plate |
| Reflection reference | `docs/visual-style/references/level3-metric-adaptations/REF-L3A-005.png` — C: actor crop only; readable editor generated in code |
| Peer reference | `docs/visual-style/references/level3-metric-adaptations/REF-L3A-006.png` — C: actor crop only; readable forum generated in code |
| Corrected S10 | `docs/visual-style/references/level3-metric-adaptations/REF-L3A-S10 — High On-Task Focus.png` — C: approved upright seated scene plate; actual source filename differs from the originally typed underscore version |
| Global Alex | `assets/characters/CHAR-L1-001 — Alex Character Set.png` — B: flat identity/pose/expression reference sheet, not layered production art |
| Reading prop | `assets/props/PROP-L1-001 — Checklist : Reading Sheet.png` — C: notes insert / composition reference |
| Discussion prop | `assets/props/PROP-L1-003 — Discussion Sentence-Stem Card.png` — C: card insert / composition reference |
| Classroom | `assets/backgrounds/BG-002 — Classroom First-Person Background.png` — existing usable environment |

Existing `CinematicCamera`, `DialogueLayer`, `EnvironmentMotion`, `animationMath`, `useCinematicAudio`, shared contracts and reduced-motion hook reused. CharacterRig's generic test character is intentionally not substituted for Alex. Study, reflection and forum settings, laptops, phone and classmates come from approved scene plates. No artwork was generated or rewritten.

## Validation checkpoint

- Typecheck and normal production build passed; six timeline tests passed.
- Separate reusable-module build passed, checking CIN-03A asset imports that the normal game entry intentionally does not import.
- Browser inspection: all 18 normal and all 18 reduced-motion states loaded, three full real-time montages completed in order, pause froze an identical screenshot, seek/replay worked, and completion fired once. No runtime or missing-asset errors.
- Opening loaded successfully. CIN-01/CIN-02 integration regressions cannot be run from this deliberately isolated base; none of their files or other worktrees were changed.
- Captured rendered frames and browser test results: `.cache/cin3a/` (local, ignored).
- Final rendered framing review passed: all six metric contact sheets inspected; Reflection face remains visible and rubric stays below it. Technical checks rerun successfully after the framing fix.

## Limitations / integration handoff

- Human visual acceptance remains pending. This is cinematic editing of flat approved art, not independently rigged character animation.
- True Alex blink, eyebrow, mouth, hand, typing, phone, writing and arm layers, independent background-student layers, and a clean reusable study background would improve continuous acting. They were not generated. Attention/nods/pose changes are conveyed through cuts and visual emphasis where the art permits.
- Scene audio hooks accept recordings, but recordings were not supplied. Audible environment crossfades are not claimed as verified.
- Gameplay must supply all three intensities, weights and a unique request ID, own the playback clock, and accept the matching completion. CIN-03B is not imported or implemented.
- Dependencies reuse existing local package links; all build/test caches are local to this worktree. A normal checkout can use its usual dependency setup.

## Changed files and purpose

| File | Purpose |
| --- | --- |
| `level3a.html` | Independent preview page without changing the game entry. |
| `src/cinematics/level3/devEntry.tsx` | Loads preview controls only in development. |
| `src/cinematics/level3/adaptationTimeline.ts` | Approved dialogue, shot mapping and deterministic timing; no gameplay calculations. |
| `src/cinematics/level3/MetricAdaptationScene.tsx` | Eighteen visual states using approved artwork and readable props. |
| `src/cinematics/level3/MetricAdaptationSequence.tsx` | Entry, three supplied clips, transitions, exit and completion notification. |
| `src/cinematics/level3/Level3DevPreview.tsx` | State selection and playback controls for independent inspection. |
| `src/cinematics/level3/level3a.css` | Scene composition, character framing and prop placement. |
| `src/cinematics/level3/preview.css` | Development controls and responsive preview layout. |
| `tests/cinematics/level3a.test.ts` | Six timeline and state-contract checks. |
| `tests/cinematics/level3a.browser.mjs` | Actual browser playback, rendered states and control checks. |
| `tests/cinematics/level3a.build.mjs` | Independently bundles the module to verify its imports. |
| `docs/cinematics/CIN03A_CHECKPOINT.md` | Source provenance, validation and integration handoff. |
| Approved source documents and artwork listed above | Authorized copies keep this worktree self-contained; originals preserved. |

Status: READY FOR HUMAN REVIEW of the implemented flat-art cinematic presentation. Human visual acceptance, final gameplay integration and any future layered character animation remain separate. Push confirmation is reported with the final commit hash in the delivery message.

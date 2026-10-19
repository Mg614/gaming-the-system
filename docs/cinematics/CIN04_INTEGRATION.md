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

## Checkpoint

Approved sources, committed leaf components and their assets recovered.
Type checking passed before this checkpoint. Ending implementation follows.

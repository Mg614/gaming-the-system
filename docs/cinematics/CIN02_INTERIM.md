# CIN-02 — INTERIM validated infrastructure

This is an independently runnable consequence prototype, **not final CIN-02 cinematic completion**. Alex is present in approved flat classroom reference plates. No blink, gaze, expression, writing, page-handling or typing performance is implemented or claimed. Production gameplay is not connected.

## Scope and handoff

- `Level2ConsequencesSequence.tsx` accepts the existing shared `CinematicRequest`/`CinematicComplete` contract. The caller supplies elapsed seconds and an explicit result category; no metric classifier, scoring, Run button or gameplay store is added.
- `level2Timeline.ts` contains presentation timing and narrative. `three`, `six`, `10`, `25`, `100`, `final` are preview segment aliases, **not an agreed production phase protocol**.
- `ChecklistSystem.tsx`, `checklistPresentation.ts`, and `checklist.css` draw reusable paper props: 10 completes requirements and revisits an omission, 25 links reusable evidence to criteria, 100 starts with 88 covered criteria and closes twelve gaps in four passes. These numbers and evidence notes are illustration choreography, not gameplay calculations.
- `level2.css` supplies paper/screen perspective, lighting, composition and the priority handoff. Motion follows the supplied playhead. Sound hooks accept optional sources; no sound files are supplied, so the prototype is silent.
- `Level2DevPreview.tsx` and `preview.css` provide mock inputs, pause/replay, seeking, speed, callback diagnostics and a mock full chain. `main.tsx` excludes both development previews from production output. Shared tooling and Opening implementation are unchanged.
- Sources already audited: three approved documents in `docs/game-design/` and `docs/storyboard/Storyboard_CIN_02_Level2_MoreMetricsConsequences_v01.xlsx`. S04 is teammate-owned gameplay and intentionally absent. The full preview simulates the intervening gameplay handoffs.
- Original REF-L2-001/002/003 files are used unchanged. REF-L2-003 uses an inline import because its colon-containing filename is rejected by the development static-file guard. No replacement character art was created. REF-L2-004/005 remain composition references rather than production character layers.

## Run and verify

`npm` runs the project's predefined commands. No dependency installation is needed in the existing workspace.

| Command | Purpose / success | If it fails |
| --- | --- | --- |
| `npm run dev` | Starts the local development server; prints its local URL | Copy the error and file path |
| `npm run typecheck` | Checks code types; exits without errors | Copy the reported file, line and error |
| `npm run build` | Creates the production package; prints `built in ...` | Copy the first error and its context |
| `node --experimental-strip-types --test tests/cinematics/level2.test.ts` | Runs six tests with the existing Node 24 runtime; prints six passes | Copy the failing test and assertion |

Open `http://127.0.0.1:5173/?cinematic=level2&state=full` (use the port printed by the server).
States: `visible-heavy`, `quality-heavy`, `mixed-broad`, `six`, `10`, `25`, `100`, `final`, `full`.
Optional parameters: `paused=1`, `at=2.7`, `reduced=1`; the full chain also accepts `category=visible-heavy` or `category=quality-heavy`. Without the reduced-motion override, the system accessibility preference is used.

## Verification performed — 2026-10-18

- Typecheck PASS; production build PASS. Build reports dependency `use client` directive warnings, without build failure.
- Six automated tests PASS: shot ordering/limits; explicit category validation; monotonic bounded/replayable completion; distinct 10/25/100 choreography; evidence-before-mark timing and invalid progress; exact slider-compatible durations.
- Browser playback at 4×, from beginning to completion:

| Entry | Observed ending | Completion events |
| --- | --- | --- |
| visible-heavy | three-checklist, 3/3 | 1 |
| quality-heavy | three-checklist, 3/3 | 1 |
| mixed-broad | three-checklist, 3/3 | 1 |
| six | expand, 6/6 | 1 |
| 10 | ten, 10/10 | 1 |
| 25 | twenty-five, 25/25 | 1 |
| 100 | priority, 100/100 | 1 |
| final | priority, 100/100 | 1 |
| full | priority after all five mock segments | 5 unique request IDs |

- All eight standalone entries: reduced-motion rendering, seek to exact endpoint, re-render without duplicate completion, replay resetting events and returning to the first shot PASS. Full chain also played through in reduced-motion mode with five unique completions.
- Shared controls: paused frame markup remains unchanged, including camera/paper/environment/checklist; paused full-chain handoff stays on its completed segment; backward/forward keyboard seeking restores entry/pattern/checklist frames. Evidence stroke changes with the playhead. The browser automation range `fill` operation did not dispatch the application's input event, so seeking was verified using native keyboard actions instead.
- All referenced images loaded. No captured browser warnings/errors during CIN-02 runs. Existing shared cinematic demo loads. Production URL with the Level 2 query still shows Opening, with no preview controls; production output contains no Level 2 preview code/text.
- Visual inspection covered paper and laptop perspective, checklist density, reference character identity and palette. Camera/environment motion and checklist animation are present, but this does **not** establish natural character acting or final cinematic quality. Final composition, pacing at normal speed, responsive-device coverage, and performance with production audio still require review.

## Remaining production blockers

Supply approved, registered Alex production layers/poses for eyes and blinking, gaze/head direction, restrained facial expressions, checklist-hand/page interaction and laptop-hand interaction. A flattened reference sheet cannot provide independently movable features or missing occluded artwork. Reuse the existing Alex identity and approved angle/lighting. After these assets arrive, integrate performances locally, review the normal-speed film with the owner, then perform final validation. Teammate owns production gameplay integration and final merging.

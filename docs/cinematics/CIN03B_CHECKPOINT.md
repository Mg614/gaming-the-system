# CIN-03B checkpoint

Worktree: `/Users/mg/Documents/GitHub/gaming-the-system-level3b`
Branch: `feature/cinematic-level3-rebalance-compare`
Base: `05d0fda` (shared cinematic foundation).

## Current milestone

Implementation present for S01–S14; independent preview and regression tests added.
Component checks cover all three comparison paths, pause/resume/replay/seeking,
DEV result injection, reduced motion, once-only callbacks, exact supplied percentage
precision, camera continuity and identical S13/S14 comparison rendering.
Final typecheck, production build and all 18 tests passed, including the isolated
test-server configuration. No port collision remains.
An actual mobile comparison preview was inspected. Full browser playback remains
unverified because the browser connection lost its tab; repeated reconnects were
stopped. Human visual review and teammate integration remain required.

## Approved sources and preflight

All eight files were copied without overwriting files and matched their originals
byte-for-byte. Tests retain the verified SHA-256 digests.

| Source | Repository path | Finding |
| --- | --- | --- |
| Narrative V2 | `docs/game-design/GAMING THE SYSTEM_Narrative V2.pdf` | All six pages read; V2 title verified |
| Player Flow V2 | `docs/game-design/Gaming_the_System_玩家路径与界面清单_v2.0.docx` | Full document read; Mechanism Prototype V2, 2026-10-13 |
| Mechanism V2 | `docs/game-design/Gaming_the_System_游戏机制与结果总览_v2.0(1).docx` | Full document and diagrams read; approved revised adaptive flow |
| Storyboard | `docs/storyboard/Storyboard_CIN_03B_Level3_RebalanceAndCompare_v01.xlsx` | All six sheets read, S01–S14 present; asset sheets contain headers only |
| REF-L3B-001 | `docs/visual-style/references/level3-rebalance-compare/REF-L3B-001.png` | B: visual reference; C: text-free Alex crop usable as temporary DEV plate |
| REF-L3B-002 | `docs/visual-style/references/level3-rebalance-compare/REF-L3B-002.png` | B: visual reference; C: text-free behaviour crops usable as temporary DEV memories |
| REF-L3B-003 | `docs/visual-style/references/level3-rebalance-compare/REF-L3B-003.png` | B: visual reference only; composition guide, never displayed as final screen |
| Global Alex | `assets/characters/CHAR-L1-001 — Alex Character Set.png` | Flat identity sheet, visually inspected; not layered production art |

All images opened and inspected. Warm classroom lighting, dark tousled hair and
rust-orange hoodie agree. The example percentages and bar ordering communicate
the approved relationship. Repeated still poses do not prove different acting
intensities. Blue/amber colours and generated labels are not authoritative; all
meaningful labels and bars in this module are rendered in code in a neutral palette.

The mechanism is authoritative for rules, Player Flow for progression, Narrative
for dialogue and the storyboard for shot staging. Player Flow's near-equal UI
image says “Reveal the theory”, but its explicit progression requires comparison;
the implementation follows the written progression and storyboard. First-near-equal
does not invent a “before” result: S01 proceeds to S10. S09 is used after Test the
Limit or as an isolated supplied before/near-equal preview. S06 acknowledges real
improvement before going directly to Compare when both conditions are covered.

No effort formula or production Low/Medium/High thresholds are supplied by the
mechanism document. The preview explicitly supplies illustrative magnitudes and
intensities, including the storyboard's three Medium states for 34/33/33.

## Reuse and ownership

Uses existing `CinematicCamera`, `DialogueLayer`, `EnvironmentMotion`,
`useCinematicAudio`, timing helpers and Framer Motion frame playback. The existing
`CharacterRig` was inspected but is not used to pretend a flat sheet is a rig.
The committed classroom background remains visible. Baseline typecheck and build
passed before implementation. There are no new package dependencies.

No existing source files, shared contracts, gameplay, other cinematic modules or
normal game entry points are changed. The separate `cin03b.html` entry is served
only for development and is absent from the normal production build. Its dynamic
preview import is also guarded by `import.meta.env.DEV`.

## Preview and tests

Start the existing development server with `npm run dev -- --port 5183 --strictPort`.
Open `http://127.0.0.1:5183/cin03b.html?scenario=rebalance`.
Scenario values: `rebalance`, `limit`, `contrast`, `first`, `near-equal`, `compare`,
`handoff`. The last simulates a CIN-03A completion; it is not real integration.
Use the DEV injection buttons at gameplay boundaries. Pause, replay, shot selection,
within-shot seeking and a reduced-motion override are available. System reduced
motion is also respected. Final comparison remains held without a fade or reset.

Checks: `npm run typecheck`, `npm run build`, and
`node --test tests/cinematics/level3b.test.mjs tests/cinematics/level3b-lifecycle.test.mjs`.
The regression test also bundles the isolated presentation as a production library
in memory, verifying that the DEV fixtures and reference plates are excluded.

## Proposed handoff, pending teammate integration

`Level3RebalanceCompareSequence` accepts a `requestId`, externally chosen `frame`,
the same `selectedMetrics` tuple for all snapshots, an `elapsed` shot time and a
`BehaviourPresentation` adapter. It does not navigate gameplay or choose a branch.
`devScenarios.ts` is the only flow selector and uses supplied category labels.

The local types reuse shared `MetricId` and `Intensity`; the shared contract is
unchanged. Local outcome labels `uneven` / `near-equal` match the approved comparison
conditions. Each result supplies weights, illustrative/supplied effort magnitudes
on a 0..1 display scale and intensity. No result category or effort is calculated.

The adapter provides `Memory`, `Adaptation` and optional `hero`. Adaptation receives
the selected metrics, the supplied result, elapsed time, pause/reduced-motion state
and a completion callback. Adaptation shots cannot finish just because a timer
expired; they wait for this callback. Late callbacks from an old shot are ignored.

Timed shots emit `onShotComplete`; S03/S07/S10 emit `onHandoff` and remain visible.
The host must wait for actual gameplay output before supplying the next shot.
S14 emits `compare_patterns_complete` once for its request and includes the two
comparison snapshots. Keep the component mounted on S14 while CIN-04 begins.
No Ending dialogue, Goodhart reveal or third slider round is included.

## Asset and integration gaps

- Reusable presentation: animated supplied effort bars, result snapshots,
  matched comparison, all storyboard beats, controlled handoffs, reduced motion.
- Reference-only: approved comparison boards and flat Alex character sheet.
- DEV fallback: existing reference crops with subtle crop/pan; one nine-second
  temporary adapter, no duplicated 18-state behaviour system.
- Pending: actual CIN-03A clips/snapshots, gameplay outputs and all gameplay controls,
  real Test the Limit trigger and CIN-04 event consumer. No actual integration claim.
- Audio: optional existing hook is connected; this foundation has no audio files
  for these cues, so the preview is silent. Real sound beds remain an integration task.
- Optional comparison audio keeps the same cue through S12–S14 without restarting
  at shot boundaries. Audible continuity cannot be verified without a suitable asset.
- Human visual acceptance remains required.

## Added files and purpose

All paths below are new; existing modules and package/lock files are unchanged.

| File | Purpose |
| --- | --- |
| `cin03b.html` | Independent development preview entry |
| `src/cinematics/level3b/types.ts` | Input and handoff shapes without gameplay rules |
| `src/cinematics/level3b/presentation.ts` | Shot timing, copy and continuous camera framing |
| `src/cinematics/level3b/ResultVisuals.tsx` | Supplied weights and effort visuals, preserving decimals |
| `src/cinematics/level3b/Level3RebalanceCompareSequence.tsx` | S01–S14 presentation and once-only handoffs |
| `src/cinematics/level3b/level3b.css` | Cinematic layout and responsive styling |
| `src/cinematics/level3b/DevBehaviourAdapter.tsx` | Temporary independent reference-based acting preview |
| `src/cinematics/level3b/devScenarios.ts` | Illustrative inputs for each development path |
| `src/cinematics/level3b/DevPreview.tsx` | Preview playback, seeking and result injection |
| `src/cinematics/level3b/preview.css` | Development controls styling |
| `src/cinematics/level3b/dev.tsx` | Development-only loading guard |
| `tests/cinematics/level3b.test.mjs` | Source integrity, precision, paths and production isolation checks |
| `tests/cinematics/level3b-lifecycle.test.mjs` | Actual component playback/control/callback regression checks |
| `docs/cinematics/CIN03B_CHECKPOINT.md` | Source evidence, preview instructions and integration limitations |

The eight approved source copies are listed above with their original role.
The lifecycle suite caches a matching test renderer locally under ignored `.cache`;
it downloads that test tool on first run without changing project dependencies.

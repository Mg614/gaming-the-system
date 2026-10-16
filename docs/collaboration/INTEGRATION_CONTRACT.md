# Integration contract

Gameplay owns decisions and calculated outcomes. Cinematics present the supplied
state and report completion. Shared contracts are small data interfaces, not a
second rules engine. The new types are not connected to the existing opening yet.

| Gameplay owns | Cinematics owns |
| --- | --- |
| Player choices, selected metrics, prediction text, weights | Camera movement, character animation, micro-expression |
| Game rules, calculations, branching logic, progression state | Visual consequences, cinematic timing, dialogue presentation, transition effects |

Cinematics MUST NOT independently recalculate game mechanics, choose a branch,
change weights, or update progression. Gameplay MUST NOT duplicate cinematic
implementation. Player interactions inside a cinematic may report an action;
gameplay decides its mechanical meaning.

## Communication

```text
Gameplay → CinematicRequest → cinematic plays supplied state
         ← onComplete(CinematicComplete) ← animation finishes
Gameplay validates the completion and continues
```

The integration layer in `src/scenes/` will pass an immutable request snapshot to
the cinematic and route its completion callback to gameplay. Gameplay issues a
unique `requestId` for each run. A rerender must not replay the same request.
Cinematics emit `animationComplete` once after the sequence finishes, echoing
`requestId` and `cinematicId`; unmounting or interruption is not completion.
Gameplay accepts only the matching active request, ignores stale/duplicate
completions and owns the next progression step. A future skip/cancel policy needs
an explicit contract change; it is not silently treated as completion.

## Shared types

Canonical definitions: `src/shared/contracts/index.ts`. Import with `import type`
so this layer carries no runtime behavior. No equivalent metric/level contracts
exist in the current implementation; local opening `Beat`, classroom `Phase`,
student IDs and audio cues remain private and are not replacements for these types.

| Concept | Input from gameplay | Cinematic responsibility |
| --- | --- | --- |
| Level 1 | `selectedMetric`, `playerPrediction`, `runRequested`, optional `resultCategory` | Present supplied selection/result; emit completion |
| Level 2 | `selectedMetrics`, measurement `phase`, optional `resultCategory` | Present supplied phase/result; emit completion |
| Level 3 | `selectedMetrics`, `weights`, optional per-metric `effort` / `intensity` | Present supplied Low / Medium / High states; emit completion |

`GameLevel` is 1, 2 or 3. `CinematicId` reserves `opening`, `level1`, `level2`,
`level3`; a request's ID determines its input type and matching level. The
`opening` variant reserves a player-name handoff for future integration; it does
not replace or wrap the current opening, which collects its own name.
`CinematicResult` is an alias for `CinematicComplete`, not a gameplay result.

Official metric IDs (do not create alternative spellings):

- `pre-class-preparation`
- `in-class-participation`
- `on-task-focus`
- `in-class-discussion-quality`
- `learning-reflection-quality`
- `online-peer-response-quality`

The V2 documents are not yet in this checkout. Therefore measurement phases and
result categories are opaque gameplay-owned strings, not invented enumerations.
Weight units, allowed totals, selection counts, effort calculations, and whether
both effort/intensity fields are needed remain governed by the approved mechanism
document. Gameplay validates them before issuing a request. Optional outcome
fields mean “not supplied,” never zero or a default category. A cinematic needing
an outcome must wait for that outcome from gameplay; it must not calculate one.
Level 1's `runRequested` records gameplay's run intent; it is not permission for
cinematics to calculate a result. No narrative timing or animation logic belongs
in these interfaces. Narrow provisional fields together when V2 is available.

## Existing implementation and safe extension points

| Current location (preserved) | Conceptual responsibility |
| --- | --- |
| `src/App.tsx` | Existing opening and scene integration: name, beats, camera, email, classroom handoff, replay |
| `src/ClassroomScene.tsx` | Existing classroom cinematic plus local inspection/progression and `onReturn` callback |
| `src/ClassroomAmbient.tsx` | Cinematic environment playback and static fallback |
| `src/classroomMedia.ts` | Classroom media configuration, composition and current dialogue |
| `src/useSceneAudio.ts` | Shared cinematic audio lifecycle |
| `src/styles.css` | Existing shared presentation styles |
| `src/main.tsx` | Existing application entry |

These files are a working legacy boundary, not a mandate to mix future systems.
The completed opening is left in place. Its existing `onReturn` callback is not
silently replaced by the new contract. Add new gameplay under `src/game/`, new
cinematics under `src/cinematics/`, and future wiring under `src/scenes/`.
Do not import gameplay internals into cinematics or the reverse: depend on shared
contracts. Keep neutral reusable UI in `src/components/`, shared non-contract
types in `src/shared/types/`, and genuinely shared constants in
`src/shared/constants/`; do not duplicate metric IDs there.

Before changing a contract, agree the change with the other collaborator, update
its consumers and this document together, and describe compatibility in the PR
(Pull Request: a proposed change reviewed before merging). Coordinate edits to
the existing integration files rather than moving the completed opening merely
to fit the directory diagram.

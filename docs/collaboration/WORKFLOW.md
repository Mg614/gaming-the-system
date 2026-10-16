# Collaboration workflow

Git records file versions; a branch is an independent line of work. `main` is the
stable integrated version. Never force-push, rewrite history, overwrite unfamiliar
collaborator changes, or automatically merge into `main`.

1. Inspect the current branch and working files. Preserve unfinished work before
   switching branches. If a conflict is unclear, report it instead of discarding it.
2. Before a new feature, update local `main` from GitHub using a fast-forward-only
   pull, then branch from it. If it cannot fast-forward, stop and inspect the
   divergence. Do not merge `main` into someone else's unfinished work blindly.
3. Keep major work on feature branches. Agree shared-contract changes first. Work
   primarily in your area's folders; coordinate changes to existing opening files.
4. Where practical, one task makes one logical commit (a saved set of changes).
   Review the file list and diff (the before/after comparison) before committing.
5. Run relevant checks before committing and pushing; rerun if code changes after
   the checks. The existing build performs type checking and production bundling;
   there is currently no automated test script. Check affected scenes in a browser.
6. Push only the current feature/integration branch. Large features merge through
   a Pull Request (a reviewable proposal to combine changes). Describe contract
   changes and integration risks using the repository template. Do not auto-merge.

| Work | Recommended branch names |
| --- | --- |
| Gameplay collaborator A | `feature/gameplay-level1`, `feature/gameplay-level2`, `feature/gameplay-level3` |
| Cinematic collaborator B | `feature/cinematic-level1`, `feature/cinematic-level2`, `feature/cinematic-level3` |
| Joint integration | `integration/level1`, `integration/level2`, `integration/level3` |

Choose one person to wire a level in `src/scenes/`. Both collaborators may overlap;
folder ownership guides coordination, not exclusive access. Keep mechanic changes
in `src/game/`, presentation in `src/cinematics/`, and agreed interfaces in
`src/shared/contracts/`. See [integration contract](INTEGRATION_CONTRACT.md) and
[source of truth](SOURCE_OF_TRUTH.md).

Likely conflict points: `src/App.tsx`, `src/ClassroomScene.tsx`,
`src/classroomMedia.ts`, `src/styles.css`, `src/useSceneAudio.ts`,
`src/shared/contracts/index.ts`, `src/scenes/`, `README.md`, `package.json`, and
`package-lock.json`. Coordinate edits, avoid unrelated formatting, and do not
regenerate dependencies during a narrative-only change.

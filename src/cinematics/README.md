# Cinematic boundary

New level sequences belong in `level1/`, `level2/`, and `level3/`; reusable
cinematic presentation belongs in `shared/`. These are reserved directories.
Consume gameplay snapshots via shared contracts and emit completion events;
never calculate gameplay outcomes here.

`opening/` is reserved for future work only. The implemented opening remains in
`../App.tsx`, `../ClassroomScene.tsx`, `../ClassroomAmbient.tsx`,
`../classroomMedia.ts`, `../useSceneAudio.ts`, and `../styles.css`.
Do not create a competing opening or move these files just to fill this folder.
See `../../docs/collaboration/INTEGRATION_CONTRACT.md` for the current mapping.

# Source of truth

Use this order for authority within each document's responsibility:

1. **Current game mechanism / result overview V2** — gameplay mechanics, rules,
   calculations, and outcome definitions.
2. **Current player flow / UI list V2** — player interaction flow.
3. **Narrative V2** — narrative and cinematic direction.
4. **Existing implemented opening** — current working implementation; preserve it
   and do not replace it casually.
5. **Storyboards / references / assets** — implementation guidance for individual
   scenes.

The three V2 documents above were not found in this checkout. These titles record
their intended authority, not a claim that their contents have been verified.
Before implementing new rules or narrowing provisional contract fields, obtain
the approved versions and record their actual locations/revisions here. Do not
invent mechanics from screenshots or from the placeholder interfaces.

The current opening lives in `src/App.tsx`, `src/ClassroomScene.tsx`,
`src/ClassroomAmbient.tsx`, `src/classroomMedia.ts`, `src/useSceneAudio.ts`, and
`src/styles.css`. Current scene guidance lives under `docs/storyboard/` and
`docs/visual-style/references/`; production media lives under `assets/`.
Existing README notes describe the working prototype and known media limitations.

Prototype UI screenshots are **not pixel-perfect visual requirements**. The final
implementation may use a more cinematic presentation while preserving the
underlying interaction logic. Cinematic presentation does not authorize changing
rules or player choices. If sources conflict, identify the conflicting rule and
confirm the intended behavior before changing a completed scene; preserve the
current working opening while the conflict is unresolved.

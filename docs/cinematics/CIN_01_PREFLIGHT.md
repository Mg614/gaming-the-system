# CIN-01 pre-flight and asset inventory

Audit date: 2026-10-18. Result: PASS for an independent cinematic prototype with the documented plate fallback. No gameplay integration is authorized in this phase.

## Isolation

- Original worktree: `/Users/mg/Documents/GitHub/gaming-the-system`, branch `feature/cinematic-level2-consequences`.
- CIN-01 worktree: `/Users/mg/Documents/GitHub/gaming-the-system-level1`, branch `feature/cinematic-level1-consequences`.
- Base: `chore/collaboration-architecture` at `05d0fda6a4cbac3c73ea8f65e1eeccd0b3beb5fa`. This committed version contains the shared toolkit, Remotion, and the completed opening. `main` lacks the toolkit.
- New worktree was clean before adding CIN-01 inputs. No Level 2 code was copied. The original branch, status, and hashes of all nine original `src/main.tsx` / `src/cinematics/level2/` files matched immediately after creation.
- Known user-supplied CIN-01 assets/documents are copied into the independent checkout at their original repository-relative paths. Originals are untouched. This is checkout isolation, not asset reorganization.

## Approved sources — all read

All paths below are relative to `/Users/mg/Documents/GitHub/gaming-the-system-level1/`.

| Source | Exact path | Use |
| --- | --- | --- |
| Mechanism V2 | `docs/game-design/Gaming_the_System_游戏机制与结果总览_v2.0(1).docx` | Official one-metric mechanism; no calculations implemented here |
| Player Flow V2 | `docs/game-design/Gaming_the_System_玩家路径与界面清单_v2.0.docx` | One selected branch, reflection, later gameplay handoff |
| Narrative V2 | `docs/game-design/GAMING THE SYSTEM_Narrative V2.pdf` | Behaviour, exact dialogue, tone |
| Storyboard | `docs/storyboard/Storyboard_CIN_01_Level1_SixBehaviourConsequences_v01.xlsx` | All six sheets read; 21 shot definitions in each language; asset-list tabs contain headers only |

Source differences resolved by the approved priority and current task: Maya becomes the off-screen player; envelope becomes the existing electronic email; only the selected metric is green; conceptual production events remain independent preview inputs/completion callbacks for now. No unresolved contradiction.

## Found images and usability

A = usable directly; B = reference only; C = temporary scene plate / fallback; D = wrong, corrupt, or unusable. Every listed image was opened visually and its dimensions/format checked. No D images found.

| Exact path | Class | Intended use |
| --- | --- | --- |
| `docs/visual-style/references/Level1 - Six Behaviour Consequences/REF-L1-001 — Pre-class Preparation.png` | C | Study staging; checklist/detail camera framing |
| `docs/visual-style/references/Level1 - Six Behaviour Consequences/REF-L1-002 — In-class Participation.png` | C | Classroom staging and hand-raised attention beats |
| `docs/visual-style/references/Level1 - Six Behaviour Consequences/REF-L1-003 — On-task Focus.png` | C | Disciplined classroom; unchanged-task screen insert |
| `docs/visual-style/references/Level1 - Six Behaviour Consequences/REF-L1-004 — Discussion Quality.png` | C | Group discussion; coded sentence-stem text |
| `docs/visual-style/references/Level1 - Six Behaviour Consequences/REF-L1-005 — Learning Reflection.png` | C | Shared desk world; coded reflection screen |
| `docs/visual-style/references/Level1 - Six Behaviour Consequences/REF-L1-006 — Online Peer Response.png` | C | Shared desk world; coded forum and criteria |
| `docs/visual-style/references/Level1 - Six Behaviour Consequences/REF-L1-007 — Success vs Unease Ending.png` | B | Emotional contrast only; do not copy its fixed Claire name, visible seated character, or six successful metrics |
| `assets/characters/CHAR-L1-001 — Alex Character Set.png` | B | Identity/expression/pose continuity: composite 1536×1024 RGB sheet, opaque white ground, not separated animation layers |
| `assets/props/PROP-L1-001 — Checklist : Reading Sheet.png` | B/C | Physical paper design and checklist/reading detail reference; composite opaque sheet |
| `assets/props/PROP-L1-003 — Discussion Sentence-Stem Card.png` | B/C | Physical card design; composite sheet, alpha range 172–252, not an isolated transparent prop |
| `assets/backgrounds/BG-002 — Classroom First-Person Background.png` | A | Reusable empty classroom, same university world |
| `assets/backgrounds/BG_Office_FirstPerson_v01.png` | A | Reuse completed first-person office with original laptop placement |
| `assets/characters/CHAR-001 — Sleeping Student Idle.png` | A, limited | Existing classroom art with desk and glow; unsuitable for a newly disciplined-classroom action |
| `assets/characters/CHAR-003 — Phone Student Idle.png` | A, limited | Existing classroom art with desk; not an Alex face/arm rig |
| `assets/characters/CHAR-005 — Unprepared Student Idle.png` | A, limited | Existing classroom art with desk; no independent facial layers |

All seven references are 1672×941 RGB. Alex remains a university-age student with dark tousled hair and rust-orange hoodie. Lighting, linework and proportions are consistent. Perspective/expression differences are shot differences, not different characters.

## Existing toolkit — inspected, no duplicates

| Capability | Exact path |
| --- | --- |
| Layered rig (demo art, not Alex) | `src/cinematics/shared/engine/CharacterRig/CharacterRig.tsx` |
| Camera and presets | `src/cinematics/shared/engine/CinematicCamera/CinematicCamera.tsx` |
| Dialogue | `src/cinematics/shared/engine/DialogueLayer/DialogueLayer.tsx` |
| Environment | `src/cinematics/shared/engine/EnvironmentMotion/EnvironmentMotion.tsx` |
| Interactive irregular blink | `src/cinematics/shared/engine/timeline/useIrregularBlink.ts` |
| Deterministic pulse/clamp/seed helpers | `src/cinematics/shared/engine/timeline/animationMath.ts` |
| Gaze/expression/arm types | `src/cinematics/shared/engine/types.ts` (gaze offsets are inside CharacterRig) |
| Optional cinematic sound sources | `src/cinematics/shared/engine/audio/useCinematicAudio.ts` |
| Existing office/classroom sound lifecycle | `src/useSceneAudio.ts` |
| Remotion Studio registry | `src/cinematics/remotion/Root.tsx` |
| Existing demo | `src/cinematics/CinematicToolingDemo.tsx` |
| Query preview entry | `src/main.tsx` |
| Shared contract / official metric IDs | `src/shared/contracts/index.ts` |
| Existing email presentation | `src/App.tsx` and `src/styles.css` (`email`, `mail-bar`, `laptop-screen` etc.) |

Framer Motion and Remotion are already installed. Baseline typecheck passes. Existing opening/classroom implementations remain in place. No standalone dashboard component or laptop-screen mask asset exists; code-rendered presentation may be added inside CIN-01 only. The collaboration documents' earlier “V2 not found” notes describe the old checkout and are superseded for this audit by the verified source paths above; no shared contracts are changed.

## Missing / fallback decision

| Missing production material | Can proceed? | Prototype fallback |
| --- | --- | --- |
| Alex aligned head/body, open/blink/directional eyes, eyebrows, mouth states | Yes | Camera/reaction holds and scene plates; no claim of true facial rigging or lip sync |
| Alex isolated arm-up/down, writing/checking, hand/checklist poses | Yes | Restrained plate attention/reframing and code-rendered prop actions; actual repeated anatomical arm motion needs new layers |
| Independent transparent checklist and sentence card | Yes | Code-rendered readable paper/card, guided by existing prop sheets |
| Laptop masks / separate laptop | Yes | Perspective-aligned code screen, no source-image edits |
| Independent attentive background students, heads/hands/pages | Yes | Subtle asynchronous environment/detail movement; no synchronized crowd rig |
| Final ambience / ticks / typing / notification audio | Yes | Existing optional sound hooks; missing sources play silently |

No essential source is missing. No external image/video generation, paid service, destructive crop, source overwrite, gameplay calculation or production wiring is authorized.

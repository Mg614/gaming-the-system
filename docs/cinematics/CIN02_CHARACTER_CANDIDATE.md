# CIN-02 — integrated character candidate

Checkpoint date: 2026-10-19 (Asia/Hong_Kong). Continues `5aa914f` on
`feature/cinematic-level2-consequences`. This is a candidate for human visual
acceptance, not final gameplay integration. The earlier infrastructure report in
`CIN02_INTERIM.md` is historical.

## What changed

- Reuse `AlexCheckingSequence` for the three-metric action, a shorter six-metric
  insert and progressively condensed 10/25/100 inserts. No new animation engine.
- ChecklistSystem still draws every dynamic checkmark. Its presentation helper
  supplies the real active criterion and stroke to the pen. The insert reframes
  that actual checkbox and keeps the sleeve entering from outside the shot.
- 25 and 100 retain the existing evidence batches and gap-closing choreography.
  One pen illustrates the first criterion of a linked batch; evidence links
  continue to cover the other criteria. This is visual choreography, not scoring.
- Neutral and pleased reactions keep a fixed torso, using a small mouth-region
  mask for the smile. Irregular blinking uses a local eye mask. Uncertainty uses
  a motivated tighter cut after a pause; an attempted face dissolve was removed
  after rendered inspection showed eye ghosting. No independent eye/face rigging
  is claimed. Breathing and all expressions follow supplied time.
- Three-metric dialogue wording, shot order and total duration are preserved;
  its lines are retimed so the completed claim follows the checking action.
- Perfect Checklist holds confidence before reflection; the live 100/100 paper
  remains visible beside Alex. No gameplay, shared contracts, Opening, other
  cinematic modules, dependencies or original source images were changed.

## Assets used

Existing: ALEX-PROD-005-CLEAN, ALEX-HAND-CHECKING, ALEX-PROD-003.
Newly referenced: ALEX-PROD-001 (neutral), 002 (blink), 004 (uncertain).
CHAR-L1-001 remains the identity reference. No artwork regenerated.

## Verification

- Typecheck and production build PASS; dependency `use client` warnings remain
  non-blocking. Eight targeted tests PASS (the original six plus integration
  progression/pen-state and pause/seek/expression timing checks).
- Actual browser playback at 4× PASS for visible-heavy, quality-heavy,
  mixed-broad, six, 10, 25, 100 and final: one completion per entry.
- Full chain playback PASS: five distinct request IDs, each completing once.
- All nine standalone entries including Checking: reduced-motion seeking to the
  endpoint PASS, rerender does not duplicate completion, replay clears completion.
- Final sequence also played at normal speed to one completion.
- Rendered inspection covered the contact insert, satisfied smile, blinking,
  uncertainty cut and enlarged 25/100 paper. Paper heights were corrected after
  small-window inspection exposed crowded rows. No captured browser warnings or
  errors during these runs. This is not comprehensive device/performance QA.
- Production build excludes the development-only preview; final visual approval
  and real gameplay handoff remain with the owner/team.

## Preview

Use the existing local server:
`http://127.0.0.1:5173/?cinematic=level2&state=full`.
The separate `state=checking` entry remains available. `paused=1`, `at=...` and
`reduced=1` are the existing playback inspection parameters.

No audio assets have been supplied. Existing optional sound hooks remain wired;
writing/ambience audio cannot be accepted as verified audible output.

Additional browser checks: fixed-playhead blink markup stayed unchanged while
paused; reduced-motion full chain completed with five unique handoffs.

## 改动文件说明

| 文件 | 为什么改 |
| --- | --- |
| `src/cinematics/level2/AlexCheckingSequence.tsx` | 原片段增加数量、进度参数；镜头跟随实际方框，复用持笔动作。 |
| `src/cinematics/level2/alexChecking.css` | 调整放大的纸张与行距，让不同密度下的目标仍清楚可见。 |
| `src/cinematics/level2/AlexPerformance.tsx` | 用现有素材呈现眨眼、满意和停顿后的不确定表情。 |
| `src/cinematics/level2/alexPerformance.css` | 限制局部素材显示范围，并设置反应近景。 |
| `src/cinematics/level2/level2Performance.ts` | 把场景时间映射为动作、表情和短镜头，不另设计时器。 |
| `src/cinematics/level2/checklistPresentation.ts` | 从已有清单状态取得笔尖应跟随的方框和勾线位置。 |
| `src/cinematics/level2/Level2ConsequencesSequence.tsx` | 把动作和反应接入现有 Level 2，沿用完成通知。 |
| `src/cinematics/level2/level2Timeline.ts` | 只调整三项分支对白时间，让宣告完成出现在落笔之后。 |
| `src/cinematics/level2/level2.css` | 反思时给 Alex 脸部留空间，保留旁边的真实清单。 |
| `src/cinematics/level2/Level2DevPreview.tsx` | 更新候选版状态说明。 |
| `tests/cinematics/level2.test.ts` | 检查递进节奏、笔尖状态和按时间还原表情。 |
| 本文件 | 记录实际验证、素材使用与仍待人工验收的限制。 |
| `ALEX-PROD-001`／`002`／`004` 原始图片 | 新代码实际引用的中性、眨眼、不确定素材，原图未修改。 |

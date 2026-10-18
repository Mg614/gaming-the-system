# CIN-01 — Level 1 Six Behaviour Consequences

独立叙事原型，约 33.4 秒。开发目录是 `/Users/mg/Documents/GitHub/gaming-the-system-level1`，分支是 `feature/cinematic-level1-consequences`。分支是一条独立的版本记录；原 Level 2 目录不参与本任务的修改、保存或推送。

源文档、完整分镜、7 张参考图、角色、道具与工具的实际路径及可用性分类见 [预检清单](CIN_01_PREFLIGHT.md)。三份 V2 已阅读；所有图已打开检查。素材原件不变。

## 播放与预览

开发预览入口沿用现有地址参数，只在开发模式提供。正式构建不包含 Level 1 预览界面或本模块的场景图。当前没有接入同伴玩法。

本任务已运行本地预览，打开下面任一链接即可：

| 内容 | 预览地址 |
| --- | --- |
| 课前准备 | http://127.0.0.1:5176/?cinematic=level1&metric=pre-class-preparation |
| 课堂参与 | http://127.0.0.1:5176/?cinematic=level1&metric=in-class-participation |
| 任务专注 | http://127.0.0.1:5176/?cinematic=level1&metric=on-task-focus |
| 讨论质量 | http://127.0.0.1:5176/?cinematic=level1&metric=in-class-discussion-quality |
| 学习反思 | http://127.0.0.1:5176/?cinematic=level1&metric=learning-reflection-quality |
| 同伴回应 | http://127.0.0.1:5176/?cinematic=level1&metric=online-peer-response-quality |
| 共同结尾 | http://127.0.0.1:5176/?cinematic=level1&metric=pre-class-preparation&part=common |
| 办公室反思 | http://127.0.0.1:5176/?cinematic=level1&metric=pre-class-preparation&part=office |

地址可增加 `&name=Lin` 测试邮件称呼，或增加 `&motion=reduced` 测试减少动态效果。姓名留空时使用 “Great work!”。可选 `prediction` 参数只测试输入回显，不生成玩家预测。预览页可切换分支、段落、姓名、减少动态效果；播放器可暂停、拖动、全屏。下方 Jump to second 支持 0.1 秒步进。

若本地预览已停止，在这个独立目录中运行：

```sh
cd /Users/mg/Documents/GitHub/gaming-the-system-level1
npm run dev -- --port=5176 --strictPort
```

`cd` 把终端定位到本任务目录；成功后后续命令就在这里执行。`npm` 是项目的命令与依赖管理工具；这条命令启动本地预览，成功应显示 `http://127.0.0.1:5176/`。失败时复制从 `Error` 开始到末尾的报错；若提示端口占用，已有预览可能仍在运行，不要结束其他任务的服务。

## 一个输入，一条分支，共用结尾

`level1Content.ts` 的 `branches` 使用共享定义中的六个官方指标名称作为键，保存各自画面和三句原文。输入指定哪个名称，就只呈现对应分支；动画不选择指标、不计算结果。

`Level1Composition.tsx` 的时间顺序：

1. 0–12.6 秒：一个所选分支。先观察，再由 Alex 表示成功，玩家追问，停顿后 Alex 说明自己的策略。
2. 12.6–16.6 秒：同一份 `CommonEnding`。从实际分支轻柔转到共用的 Alex 正面课堂画面，播放原文 “Professor! I figured out exactly what you were looking for!”。
3. 16.6–33.4 秒：同一份 `SomethingFeelsWrong`。回到原办公室、管理层邮件、仅所选指标的绿色成功状态、内心独白、实际分支的一次 0.9 秒回忆、第二段独白、不可点击的六指标提示与过渡问题。

每条分支镜头都缓慢推进、重构取景，并在追问和回答之间保留停顿。字幕来自代码，不写入图片。

| 分支 / 参考图 | 额外动态 | 当前人物限制 |
| --- | --- | --- |
| 课前准备 / REF-L1-001 | 清单最后两项依次勾选；纸张透视贴合；原手部遮挡保留 | 无独立持笔手与眼神图层 |
| 课堂参与 / REF-L1-002 | 三次不等间隔的镜头注意力变化、微弱环境光 | 手保持素材中的举起姿势；尚不是真正反复举手/放下 |
| 任务专注 / REF-L1-003 | 原墙面投影上的固定任务和微动光标，空白笔记保持不变 | 原图电脑背面对镜头，因此不在电脑背面画屏幕 |
| 讨论质量 / REF-L1-004 | 持卡表面的程序文字与句型强调；手指遮挡保留 | 无独立视线、说话嘴型或同伴头部动作 |
| 学习反思 / REF-L1-005 | 贴合电脑的反思表单逐段填写，追问时停止，光标仍闪烁 | 无独立打字手/抬眉图层 |
| 同伴回应 / REF-L1-006 | 贴合电脑的论坛、逐字回应和依次勾选的标准 | 无独立打字手与目光切换 |

共同结尾复用 REF-L1-002 的 Alex 课堂画面作为临时镜头。REF-L1-007 仅指导“系统成功但玩家不安”的氛围，不加载其写死姓名、可见主角和六项都成功的画面。

## 可复用工具

沿用 `CinematicCamera`、`DialogueLayer`、`EnvironmentMotion` 和已有的 `pulse`、`clamp01` 等数学工具。Remotion 是按帧控制时间的现有工具，主时间线和工作台预览共用 `Level1Composition`，没有第二套动画系统。Framer Motion 是现有的即时界面动画工具，只用于预览页及减少动态效果偏好。

现有 `CharacterRig`、不规则眨眼和目光能力已经检查：它们需要匹配的独立人物图层。当前 Alex 是完整参考总图，因此没有把测试用人物冒充 Alex，也没有声称完成面部绑定、嘴型同步或真实手臂动作。当前环境微动是光影，尚非有独立动作的背景学生。

办公室复用原背景、笔记本位置、镜头数值、邮件的结构与样式。音效沿用 `useSceneAudio` 的办公室/课堂及通知接口；当前没有最终音效文件，缺少的音效会安静跳过。

## 将来的交接边界

`Level1ConsequenceSequence` 接收共享定义的 Level 1 `CinematicRequest`，将输入固定为一次播放快照；相同请求的重新显示不会重选或重播。`playerName` 作为局部展示参数传入，不改共享定义。

只有完整播放真正结束，才发送一次 `{ type: 'animationComplete', requestId, cinematicId: 'level1' }`。暂停、卸载、加载失败和局部片段预览不发送该完成事件。重新看同一请求也不会重复发送；开发页的 New preview run 明确创建一个新请求。

这里没有玩法状态、指标选择、预测输入、Run、分数计算或 Level 2 交互。原开场不连接本模块。将来两人整合时，需要在约定的场景连接层传入请求，并检查请求编号再推进；本次只验证独立预览的完成回调。

## 文件变化及原因

| 文件 | 原因 |
| --- | --- |
| `src/main.tsx`（本独立目录内） | 在原查询预览机制下增加仅开发模式启用的入口 |
| `src/cinematics/remotion/Root.tsx` | 在原工作台注册同一份 Level 1 时间线 |
| `src/cinematics/level1/level1Content.ts` | 六指标到画面/原文的映射与时间常量 |
| `src/cinematics/level1/ConsequenceScene.tsx` | 六分支共用镜头，按所选指标呈现场景细节 |
| `src/cinematics/level1/branch.css` | 纸、卡片和屏幕的透视内容样式 |
| `src/cinematics/level1/Level1Composition.tsx` | 共用时间线、原文对白、共同结尾及办公室过渡 |
| `src/cinematics/level1/Level1ConsequenceSequence.tsx` | 固定输入、图片准备、播放器、音效和一次完成回调 |
| `src/cinematics/level1/Level1DevPreview.tsx` | 只用于开发检查的输入和播放器控制 |
| `src/cinematics/level1/SomethingFeelsWrong.tsx` | 复用办公室/邮件，完成反思与叙事桥接 |
| `src/cinematics/level1/office.css` | 仅作用于新办公室叙事的细节样式 |
| `src/cinematics/level1/level1.css` | 新字幕、画面容器与开发预览样式 |
| 本文及 `CIN_01_PREFLIGHT.md` | 说明检查、真实路径、操作、验证与素材缺口 |
| 已提供的 V2、CIN-01 分镜和 Level 1 图片 | 按原路径纳入本独立版本，保证其他人能重现；内容未改 |

原 `App.tsx`、`ClassroomScene.tsx`、`styles.css`、共享定义、软件依赖清单及原始 Level 2 目录没有修改。整合风险主要是不同分支都可能修改自己的 `src/main.tsx`；以后合并时保留两个开发入口即可，不应覆盖对方文件。

## 素材交付状态

**现在可用：** 原办公室/教室背景、程序文字/道具/电脑内容、镜头与时间线、共用结尾、独立预览、完成回调。

**参考或临时：** 六个分支场景图、共用 Alex 镜头、角色总图、两张道具总图。场景保持暖色大学世界，但人物仍是平面画；这不是高质量分层人物动画的最终版本。

**仍需补充：** 同画布同锚点的 Alex 身体/头部、睁眼/闭眼/方向眼睛、眉毛状态、嘴型、举手/放下/书写/核对清单手臂与手部；独立透明纸张和讨论卡；精确电脑屏幕遮罩；专注背景学生的头部/手部/页面；最终音效。补齐后可使用已有绑定工具，不必重写流程。没有自动生成外部素材。

## 验证记录

- 六个开发入口的三句分支对白、共同台词、动态 `Lin` 邮件、两段思考和过渡问题均在浏览器逐时间点核对。
- 六分支在分支时段的画面根节点数量均为 1；各自结束都只发送一次完成事件。再次播放相同请求，事件数仍是 1。
- 一个完整 33.4 秒播放自然结束，完成事件为 1；减少动态效果时 1 秒和 10 秒的镜头样式一致；回忆片段只挂载一个实际所选分支。
- 类型检查、正式构建及改动格式检查均通过。正式输出已确认不包含 Level 1 预览或场景图片；在正式预览地址使用开发参数，仍显示原游戏，开发控件数量为 0。构建只出现现有依赖的 `use client` 指令忽略提示。
- 画面已做浏览器与逐帧截图检查。第一次逐帧截图使用内置无头浏览器退出；改用电脑已有的浏览器后成功，无需安装软件。
- 原开场完整经过输入姓名、通知邮件、三个学生观察、返回办公室，最终显示 REPLAY OPENING；控制台错误为 0。
- 共同结尾、办公室独立片段均能播放结束，且不发送游戏完成事件；空姓名使用 Great work!；工作台可直接打开 Level1Consequences，没有错误覆盖层。
- 新目录的 14 份素材/源文档与原件内容校验一致；收尾复核原 Level 2 的 9 个受保护文件仍与隔离前逐字节一致，仍在原分支。

`npm run typecheck` 检查名称、参数和数据类型，成功没有错误文字。`npm run build` 检查并生成可发布文件，成功显示 `built in`；这两条都由项目命令工具执行。失败时复制从首个错误到末尾的内容。仓库没有现成的自动测试命令，本次采用真实浏览器检查。

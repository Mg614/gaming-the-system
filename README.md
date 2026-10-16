# GAMING THE SYSTEM

An interactive cinematic serious game exploring how metrics and incentives shape student behaviour.

## Collaboration

Work on feature branches and preserve the completed opening. See the
[workflow](docs/collaboration/WORKFLOW.md),
[integration contract](docs/collaboration/INTEGRATION_CONTRACT.md), and
[source of truth](docs/collaboration/SOURCE_OF_TRUTH.md).

## 当前版本

Scene 1–3 的连续第一人称可玩原型。浏览器保持摄影机视口，办公室与教室通过门口转场相连。Scene 3 支持任意顺序查看三名学生，全部查看后返回原办公室。到此结束，未实现 Level 1。

Scene 3 已拆分为环境画面与独立互动层，可以接入 MP4/WebM 环境视频。当前没有已连接且可用的视频生成服务，也没有真实课堂视频，因此仍使用只有三名学生的静态备用画面。12–20 人的异步自然活动尚未实现。不要把当前画面或播放机制测试当作最终电影化成片。

## 本地启动

需要 Node.js 20.19+ 或 22.12+（运行项目工具的程序），本机使用 24。
npm 是随它提供的工具，用于安装项目所需的代码包和启动项目。

在项目文件夹的终端中：

1. 首次准备：运行 `npm install`。它会安装依赖；成功时显示安装完成或已更新。失败请复制从第一条 `npm error` 到末尾的文字。
2. 启动：运行 `npm run dev`。它会开启本地预览；成功时显示 `Local: http://127.0.0.1:5173/`。在浏览器打开实际显示的地址。失败请复制命令下方的完整报错。
3. 停止：在同一终端按 Control + C，恢复输入提示即表示停止。

代码检查：`npm run build` 会检查类型并生成 `dist/`；显示 `built in` 表示成功。失败请复制第一个错误及对应文件名、行号。动画依赖可能产生 `use client ... was ignored` 非阻塞警告：浏览器构建忽略了它的服务端标记。

## 按顺序试玩

1. 刷新后，从近黑画面观看标题、问题和 START GAME 逐渐出现。
2. 点击 START GAME，办公室在约 2 秒内从暗处显露，然后出现姓名提示。没有居中大卡片。
3. 姓名留空或只输入空格，TAKE YOUR SEAT 不可用；输入姓名后点击按钮，也可按 Enter。首尾空格会被去除，保存为 `playerName`。
4. 镜头缓慢推进入座，短暂显示 Monday, 9:12 AM（约 2 秒）；随后环境停留约 1.7 秒。
5. 电脑屏幕轻微亮起，镜头向电脑靠近约 2.2 秒，通知在电脑屏幕内出现。等待多久都不会自动打开。
6. 点击 University Management / Urgent Mission，镜头继续推进到读信位置，邮件在原电脑屏幕内打开。检查称呼是否使用刚才输入的姓名。
7. 约 3.2 秒后，画面下方短暂出现内心独白 Sounds simple enough.；再约 1.7 秒，邮件中的 VISIT CLASSROOM 可用。可以继续阅读，不会自动离开。
8. 点击 VISIT CLASSROOM：邮件淡去，镜头后退约 1.9 秒，然后转向门口约 2.3 秒，变暗后进入教室。教室渐亮后保留约 1–2 秒的观察时间，再允许互动。
9. 点击左侧睡觉、中间看手机、右侧看作业的学生，顺序自由；也可触屏点击，或用 Tab 选择、Enter 激活。轻微悬停变亮只作提示，不要求先悬停。
10. 每次点击后镜头缓慢靠近，约 1.4 秒后出现该学生对白，保留约 2.7 秒；之后用约 1.5 秒返回全景。整个过程暂停其他学生互动，防止连续点击跳过对白。已查看学生仍可重新查看，重复查看不会代替其他学生。
11. 三人的回应分别是：睡觉学生 `Zzz...`（不醒来、不说话）；手机学生 “Just one more message...” （优先关注手机）；未准备学生 “I don't know where to start.” （不知道如何开始任务）。目前这三类行为的画面仍是静态姿势，自然动作需要正式环境视频。
12. 三人都查看后，镜头回到全景并停留约 1.6 秒，显示 “Okay... this is worse than I thought.”。之后教室右侧门口出现 RETURN TO OFFICE；此前不会出现返回行动，也不显示检查清单或人数计数。
13. 点击 RETURN TO OFFICE，镜头向出口靠近，教室变暗，再回到原办公室。原有姓名保留，邮件不会重复触发。此时只提供 REPLAY OPENING；点击可从开场重来，并重置姓名与查看状态。

优先电脑横屏。舞台保持 16:9，其他比例使用黑边，不拉伸背景。手机竖屏暂未设计独立排版。系统开启“减少动态效果”时，镜头直接到达目标位置，剧情节奏和交互保持一致。

## 文件职责与镜头实现

```text
src/App.tsx           一个持续存在的舞台、剧情节拍、镜头目标、姓名和电脑内容
src/ClassroomScene.tsx 隐形点击区域、查看状态、对白、镜头与门口返回行动
src/ClassroomAmbient.tsx 环境视频播放与静态备用画面，无互动逻辑
src/classroomMedia.ts 视频/静态来源开关、三人位置和新回应文字
src/styles.css       视口、暗部、叠加提示、电脑屏幕定位和邮件排版
src/useSceneAudio.ts 音频接入点、循环、静音、离场淡出和清理
src/main.tsx         启动界面
index.html           网页入口
package.json         工具依赖和运行命令
package-lock.json    固定依赖版本
tsconfig.json       代码类型检查设置
assets/              正式制作素材
docs/               原始分镜和视觉参考
```

技术：React（用组件搭建交互界面的工具）、TypeScript（帮助检查代码错误的 JavaScript 扩展）、Framer Motion（界面动画工具）、Vite（本地预览和打包工具）。

`App.tsx` 的 `TIMELINE` 只推进观看阶段；姓名、通知、读信等交互阶段等待玩家。`CAMERAS` 集中保存开场、入座、电脑、邮件、后退和门口的位置。

背景与电脑中的网页元素都放在同一个 `.office-camera` 容器内。通过 `scale`（缩放）、`x`（横移）、`y`（纵移）改变视点，动画在相邻目标之间平滑过渡。镜头中心固定，避免切换旋转中心时跳动。背景不会在剧情阶段切换时卸载，通知与邮件会跟着同一台电脑移动。

融入场景的界面：电脑内的通知、发件人、邮件正文和 VISIT CLASSROOM 按钮。标题、姓名提示、时间和内心独白是叙事叠加层；不会把它们伪装成电脑内容或新页面。

教室沿用同一舞台。环境画面由 `ClassroomAmbient` 管理，互动由 `ClassroomScene` 管理；视频、静态画面与三个隐形点击区域都放在 `.classroom-camera` 内，随同一个镜头一起移动。摄影机将指定学生移向画面中心并放大到约 1.45 倍，回应后平滑回到全景。回应是电影字幕，睡觉学生只显示 `Zzz...`。返回行动随教室右侧门口移动。按钮没有可见框、卡片或图标，只保留指针变化和极轻的局部悬停/键盘提示。

`sleepingInspected`、`phoneInspected`、`unpreparedInspected` 初始都为 false；各自对白结束后设为 true。只有三项都为 true，并完成镜头返回后，才触发最后的观察与门口行动。查看过程还使用即时锁，防止同一瞬间连续点击启动多个回应。

## 音频接入

目前没有正式音频，本版保持静音，不生成声音、不请求不存在的文件。以下接入点已经准备好。以后把文件放入 `assets/audio/`，按这些名字命名并重新启动预览即可。

| 文件 | 触发位置 |
| --- | --- |
| `AMB_Office_Loop_v01.wav` | START GAME 后低音量循环，离场时淡出 |
| `SFX_EmailNotification_v01.wav` | 环境停顿结束、屏幕亮起时 |
| `SFX_StartConfirm_v01.wav` | START GAME |
| `SFX_EmailOpen_v01.wav` | 点击通知 |
| `SFX_SceneTransition_v01.wav` | TAKE YOUR SEAT、VISIT CLASSROOM 和 RETURN TO OFFICE |
| `AMB_Classroom_Loop_v01.wav` | 教室进入时循环，离场淡出；返回办公室后恢复办公室环境声 |
| `SFX_StudentInspect_v01.wav` | 点击任一学生 |

至少存在一项匹配的音频时才显示声音开关。播放失败不阻断剧情，重玩或退出时停止声音。实际音质、响度搭配和浏览器音频兼容性需在正式文件加入后试听验证。

## 素材与范围

- 原始叙事：`docs/storyboard/Storyboard_01_TitleAndIdentity.xlsx`、`docs/storyboard/Storyboard_02_OfficeUrgentMission.xlsx`，S01–S07；镜头与交互组织按最新连续电影化要求调整。
- Scene 3 原始叙事：`docs/storyboard/Storyboard_03_ClassroomDisaster.xlsx`，S08–S12。未修改原分镜。
- 用户最新修订在可玩原型中覆盖了原分镜的三条回应：睡觉只显示 `Zzz...`、手机优先回复消息、未准备学生不知道从何开始。Excel 原文保留。
- 视觉参考：`docs/visual-style/references/01-opening-mission/` 和 `docs/visual-style/references/02-classroom-disaster/`，只参考，不加载进游戏。
- 加载的图像均为正式素材：办公室背景、教室背景、三张独立学生图片；保持第一人称，不出现玩家身体或角色。
- 通知、邮件正文、动态称呼与按钮均为真实网页元素。
- 无额外玩法，无 Remotion，无视频渲染或导出。

## Scene 3 素材检查与灰盒限制

仓库当前使用以下旧命名，代码直接引用实际存在的文件，没有移动或修改原图：

```text
assets/backgrounds/BG-002 — Classroom First-Person Background.png
assets/characters/CHAR-001 — Sleeping Student Idle.png
assets/characters/CHAR-003 — Phone Student Idle.png
assets/characters/CHAR-005 — Unprepared Student Idle.png
```

三张人物 PNG 都有真实透明通道，外部黑色区域的主要部分透明，不是整块黑底。边缘存在少量半透明残留；主体最大透明通道值为 254/255，接近完全不透明。实际合成未出现黑色矩形背景。

三张图片都包含完整课桌与椅子，背景也有课桌。因此存在局部桌面叠加、底边截断和透视接缝。当前用位置和尺寸匹配前排桌子作为临时灰盒方案，没有加卡片、黑底或遮挡矩形。光线和画风大体一致，但正式合成仍需桌子与背景精确配套的角色素材。

目前只提供 Idle 静止姿势，没有抬头/反应图。本版通过镜头、轻微亮度变化和代码字幕表现回应，不伪造新的角色姿势。音频也只有接入点，目前保持静音。

已验证完整 Scene 1 → Scene 2 → Scene 3 → 返回办公室；三名学生的六种查看顺序、触屏、键盘、重复点击锁定、全部查看后的进展门槛和系统减少动态效果模式均通过。原始分镜、背景、人物图和视觉参考经文件校验确认未变。

## 课堂环境视频接入

生成说明与验收要求：`docs/video/VID_ClassroomAmbient_v01_Brief.md`。首次只生成一个约 8 秒的课堂环境原型，参考原 REF-005 的构图；保留左睡觉、中手机、右未准备位置，并加入 12–20 人的异步自然活动。生成后先审阅，不自动制作多个版本或三段反应视频。

将选定视频放入 `assets/videos/VID_ClassroomAmbient_v01.mp4` 或 `.webm`，16:9、约 6–10 秒。重新运行本地预览命令。`src/classroomMedia.ts` 的 `mode` 默认 `auto`：发现视频就使用，没有视频则使用静态备用；改成 `static` 可强制使用备用画面，`video` 请求视频但仍保留出错回退。

视频必须包含所有学生，播放成功时原人物 PNG 会隐藏，避免双重叠加。环境视频静音循环，进入教室后播放，离开后暂停；正式环境音由已有音频接入点单独管理，可以包含低声交谈、翻页、打字和椅子声。睡觉学生没有语音，另两人暂用字幕。

点击区域用 16:9 画面的百分比坐标定义。真实视频加入后，必须对照开头、中间、结尾画面校准 `hotspot` 位置；固定左中右构图只能提供初始对齐，不能保证任意生成视频都准确。背景学生不具有交互。

已用只存在于测试内存中的短 WebM 检查浏览器播放、静态图层隐藏、查看期间播放、离场暂停，以及损坏视频回退；没有把测试片段存入项目或当作课堂原型。真实课堂视频尚不存在，其身份稳定性、背景动作、循环接缝和生产适用性均未验证。

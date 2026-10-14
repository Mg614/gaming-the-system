# Classroom ambient prototype brief

Status: **not generated**. No compatible video-generation service is currently connected. Runway is discoverable but not installed/connected; the Weave entry reports an unlinked account. The app currently uses the original static fallback with three students. It does not yet deliver a populated, moving classroom.

## First experiment only

Produce one 8-second image-to-video ambient prototype, if supported by the connected generator. Use the original visual composition reference:

`docs/visual-style/references/02-classroom-disaster/REF-005 — Classroom Disaster Composition.png`

Use the three existing production student images as identity references if multiple image references are supported. Keep all originals unchanged. The REF is an input to generation, not an image to load into the game.

Do not automatically generate variants or separate reaction clips. Show the first result for review before any further generation. The experiment answers: does a living classroom ambient video significantly improve immersion?

## Generation prompt

Warm hand-drawn cinematic illustration of an ordinary university classroom, seen in first person from the back. Match the supplied classroom reference, architecture, perspective, afternoon sunlight from the left, and student identities. Fixed camera throughout, one continuous shot, no cuts, no pans or zooms. 16:9, about 8 seconds, near-seamless looping with closely matching first and last frames.

Show 12–20 visible students seated at desks. Three focal students stay in stable positions: a sleeping student on the left, a phone student in the centre, and an unprepared student on the right. Do not move these students to different seats or alter their identities, clothes, desks or props.

Left: asleep on folded arms, only very slow breathing or a tiny shoulder shift. Never wakes, looks up or speaks. Centre: scrolls or types on a phone, occasionally pauses to read, with a small expression directed at the phone; remains off-task. Right: looks between incomplete worksheet and notes, hesitates, slowly shifts a sheet or pencil, unsure where to begin.

Other students make small, independent actions at staggered times: taking notes, turning a page, typing, organizing papers, adjusting a bag, drinking water, looking at the board or briefly outside, or a small posture change. A few may quietly exchange a glance. Most people remain still at any given instant. Ordinary subdued classroom atmosphere, no synchronized motion, no exaggerated gestures, no people walking across the view.

No dialogue, subtitles, captions, signs added by the generator, text overlays, icons or visual effects. No morphing hands, duplicated faces, disappearing people, costume changes or identity drift. Maintain desk geometry and stable foreground positions throughout. Background motion must be subtle enough to allow camera crops in the interactive application.

## Delivery and integration

- Output: `assets/videos/VID_ClassroomAmbient_v01.mp4` (browser-compatible H.264) or `.webm` (browser-compatible VP8/VP9). Provide one chosen prototype, 16:9, about 6–10 seconds.
- The video includes both background students and the three focal students. Do not add the static student PNGs over it; the application hides them when video playback succeeds.
- Restart the local preview after adding the file. `src/classroomMedia.ts` defaults to `mode: 'auto'`: use the clip if present, otherwise use the original static fallback. `mode: 'static'` forces fallback; `mode: 'video'` requests video but still falls back if missing or unplayable.
- The video is muted, loops, plays inline, and pauses outside the classroom. Existing classroom audio hooks remain separate. Missing audio does not produce requests.
- Unsupported/corrupt media, blocked playback, a four-second startup timeout, or a non-16:9 frame falls back to the original images.

## Composition anchors

All anchors are percentages of the fixed 16:9 classroom frame. They transform with the same camera as the media, so resizing the browser does not detach them. Current invisible interaction regions match the static composition approximately:

| Student | Left | Top | Width | Height |
| --- | --- | --- | --- | --- |
| Sleeping | 8% | 47% | 22% | 24% |
| Phone | 39% | 42% | 23% | 30% |
| Unprepared | 73% | 46% | 24% | 28% |

After a real clip is delivered, calibrate the `hotspot` fields in `src/classroomMedia.ts` against the first, middle and last frames. Keep the office/classroom door on the right. A clip whose key students wander outside these regions needs regeneration or wider safe anchors; do not rewrite interaction logic to chase them.

## Review before production

Verify the actual head count, independent motion, three distinct behaviours, identity consistency, desk/hand stability, loop seam, and hotspot alignment throughout the clip. Test all three camera crops. Confirm the exit remains usable and no generated text appears. None of these artistic/video-quality checks can be completed before a real clip exists. Browser playback smoke tests are not proof that generated media is stable enough for production.

## Current intentional narrative override

The Excel storyboard remains unchanged. The user's latest revision overrides its three old response lines in the playable prototype:

- Sleeping: `Zzz...` only, no waking or spoken line.
- Phone: `Just one more message...`
- Unprepared: `I don't know where to start.`

The inspection states, arbitrary order, return-to-wide, final thought, door action and return to the existing office remain intact. No Level 1 is included.

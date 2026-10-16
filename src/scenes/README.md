# Integration boundary

Future level wiring connects gameplay requests to cinematic components and routes
completion back to gameplay. Agree one integration owner per level to reduce
overlapping edits. Do not implement rules or animation inside the wiring layer.
The current scene wiring stays in `../App.tsx`; this directory does not replace it.

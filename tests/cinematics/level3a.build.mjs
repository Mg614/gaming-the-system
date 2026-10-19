import { build } from 'vite';

// The standalone DEV page is intentionally absent from the game's production
// entry. Independently bundle the reusable cinematic to check its asset imports.
await build({
  configFile: false,
  build: {
    outDir: '.cache/cin3a/module-build', emptyOutDir: true,
    lib: { entry: 'src/cinematics/level3/MetricAdaptationSequence.tsx', formats: ['es'], fileName: 'cin03a' },
    rollupOptions: { external: ['react', 'react/jsx-runtime', 'framer-motion'] },
  },
});

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Player } from '@remotion/player';
import { CharacterRig } from './shared/engine/CharacterRig/CharacterRig';
import { CinematicCamera } from './shared/engine/CinematicCamera/CinematicCamera';
import { DialogueLayer } from './shared/engine/DialogueLayer/DialogueLayer';
import { EnvironmentMotion } from './shared/engine/EnvironmentMotion/EnvironmentMotion';
import { useIrregularBlink } from './shared/engine/timeline/useIrregularBlink';
import type { CharacterPose, Expression, GazeDirection } from './shared/engine/types';
import { CinematicToolingDemoComposition } from './remotion/scenes/CinematicToolingDemoComposition';
import './cinematics.css';

const STEP_MS = 1050;

function InteractiveDemo() {
  const [step, setStep] = useState(0);
  const reducedMotion = useReducedMotion();
  const blink = useIrregularBlink(!reducedMotion, 41);

  useEffect(() => {
    const timer = window.setInterval(() => setStep(previous => (previous + 1) % 6), STEP_MS);
    return () => window.clearInterval(timer);
  }, []);

  const gaze: GazeDirection = step === 1 || step === 2 ? 'right' : step === 3 ? 'down' : 'center';
  const expression: Expression = step === 2 || step === 3 || step === 4 ? 'uncertain' : 'neutral';
  const pose: CharacterPose = { gaze, expression, blink, headTilt: step >= 3 && step <= 4 ? 3 : 0, headY: step === 3 ? 2 : 0 };
  const environmentProgress = (step % 6) / 6;

  return (
    <div className="cinematic-demo-frame" aria-label="Interactive Framer Motion cinematic demo">
      <motion.div
        className="cinematic-demo-camera"
        animate={{ scale: step >= 2 && step <= 4 ? 1.08 : 1, x: step >= 2 && step <= 4 ? '-1.5%' : '0%' }}
        transition={{ duration: reducedMotion ? 0 : 1.15, ease: 'easeInOut' }}
      >
        <CinematicCamera pose={{ scale: 1, x: 0, y: 0, vignette: 0.48 }}>
          <div className="cinematic-room">
            <div className="cinematic-window" />
            <div className="cinematic-desk" />
            <EnvironmentMotion progress={environmentProgress} seed={11} />
            <motion.div
              className="cinematic-character"
              animate={{ y: reducedMotion ? 0 : [0, 2, 0], scaleY: reducedMotion ? 1 : [1, 1.008, 1] }}
              transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              <CharacterRig pose={pose} label="Temporary layered SVG character for tooling validation" />
            </motion.div>
            <p className="placeholder-label">TEMPORARY LAYERED SVG • TOOLING TEST ONLY</p>
          </div>
        </CinematicCamera>
      </motion.div>
      <AnimatePresence>
        {step === 4 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0 : 0.35 }}>
            <DialogueLayer>“Wait… was that the intended answer?”</DialogueLayer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CinematicToolingDemo() {
  const playerInputProps = useMemo(() => ({ label: 'TIMELINE / REMOTION' }), []);
  return (
    <main className="cinematic-tooling-page">
      <header className="cinematic-tooling-header">
        <div><p>GAMING THE SYSTEM</p><h1>Cinematic tooling demo</h1></div>
        <a href="/">Return to opening</a>
      </header>
      <p className="cinematic-tooling-note">Two previews use the same layered character idea. The left responds in real time; the right is locked to a precise 6-second frame timeline.</p>
      <div className="cinematic-demo-grid">
        <section><h2>Interactive / Framer Motion</h2><InteractiveDemo /></section>
        <section><h2>Timeline / Remotion Player</h2><div className="cinematic-player-shell"><Player component={CinematicToolingDemoComposition} durationInFrames={180} compositionWidth={1280} compositionHeight={720} fps={30} inputProps={playerInputProps} controls loop acknowledgeRemotionLicense style={{ width: '100%', aspectRatio: '16 / 9' }} /></div></section>
      </div>
    </main>
  );
}

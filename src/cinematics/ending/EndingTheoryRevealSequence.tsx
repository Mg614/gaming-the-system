import { useEffect, useMemo, useRef, useState } from 'react';
import { Player, type PlayerRef } from '@remotion/player';
import { motion } from 'framer-motion';
import { EndingComposition } from './EndingComposition';
import { completionLatch, ENDING_FPS, ENDING_FRAMES, SHOTS, shotAt } from './endingTimeline';
import type { EndingComplete, EndingHandoff, EndingProps } from './types';

type Props = EndingProps & {
  readonly onComplete: (event: EndingComplete) => void;
  readonly onHandoff: (event: EndingHandoff) => void;
  readonly showControls?: boolean;
  readonly initialFrame?: number;
  readonly onReplay?: () => void;
};

/** Request identity is the replay boundary, not a prop rerender or timeline seek. */
export function EndingTheoryRevealSequence(props: Props) {
  return <EndingPlayer key={props.input.requestId} {...props} />;
}

function EndingPlayer({ input, WeightMemory, reducedMotion, onComplete, onHandoff, showControls = false, initialFrame = 0, onReplay }: Props) {
  const player = useRef<PlayerRef>(null);
  const [frame, setFrame] = useState(initialFrame);
  const [playing, setPlaying] = useState(false);
  const [complete, setComplete] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const latch = useRef(completionLatch());
  const handedOff = useRef(false);
  const callbacks = useRef({ onComplete, onHandoff });
  useEffect(() => { callbacks.current = { onComplete, onHandoff }; }, [onComplete, onHandoff]);
  const inputProps = useMemo(() => ({ input, WeightMemory, reducedMotion }), [input, WeightMemory, reducedMotion]);
  useEffect(() => {
    const p = player.current;
    if (!p) return;
    const update = ({ detail }: { detail: { frame: number } }) => setFrame(detail.frame);
    const play = () => setPlaying(true);
    const pause = () => setPlaying(false);
    const failed = ({ detail }: { detail: { error: Error } }) => { setError(detail.error.message); setPlaying(false); };
    const ended = () => {
      setPlaying(false);
      setComplete(true);
      if (latch.current(p.getCurrentFrame())) callbacks.current.onComplete({ type: 'animationComplete', cinematicId: 'ending', requestId: input.requestId });
    };
    p.addEventListener('frameupdate', update);
    p.addEventListener('play', play);
    p.addEventListener('pause', pause);
    p.addEventListener('ended', ended);
    p.addEventListener('error', failed);
    return () => {
      p.removeEventListener('frameupdate', update);
      p.removeEventListener('play', play);
      p.removeEventListener('pause', pause);
      p.removeEventListener('ended', ended);
      p.removeEventListener('error', failed);
    };
  }, [input.requestId]);
  const seek = (next: number) => {
    player.current?.pause();
    player.current?.seekTo(Math.max(0, Math.min(ENDING_FRAMES - 1, next)));
  };
  const shot = shotAt(frame / ENDING_FPS);
  return <div className="end-sequence" data-request-id={input.requestId}>
    <div className="end-player-shell">
      <Player ref={player} component={EndingComposition} inputProps={inputProps}
        durationInFrames={ENDING_FRAMES} fps={ENDING_FPS} compositionWidth={1280} compositionHeight={720}
        initialFrame={initialFrame} controls={false} loop={false} moveToBeginningWhenEnded={false} autoPlay={!showControls}
        clickToPlay={false} doubleClickToFullscreen={false} spaceKeyToPlayOrPause={false}
        acknowledgeRemotionLicense style={{ width: '100%', aspectRatio: '16 / 9' }} />
      {complete && frame >= Math.round(55.7 * ENDING_FPS) && !error && <button className="end-handoff-button" disabled={leaving} onClick={() => { player.current?.pause(); setLeaving(true); }}>GO TO DESIGN LAB <span>→</span></button>}
      {leaving && <motion.div className="end-fade-out" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reducedMotion ? .1 : .65 }} onAnimationComplete={() => {
        if (handedOff.current) return;
        handedOff.current = true;
        callbacks.current.onHandoff({ type: 'design_lab_requested', requestId: input.requestId });
      }} />}
    </div>
    {error && <p role="alert">The Ending could not play: {error}</p>}
    {showControls && <div className="end-controls">
      <div className="end-controls-row">
        <button disabled={!!error || leaving} onClick={() => playing ? player.current?.pause() : player.current?.play()}>{playing ? 'Pause' : 'Play'}</button>
        <button onClick={onReplay}>Replay</button>
        <label>Scene <select value={shot.id} disabled={leaving} onChange={e => seek(Math.round(SHOTS.find(s => s.id === e.target.value)!.start * ENDING_FPS))}>
          {SHOTS.map(s => <option key={s.id} value={s.id}>{s.id} · {s.title}</option>)}
        </select></label>
        <output aria-label="Current time">{(frame / ENDING_FPS).toFixed(1)} / 58.2 s</output>
      </div>
      <input type="range" aria-label="Ending timeline" min={0} max={ENDING_FRAMES - 1} value={frame} disabled={leaving} onChange={e => seek(Number(e.target.value))} />
      <p className="end-playback-state" aria-live="polite">{error ? 'Playback error' : leaving ? 'Handing off' : complete ? 'Ending complete' : playing ? 'Playing' : 'Paused'} · {shot.id}</p>
    </div>}
  </div>;
}

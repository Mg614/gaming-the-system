import { useMemo, useRef, useState, type FormEvent } from 'react';
import type { PlayerRef } from '@remotion/player';
import { motion } from 'framer-motion';
import { Level1ConsequenceSequence, type Level1Request } from './Level1ConsequenceSequence';
import { branches, isMetricId, LEVEL1, metricIds, type PreviewPart } from './level1Content';
import './level1.css';

/** Reachable only behind import.meta.env.DEV in the existing query entry. */
export default function Level1DevPreview() {
  const query = new URLSearchParams(window.location.search);
  const requested = query.get('metric');
  const metric = isMetricId(requested) ? requested : 'pre-class-preparation';
  const part: PreviewPart = query.get('part') === 'common' ? 'common' : query.get('part') === 'office' ? 'office' : 'full';
  const [name, setName] = useState(query.get('name') ?? 'Taylor');
  const [run, setRun] = useState(0);
  const [ended, setEnded] = useState(false);
  const [events, setEvents] = useState(0);
  const [reduced, setReduced] = useState(query.get('motion') === 'reduced');
  const playerRef = useRef<PlayerRef>(null);
  const seekRef = useRef<HTMLInputElement>(null);
  const request = useMemo<Level1Request>(() => ({
    requestId: `cin01-preview-${metric}-${part}-${run}`, cinematicId: 'level1', level: 1,
    input: { selectedMetric: metric, playerPrediction: query.get('prediction') ?? '', runRequested: true },
  // URL inputs define a preview run; ordinary rerenders do not replay it.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [metric, part, run]);
  const navigate = (key: string, value: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set(key, value);
    url.searchParams.set('name', name);
    window.location.assign(url);
  };
  const seek = (event: FormEvent) => {
    event.preventDefault();
    const seconds = Number(seekRef.current?.value);
    if (Number.isFinite(seconds)) {
      playerRef.current?.pause();
      playerRef.current?.seekTo(Math.min(Math.round(LEVEL1.duration * LEVEL1.fps) - 1, Math.max(0, Math.round(seconds * LEVEL1.fps))));
    }
  };

  return (
    <main className="l1-preview">
      <motion.header className="l1-preview-header" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <div><p className="l1-preview-eyebrow">GAMING THE SYSTEM / CIN-01</p><h1>Six Behaviour Consequences</h1><p>Independent narrative preview · {branches[metric].label}</p></div>
        <a href="?">Return to opening</a>
      </motion.header>
      <section className="l1-preview-controls" aria-label="Development preview controls">
        <label>Branch<select aria-label="Preview branch" value={metric} onChange={event => navigate('metric', event.target.value)}>{metricIds.map(id => <option key={id} value={id}>{branches[id].label}</option>)}</select></label>
        <label>Sequence<select aria-label="Preview segment" value={part} onChange={event => navigate('part', event.target.value)}><option value="full">Full selected sequence</option><option value="common">Common ending only</option><option value="office">Something Feels Wrong only</option></select></label>
        <label>Email name<input aria-label="Preview player name" value={name} maxLength={40} onChange={event => setName(event.target.value)} /></label>
        <label className="l1-preview-check"><input type="checkbox" checked={reduced} onChange={event => setReduced(event.target.checked)} />Reduce motion</label>
        <button onClick={() => { setRun(value => value + 1); setEnded(false); setEvents(0); }}>New preview run</button>
      </section>
      <Level1ConsequenceSequence request={request} playerName={name} previewPart={part} playerRef={playerRef} reduceMotion={reduced || undefined}
        onPreviewEnd={() => setEnded(true)} onComplete={() => setEvents(count => count + 1)} />
      <footer className="l1-preview-footer">
        <form onSubmit={seek}><label>Jump to second <input ref={seekRef} aria-label="Preview time in seconds" type="number" min="0" max={LEVEL1.duration} step="0.1" defaultValue="0" /></label><button>Seek</button></form>
        <output aria-live="polite" data-testid="completion-status">{ended ? part === 'full' ? `Sequence complete · animationComplete sent ${events} time${events === 1 ? '' : 's'}` : 'Segment preview complete · no gameplay event sent' : 'Press Play to preview'}{part === 'full' && !ended ? ` · completion events: ${events}` : ''}</output>
      </footer>
      <p className="l1-preview-note">DEV ONLY · Scene plates are temporary. Facial and anatomical arm animation needs separated Alex layers. Play, pause and scrub to review; no gameplay is connected.</p>
      {!isMetricId(requested) && requested && <p role="status" className="l1-preview-note">Unknown metric “{requested}”; previewing Pre-class Preparation.</p>}
    </main>
  );
}

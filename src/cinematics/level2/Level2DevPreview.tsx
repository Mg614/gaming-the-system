import { useCallback, useEffect, useRef, useState } from 'react';
import type { CinematicComplete, MetricId } from '../../shared/contracts';
import { Level2ConsequencesSequence } from './Level2ConsequencesSequence';
import { getLevel2Shots, sequenceDuration, type Level2Request, type PreviewSegment, type ThreeMetricCategory } from './level2Timeline';
import './preview.css';

// This entire module is imported ONLY behind import.meta.env.DEV in main.tsx.
// Fixtures are presentation examples, not a classifier, game state store, or production adapter.
const METRICS: readonly MetricId[] = ['pre-class-preparation', 'in-class-participation', 'on-task-focus', 'in-class-discussion-quality', 'learning-reflection-quality', 'online-peer-response-quality'];
const EXAMPLES: Record<string, { category: ThreeMetricCategory; metrics: readonly MetricId[] }> = {
  'visible-heavy': { category: 'visible-behaviour-heavy', metrics: METRICS.slice(0, 3) },
  'quality-heavy': { category: 'quality-depth-heavy', metrics: METRICS.slice(3) },
  'mixed-broad': { category: 'mixed-broad', metrics: [METRICS[0], METRICS[3], METRICS[5]] },
};
const STATES = ['visible-heavy', 'quality-heavy', 'mixed-broad', 'six', '10', '25', '100', 'final', 'full', 'checking'] as const;
const STATE_LABELS = ['Visible', 'Quality', 'Mixed', 'Six', '10', '25', '100 + ending', 'Final conflict', 'Full chain', 'Checking'];
const HANDOFF: Record<PreviewSegment, string> = {
  three: 'Return to gameplay: add the remaining three metrics.',
  six: 'Return to gameplay: keep adding metrics.',
  '10': 'Return to gameplay: request 25 metrics.',
  '25': 'Return to gameplay: request 100 metrics.',
  '100': 'Return to Level 3 gameplay: priorities. No gameplay is connected.',
  final: 'Return to Level 3 gameplay: priorities. No gameplay is connected.',
  checking: 'Three-shot checking study complete. No gameplay is connected.',
};

export default function Level2DevPreview() {
  const query = new URLSearchParams(window.location.search);
  const rawState = query.get('state') ?? 'visible-heavy';
  const supported = STATES.includes(rawState as typeof STATES[number]);
  const state = supported ? rawState : 'visible-heavy';
  const full = state === 'full';
  const categoryKey = EXAMPLES[query.get('category') ?? ''] ? query.get('category')! : EXAMPLES[state] ? state : 'mixed-broad';
  const fixture = EXAMPLES[categoryKey];
  const plan: PreviewSegment[] = full ? ['three', 'six', '10', '25', '100'] : [EXAMPLES[state] ? 'three' : state as PreviewSegment];
  const [index, setIndex] = useState(0);
  const [run, setRun] = useState(0);
  const [playing, setPlaying] = useState(query.get('paused') !== '1');
  const initialTime = Number(query.get('at') ?? 0);
  const [elapsed, setElapsed] = useState(Number.isFinite(initialTime) ? Math.max(0, initialTime) : 0);
  const [speed, setSpeed] = useState(1);
  const [event, setEvent] = useState('Waiting for cinematic completion.');
  const [completed, setCompleted] = useState(false);
  const [events, setEvents] = useState<CinematicComplete[]>([]);
  const [pageVisible, setPageVisible] = useState(!document.hidden);
  const clock = useRef(elapsed);
  const visible = useRef(!document.hidden);
  const nextTimer = useRef<number | undefined>(undefined);
  const segment = plan[index];
  const request: Level2Request = {
    requestId: `dev-level2-${run}-${index}-${state}`,
    cinematicId: 'level2', level: 2,
    input: { phase: segment, selectedMetrics: segment === 'three' ? fixture.metrics : METRICS, ...(segment === 'three' ? { resultCategory: fixture.category } : {}) },
  };
  const duration = sequenceDuration(getLevel2Shots(request));

  useEffect(() => {
    const onVisibility = () => { visible.current = !document.hidden; setPageVisible(!document.hidden); };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);
  useEffect(() => {
    if (!playing || completed) return;
    let frame = 0;
    let previous = performance.now();
    let paint = previous;
    const advance = (now: number) => {
      // Hidden tabs hold their place; returning must not skip unread dialogue.
      if (visible.current) clock.current = Math.min(duration, clock.current + Math.min(now - previous, 100) / 1000 * speed);
      previous = now;
      if (now - paint > 45 || clock.current >= duration) { setElapsed(clock.current); paint = now; }
      if (clock.current < duration) frame = requestAnimationFrame(advance);
    };
    frame = requestAnimationFrame(advance);
    return () => cancelAnimationFrame(frame);
  }, [completed, duration, index, playing, run, speed]);
  useEffect(() => {
    if (!completed || !full || index >= plan.length - 1 || !playing || !pageVisible) return;
    nextTimer.current = window.setTimeout(() => {
      clock.current = 0; setElapsed(0); setCompleted(false); setIndex(i => i + 1);
    }, 1000);
    return () => window.clearTimeout(nextTimer.current);
  }, [completed, full, index, plan.length, playing, pageVisible]);

  const complete = useCallback((completion: CinematicComplete) => {
    if (completion.requestId !== request.requestId) return;
    setCompleted(true);
    setEvents(previous => [...previous, completion]);
    setEvent(`${completion.type} · ${completion.requestId} · ${HANDOFF[segment]}`);
  }, [full, index, plan.length, request.requestId, segment]);

  const restart = () => {
    window.clearTimeout(nextTimer.current);
    clock.current = 0; setElapsed(0); setIndex(0); setRun(n => n + 1); setEvents([]); setCompleted(false); setPlaying(true); setEvent('Waiting for cinematic completion.');
  };

  return (
    <main className="l2-preview">
      <header className="l2-preview-header"><div><span>DEVELOPMENT ONLY · CIN-02</span><h1>More Metrics Consequences</h1></div><a href="/">Opening</a></header>
      <nav className="l2-preview-nav" aria-label="Cinematic preview states">{STATES.map((s, i) => <a key={s} href={`?cinematic=level2&state=${s}`} aria-current={s === state ? 'page' : undefined}>{STATE_LABELS[i]}</a>)}</nav>
      <div className="l2-preview-tools">
        <button onClick={() => setPlaying(p => !p)} disabled={completed && (!full || index === plan.length - 1)}>{playing ? 'Pause' : 'Play'}</button>
        <button onClick={restart}>Replay</button>
        <label>Speed <select aria-label="Speed" value={speed} onChange={e => setSpeed(Number(e.target.value))}><option value={1}>1×</option><option value={2}>2×</option><option value={4}>4×</option></select></label>
        <label className="l2-preview-scrub">Preview time <input type="range" min={0} max={duration} step={0.05} value={Math.min(elapsed, duration)} onChange={e => { window.clearTimeout(nextTimer.current); clock.current = Number(e.target.value); setElapsed(clock.current); setPlaying(false); setCompleted(false); setEvent('Waiting for cinematic completion.'); setRun(n => n + 1); }} /></label>
        <output>{Math.min(elapsed, duration).toFixed(1)} / {duration.toFixed(1)}s</output><span>{segment} · {full ? `${index + 1}/${plan.length} mock segments` : 'one segment'}</span>
      </div>
      {!supported && <p role="alert" className="l2-preview-warning">Unknown preview state: {rawState}. Showing the visible example.</p>}
      <div className="l2-preview-viewport"><div className="l2-preview-stage">
        <Level2ConsequencesSequence key={request.requestId} request={request} elapsed={elapsed} active={playing && !completed && pageVisible} reducedMotion={query.get('reduced') === '1' ? true : undefined} onComplete={complete} />
      </div></div>
      <footer className="l2-preview-footer" data-completion-count={events.length} data-completion-ids={events.map(e => e.requestId).join(',')}><p role="status" data-complete={completed}>{event}</p><p>CANDIDATE · Mock inputs only. Alex checking and facial reactions are integrated across Level 2. Full chain simulates gameplay handoffs. Final visual acceptance is pending.</p></footer>
    </main>
  );
}

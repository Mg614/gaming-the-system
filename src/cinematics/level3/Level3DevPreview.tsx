import { StrictMode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useReducedMotion } from 'framer-motion';
import type { CinematicComplete, Intensity, MetricId } from '../../shared/contracts';
import { MetricAdaptationScene, preloadAdaptationArt } from './MetricAdaptationScene';
import { MetricAdaptationSequence } from './MetricAdaptationSequence';
import { CLIP_DURATION, INTENSITIES, METRICS, SEQUENCE_DURATION, storyboardId, type AdaptationClip, type AdaptationRequest } from './adaptationTimeline';
import './preview.css';

// These fixtures inject states directly; they are not a second weighting engine.
const FIXTURES: Record<string, { label: string; clips: readonly AdaptationClip[]; weights: readonly number[] }> = {
  mixed: { label: 'Synthetic H / M / L · no weight simulation', clips: [
    { metric: 'in-class-participation', intensity: 'High' }, { metric: 'learning-reflection-quality', intensity: 'Medium' }, { metric: 'pre-class-preparation', intensity: 'Low' },
  ], weights: [] },
  equal: { label: 'Three Medium states · 34 / 33 / 33', clips: [
    { metric: 'pre-class-preparation', intensity: 'Medium' }, { metric: 'in-class-discussion-quality', intensity: 'Medium' }, { metric: 'online-peer-response-quality', intensity: 'Medium' },
  ], weights: [34, 33, 33] },
  priority: { label: 'One priority · 70 / 20 / 10', clips: [
    { metric: 'on-task-focus', intensity: 'High' }, { metric: 'online-peer-response-quality', intensity: 'Low' }, { metric: 'in-class-participation', intensity: 'Low' },
  ], weights: [70, 20, 10] },
  balanced: { label: 'Two priorities · 45 / 40 / 15', clips: [
    { metric: 'learning-reflection-quality', intensity: 'Medium' }, { metric: 'in-class-discussion-quality', intensity: 'Medium' }, { metric: 'on-task-focus', intensity: 'Low' },
  ], weights: [45, 40, 15] },
};

function Preview() {
  const initial = useMemo(() => new URLSearchParams(location.search), []);
  const [metric, setMetric] = useState<MetricId>(() => METRICS.find(m => m.alias === initial.get('metric') || m.id === initial.get('metric'))?.id ?? 'pre-class-preparation');
  const [intensity, setIntensity] = useState<Intensity>(() => INTENSITIES.find(i => i.toLowerCase() === initial.get('intensity')?.toLowerCase()) ?? 'Low');
  const [mode, setMode] = useState(initial.has('sequence') ? 'sequence' : 'single');
  const [fixture, setFixture] = useState(initial.get('sequence') && FIXTURES[initial.get('sequence')!] ? initial.get('sequence')! : 'mixed');
  const [elapsed, setElapsed] = useState(() => Math.max(0, Number(initial.get('t')) || 0));
  const [playing, setPlaying] = useState(initial.get('paused') !== '1');
  const [naturalEnd, setNaturalEnd] = useState(false);
  const [replay, setReplay] = useState(0);
  const [events, setEvents] = useState<CinematicComplete[]>([]);
  const [ready, setReady] = useState(false);
  const [assetError, setAssetError] = useState('');
  const systemReduced = useReducedMotion();
  const [reduceOverride, setReduceOverride] = useState(initial.get('reduced') === '1');
  const reduced = reduceOverride || !!systemReduced;
  const duration = mode === 'single' ? CLIP_DURATION : SEQUENCE_DURATION;
  const timeRef = useRef(elapsed);
  const selection = FIXTURES[fixture];
  const request = useMemo<AdaptationRequest>(() => ({
    requestId: `cin3a-preview-${fixture}-${replay}`, cinematicId: 'level3', level: 3,
    input: { selectedMetrics: selection.clips.map(c => c.metric),
      intensity: Object.fromEntries(selection.clips.map(c => [c.metric, c.intensity])),
      weights: Object.fromEntries(selection.clips.flatMap((c, i) => selection.weights[i] === undefined ? [] : [[c.metric, selection.weights[i]]])) },
  }), [fixture, replay, selection]);
  const complete = useCallback((e: CinematicComplete) => setEvents(previous => [...previous, e]), []);

  useEffect(() => { let mounted = true; void preloadAdaptationArt().then(() => { if (mounted) setReady(true); }).catch(() => { if (mounted) setAssetError('An approved image could not be loaded. Playback is stopped.'); }); return () => { mounted = false; }; }, []);

  useEffect(() => { timeRef.current = elapsed; }, [elapsed]);
  useEffect(() => {
    if (!playing || !ready) return;
    let frame = 0;
    let previous = performance.now();
    const tick = (now: number) => {
      const next = Math.min(duration, timeRef.current + Math.min((now - previous) / 1000, 0.1));
      previous = now; timeRef.current = next; setElapsed(next);
      if (next >= duration) { setNaturalEnd(true); setPlaying(false); } else frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, duration, ready]);

  function restart() { timeRef.current = 0; setElapsed(0); setNaturalEnd(false); setReplay(n => n + 1); setEvents([]); setPlaying(true); }
  function chooseMetric(id: MetricId, state: Intensity) { setMode('single'); setMetric(id); setIntensity(state); restart(); }
  function chooseSequence(key: string) { setMode('sequence'); setFixture(key); restart(); }
  function seek(value: number) { setPlaying(false); setNaturalEnd(false); timeRef.current = value; setElapsed(value); }

  useEffect(() => {
    const params = new URLSearchParams();
    if (mode === 'sequence') params.set('sequence', fixture);
    else { params.set('metric', METRICS.find(m => m.id === metric)!.alias); params.set('intensity', intensity.toLowerCase()); }
    history.replaceState(null, '', `${location.pathname}?${params}`);
  }, [mode, fixture, metric, intensity]);

  return <main className="l3a-preview">
    <header className="l3a-preview-heading"><div><span>GAMING THE SYSTEM / CIN-03A</span><h1>Watch Alex adapt</h1></div><span className="l3a-dev-tag">DEVELOPMENT PREVIEW</span></header>
    <div className="l3a-stage" data-playing={playing} data-time={elapsed.toFixed(3)} data-duration={duration} data-reduced-motion={reduced}>
      {!ready ? <div className="l3a-invalid" role="status">{assetError || 'Preparing approved scene artwork…'}</div> : mode === 'single' ? <MetricAdaptationScene metric={metric} intensity={intensity} time={elapsed} reducedMotion={reduced} />
        : <MetricAdaptationSequence request={request} elapsed={elapsed} active={playing || naturalEnd} reducedMotion={reduced} onComplete={complete} />}
    </div>
    <section className="l3a-controls" aria-label="Development playback controls">
      <div className="l3a-transport"><button onClick={() => elapsed >= duration ? restart() : setPlaying(p => !p)}>{playing ? 'Pause' : elapsed >= duration ? 'Play again' : 'Play'}</button><button onClick={restart}>Replay</button>
        <input aria-label="Playback position" type="range" min="0" max={duration} step="0.01" value={Math.min(duration, elapsed)} onChange={e => seek(Number(e.target.value))} />
        <output>{elapsed.toFixed(1)} / {duration.toFixed(1)}s</output>
        <label className="l3a-reduced-control"><input type="checkbox" checked={reduced} disabled={!!systemReduced} onChange={e => setReduceOverride(e.target.checked)} /> Reduced motion</label>
      </div>
      <div className="l3a-preview-info"><span>{mode === 'single' ? `${storyboardId({ metric, intensity })} · ${METRICS.find(m => m.id === metric)!.label} · ${intensity}` : selection.label}</span>
        <output data-completion-count={events.length}>{mode === 'sequence' ? `Completion events: ${events.length}` : 'Single clip inspection'}</output></div>
      <div className="l3a-preview-matrix">{METRICS.map(m => <div key={m.id}><span>{m.label}</span><div>{INTENSITIES.map(i => <button key={i} aria-pressed={mode === 'single' && metric === m.id && intensity === i} onClick={() => chooseMetric(m.id, i)}>{i}</button>)}</div></div>)}</div>
      <div className="l3a-fixtures"><label htmlFor="sequence-fixture">Three-clip montage</label><select id="sequence-fixture" value={fixture} onChange={e => chooseSequence(e.target.value)}>{Object.entries(FIXTURES).map(([key, f]) => <option key={key} value={key}>{f.label}</option>)}</select><button onClick={() => chooseSequence(fixture)}>Preview sequence</button></div>
      <p className="l3a-preview-note">Art uses approved single-panel crops and cinematic cuts. No independent eye, mouth or limb rig is claimed. Reflection and forum text are rendered in code. Audio recordings are not supplied. These controls and manually supplied states are development-only.</p>
    </section>
  </main>;
}

export function mountPreview() { createRoot(document.getElementById('root')!).render(<StrictMode><Preview /></StrictMode>); }

import { useCallback, useRef, useState } from 'react';
import { useAnimationFrame, useReducedMotion } from 'framer-motion';
import { Level3RebalanceCompareSequence } from './Level3RebalanceCompareSequence';
import { DevAdaptation, devBehaviour } from './DevBehaviourAdapter';
import { scenarios, selectedMetrics, uneven, type ScenarioId } from './devScenarios';
import { adaptationShots, handoffShots, shotSeconds } from './presentation';
import type { CompareComplete, ShotEvent } from './types';
import './preview.css';

const query = new URLSearchParams(window.location.search);
const requested = query.get('scenario') ?? 'rebalance';
const initialScenario: ScenarioId = requested in scenarios ? requested as ScenarioId : 'rebalance';

export default function DevPreview() {
  const [scenario, setScenario] = useState<ScenarioId>(initialScenario);
  const [index, setIndex] = useState(0);
  const [run, setRun] = useState(1);
  const [elapsed, setElapsed] = useState(0);
  const time = useRef(0);
  const [paused, setPaused] = useState(false);
  const [gate, setGate] = useState(false);
  const [complete, setComplete] = useState(false);
  const [rate, setRate] = useState(1);
  const [reduce, setReduce] = useState(false);
  const systemReduce = useReducedMotion();
  const [prelude, setPrelude] = useState(initialScenario === 'handoff');
  const [events, setEvents] = useState<string[]>([]);
  const plan = scenarios[scenario].frames;
  const frame = plan[index];
  const requestId = `cin03b-dev-${run}`;
  const active = useRef({ requestId, shot: frame.shot });
  active.current = { requestId, shot: frame.shot };

  useAnimationFrame((_, delta) => {
    if (paused || gate || complete) return;
    time.current += Math.min(delta, 100) / 1000 * rate;
    setElapsed(time.current);
  });

  const resetTime = () => { time.current = 0; setElapsed(0); };
  const restart = (next = scenario) => {
    setScenario(next); setIndex(0); setRun(n => n + 1); resetTime();
    setGate(false); setComplete(false); setPaused(false); setPrelude(next === 'handoff'); setEvents([]);
    const url = new URL(window.location.href); url.searchParams.set('scenario', next); window.history.replaceState(null, '', url);
  };
  const nextShot = useCallback((event: ShotEvent) => {
    if (event.requestId !== active.current.requestId || event.shot !== active.current.shot) return;
    setEvents(items => [...items, `${event.shot}: complete`]);
    if (index + 1 < plan.length) { setIndex(index + 1); time.current = 0; setElapsed(0); }
    else setComplete(true);
  }, [index, plan.length]);
  const handoff = useCallback((event: ShotEvent) => {
    if (event.requestId !== active.current.requestId || event.shot !== active.current.shot) return;
    setGate(true); setEvents(items => [...items, `${event.shot}: waiting for supplied result`]);
  }, []);
  const finish = useCallback((event: CompareComplete) => {
    if (event.requestId !== active.current.requestId) return;
    setComplete(true); setEvents(items => [...items, event.type]);
  }, []);
  const injectResult = () => { setGate(false); nextShot({ requestId, shot: frame.shot }); };
  const jump = (next: number) => {
    setRun(n => n + 1); setIndex(next); resetTime(); setGate(false); setComplete(false); setPrelude(false);
  };
  const seekLimit = adaptationShots.includes(frame.shot) ? 16 : shotSeconds[frame.shot];

  return <main className="l3b-preview">
    <header className="l3b-preview-header"><div><span>GAMING THE SYSTEM</span><h1>Rebalance & Compare</h1></div><p>DEV PREVIEW<br /><small>Mock outcomes · temporary CIN-03A stills</small></p></header>
    <div className="l3b-screen">
      {prelude ? <div className="l3b-stage"><div className="l3b-adaptation"><DevAdaptation selectedMetrics={selectedMetrics} result={uneven} elapsed={elapsed} paused={paused} reducedMotion={reduce || !!systemReduce} onComplete={() => { setPrelude(false); resetTime(); setEvents(['Simulated adaptation_sequence_complete']); }} /></div></div> :
        <Level3RebalanceCompareSequence requestId={requestId} frame={frame} selectedMetrics={selectedMetrics} elapsed={elapsed} paused={paused} reducedMotion={reduce} behaviour={devBehaviour} onShotComplete={nextShot} onHandoff={handoff} onComplete={finish} />}
    </div>
    <section className="l3b-controls" aria-label="Development preview controls">
      <div className="l3b-control-row">
        <label>Preview <select aria-label="Preview scenario" value={scenario} onChange={e => restart(e.target.value as ScenarioId)}>{Object.entries(scenarios).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}</select></label>
        <button onClick={() => setPaused(value => !value)}>{paused ? 'Resume' : 'Pause'}</button>
        <button onClick={() => restart()}>Replay</button>
        <label>Speed <select aria-label="Playback speed" value={rate} onChange={e => setRate(Number(e.target.value))}><option value={1}>1×</option><option value={4}>4×</option><option value={8}>8×</option></select></label>
        <label className="l3b-checkbox"><input type="checkbox" checked={reduce} onChange={e => setReduce(e.target.checked)} /> Reduced motion{systemReduce ? ' (system enabled)' : ''}</label>
      </div>
      <div className="l3b-control-row">
        <label>Shot <select aria-label="Storyboard shot" value={index} onChange={e => jump(Number(e.target.value))}>{plan.map((step, i) => <option key={`${step.shot}-${i}`} value={i}>CIN3B-{step.shot}</option>)}</select></label>
        <label className="l3b-seek">Seek within shot <input aria-label="Seek within shot" type="range" min={0} max={seekLimit} step={.1} value={Math.min(elapsed, seekLimit)} disabled={prelude || handoffShots.includes(frame.shot)} onChange={e => { setPaused(true); setComplete(false); setRun(n => n + 1); time.current = Number(e.target.value); setElapsed(time.current); }} /></label>
        <output data-testid="clock">{elapsed.toFixed(1)}s</output>
        <output data-testid="status">{prelude ? 'Simulated CIN-03A' : complete ? 'Held for review' : gate ? 'Waiting at gameplay boundary' : paused ? 'Paused' : `Playing CIN3B-${frame.shot}`}</output>
      </div>
      {gate && <div className="l3b-handoff"><p>Cinematic paused. The next result is supplied by this DEV fixture.</p><button onClick={injectResult}>{frame.shot === 'S07' ? 'DEV · Inject 34 / 33 / 33 test result' : frame.shot === 'S10' ? 'DEV · Inject contrast result' : 'DEV · Inject rebalanced result'}</button></div>}
      <details><summary>Integration status & events</summary><p>Effort magnitudes are illustrative. These reference crops do not simulate Low / Medium / High acting. Real CIN-03A, gameplay and CIN-04 connections are pending. No sound files are present in this foundation; optional audio hooks are ready.</p><ol data-testid="events">{events.map((event, i) => <li key={i}>{event}</li>)}</ol></details>
    </section>
  </main>;
}

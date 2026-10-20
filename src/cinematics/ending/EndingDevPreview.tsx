import { useMemo, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { isMetricId, metricIds, branches } from '../level1/level1Content';
import { EndingTheoryRevealSequence } from './EndingTheoryRevealSequence';
import { devInput, DevWeightMemory } from './devInput';
import { ENDING_FRAMES, sectionFrame } from './endingTimeline';
import './preview.css';

export default function EndingDevPreview() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const systemReduced = useReducedMotion();
  const [reduced, setReduced] = useState(params.get('reduced') === '1');
  const [run, setRun] = useState(1);
  const [metric, setMetric] = useState(devInput.selectedMetric);
  const [completions, setCompletions] = useState(0);
  const [handoffs, setHandoffs] = useState(0);
  const [destination, setDestination] = useState(false);
  const input = useMemo(() => ({ ...devInput, selectedMetric: metric, requestId: `ending-dev-${run}` }), [run, metric]);
  const requestedFrame = Number(params.get('frame'));
  const initialFrame = run === 1 ? params.has('frame') && Number.isFinite(requestedFrame)
    ? Math.max(0, Math.min(ENDING_FRAMES - 1, Math.floor(requestedFrame))) : sectionFrame(params.get('scene')) : 0;
  const replay = () => { setRun(n => n + 1); setDestination(false); setCompletions(0); setHandoffs(0); };
  return <main className="end-preview">
    <header><div><p>CIN–04 / DEVELOPMENT SCREENING</p><h1>Ending · Theory Reveal</h1></div><a href="/">Opening ↗</a></header>
    {destination ? <section className="end-design-lab" aria-label="Design Lab placeholder"><span>END OF CIN–04</span><h2>Design Lab</h2><p>Placeholder destination. The next activity will be supplied by the integration team.</p><button onClick={replay}>Replay Ending</button></section>
      : <EndingTheoryRevealSequence input={input} WeightMemory={DevWeightMemory} reducedMotion={reduced || !!systemReduced} showControls initialFrame={initialFrame} onReplay={replay}
        onComplete={() => setCompletions(n => n + 1)} onHandoff={() => { setHandoffs(n => n + 1); setDestination(true); }} />}
    <footer>
      <div className="end-preview-options"><label><input type="checkbox" checked={reduced || !!systemReduced} disabled={!!systemReduced} onChange={e => setReduced(e.target.checked)} /> Reduced motion{systemReduced ? ' · system preference' : ''}</label>
        <label>Level 1 memory <select value={metric} onChange={e => { if (isMetricId(e.target.value)) { setMetric(e.target.value); replay(); } }}>{metricIds.map(id => <option key={id} value={id}>{branches[id].label}</option>)}</select></label>
      </div>
      <p>DEV inputs · L1/L2 renderers and L3 comparison reused. L3 behaviour thumbnails are reference stills; live CIN-03A integration is pending. Audio is not supplied.</p>
      <output aria-label="Completion events">Completion events: {completions}</output><output aria-label="Handoff events">Handoff events: {handoffs}</output>
    </footer>
  </main>;
}

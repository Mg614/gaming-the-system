import { useEffect, useRef } from 'react';
import firstReference from '../../../docs/visual-style/references/level3-rebalance-compare/REF-L3B-001.png';
import balancedReference from '../../../docs/visual-style/references/level3-rebalance-compare/REF-L3B-002.png';
import type { AdaptationProps, BehaviourPresentation, MemoryProps } from './types';
import { ease, metricNames } from './presentation';

// Text-free windows into approved reference art. No new raster assets or acting states.
// A crop is a temporary still, not a real CIN-03A behaviour clip.
function ReferenceWindow({ index, elapsed, reducedMotion }: Pick<MemoryProps, 'index' | 'elapsed' | 'reducedMotion'>) {
  const windows = [[90, 376, 212, 219], [329, 376, 211, 219], [559, 376, 210, 219]];
  const [x, y, w, h] = windows[index % windows.length];
  const drift = reducedMotion ? 0 : Math.sin(elapsed * .22) * 2;
  return <svg viewBox={`${x + drift} ${y} ${w} ${h}`} preserveAspectRatio="xMidYMid slice" role="img" aria-label="Temporary Alex reference still; CIN-03A clip pending" style={{ overflow: 'hidden' }}>
    <image href={balancedReference} width="1672" height="941" />
  </svg>;
}

export function DevAdaptation({ selectedMetrics, result, elapsed, paused, reducedMotion, onComplete }: AdaptationProps) {
  const reported = useRef(false);
  useEffect(() => {
    if (elapsed >= 9 && !paused && !reported.current) {
      reported.current = true;
      onComplete();
    }
  }, [elapsed, paused, onComplete]);
  const index = Math.min(2, Math.floor(elapsed / 3));
  const localTime = elapsed - index * 3;
  return <div className="l3b-dev-adaptation" style={{ opacity: reducedMotion ? 1 : .82 + ease(localTime, 0, .4) * .18 }}>
    <div className="l3b-memory"><ReferenceWindow index={index} elapsed={elapsed} reducedMotion={reducedMotion} /></div>
    <div><p>Temporary CIN-03A stand-in · {index + 1} / 3</p><h2>{metricNames[selectedMetrics[index]]}</h2><strong>{result.weights[index]}%</strong><p>{result.intensity[index]} · supplied preview state</p></div>
  </div>;
}

export const devBehaviour: BehaviourPresentation = {
  Memory: ReferenceWindow,
  Adaptation: DevAdaptation,
  hero: <svg viewBox="8 210 515 620" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Alex in his rust-orange hoodie at a study desk; temporary reference crop" style={{ overflow: 'hidden' }}><image href={firstReference} width="1672" height="941" /></svg>,
};

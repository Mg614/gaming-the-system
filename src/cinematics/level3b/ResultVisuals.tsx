import type { CSSProperties } from 'react';
import type { MetricId } from '../../shared/contracts';
import type { BehaviourPresentation, Three, WeightingResult } from './types';
import { ease, metricNames, mix } from './presentation';

interface SnapshotProps {
  result: WeightingResult;
  selectedMetrics: Three<MetricId>;
  behaviour: BehaviourPresentation;
  elapsed: number;
  reducedMotion: boolean;
  title: string;
  from?: WeightingResult;
  settled?: boolean;
  compact?: boolean;
  style?: CSSProperties;
}

export function EffortBar({ value, from = 0, progress, label }: { value: number; from?: number; progress: number; label: string }) {
  // Interpolation changes the presentation only. The supplied endpoints are never inferred.
  const displayed = mix(from, value, progress);
  return <div className="l3b-effort-track" role="img" aria-label={label} data-effort={value}>
    <div className="l3b-effort-fill" style={{ transform: `scaleX(${displayed})` }} />
  </div>;
}

export function WeightingSnapshot({ result, selectedMetrics, behaviour: { Memory }, elapsed, reducedMotion, title, from, settled = false, compact = false, style }: SnapshotProps) {
  const progress = settled || reducedMotion ? 1 : ease(elapsed, .65, 1.8);
  return <section className={`l3b-snapshot ${compact ? 'l3b-snapshot-compact' : ''}`} style={style} aria-label={title} data-result={result.id}>
    <h2>{title}</h2>
    <div className="l3b-measures">
      {selectedMetrics.map((metric, index) => <div className="l3b-measure" key={metric} data-metric={metric}>
        <div className="l3b-weight"><span>{progress >= 1 ? result.weights[index] : Math.round(mix(from?.weights[index] ?? result.weights[index], result.weights[index], progress))}</span><small>%</small></div>
        <p className="l3b-metric-name">{metricNames[metric]}</p>
        <div className="l3b-memory"><Memory metric={metric} index={index} result={result} elapsed={reducedMotion ? 0 : elapsed} reducedMotion={reducedMotion} /></div>
        <EffortBar value={result.effort[index]} from={from?.effort[index]} progress={progress} label={`${metricNames[metric]}: ${result.intensity[index]} effort`} />
      </div>)}
    </div>
    <p className="l3b-effort-label">Student Effort</p>
  </section>;
}

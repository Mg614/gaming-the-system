import type { MetricId } from '../../shared/contracts';
import type { ShotId } from './types';
import { clamp01 } from '../shared/engine/timeline/animationMath';

export const metricNames: Record<MetricId, string> = {
  'pre-class-preparation': 'Pre-class preparation',
  'in-class-participation': 'In-class participation',
  'on-task-focus': 'On-task focus',
  'in-class-discussion-quality': 'Discussion quality',
  'learning-reflection-quality': 'Learning reflection',
  'online-peer-response-quality': 'Online peer response',
};

// Reading time is slightly longer for the two-line dialogue and result beats.
// Adaptations finish only when the supplied CIN-03A adapter reports completion.
export const shotSeconds: Record<ShotId, number> = {
  S01: 4, S02: 7, S03: 1, S04: 2.4, S05: Infinity, S06: 6,
  S07: 2.5, S08: Infinity, S09: 5.5, S10: 3.5, S11: Infinity,
  S12: 2.5, S13: 7, S14: 1,
};
export const handoffShots: readonly ShotId[] = ['S03', 'S07', 'S10'];
export const adaptationShots: readonly ShotId[] = ['S05', 'S08', 'S11'];
export const ease = (time: number, start: number, duration: number) => {
  const x = clamp01((time - start) / duration);
  return x * x * (3 - 2 * x);
};
export const mix = (a: number, b: number, progress: number) => a + (b - a) * progress;

/** Shot-specific framing avoids restarting the same zoom at every dialogue beat. */
export function cameraScale(shot: ShotId, elapsed: number, reduced: boolean, adaptationDone?: number) {
  if (reduced) return 1;
  if (shot === 'S01') return mix(1.065, 1, ease(elapsed, 0, 4));
  if (shot === 'S04') return mix(1, 1.025, ease(elapsed, 0, 2.4));
  if (shot === 'S05' || shot === 'S08') return 1.025;
  if (shot === 'S06' || shot === 'S09') return mix(1.025, 1, ease(elapsed, 0, 4));
  if (shot === 'S11') return adaptationDone === undefined
    ? mix(1, 1.025, ease(elapsed, 0, 2)) : mix(1.025, 1, ease(elapsed - adaptationDone, 0, 3));
  if (shot === 'S12') return mix(1, 1.02, ease(elapsed, 0, 2.5));
  if (shot === 'S13') return mix(1.02, 1, ease(elapsed, 0, 6));
  return 1;
}

export function resultCopy(shot: ShotId, time: number, nearEqual: boolean): string {
  if (shot === 'S02') return time < 3.8
    ? 'Maybe I should balance the weights. Would that change how Alex learns?'
    : 'Oh! So the priorities have changed again?';
  if (shot === 'S06') return !nearEqual || time < 2.2
    ? 'You changed the weights. Student effort moved with them.'
    : time < 3.8 ? 'The effort became more balanced.' : 'The balance improved — but the percentages still mattered.';
  if (shot === 'S07') return 'What happens when the weights are almost equal?';
  if (shot === 'S09') return time < 2.5 ? 'The effort became more balanced.' : 'The balance improved — but the percentages still mattered.';
  if (shot === 'S10') return 'Try a clearer priority.';
  if (shot === 'S13' || shot === 'S14') {
    if (time < 2.2) return '';
    if (time < 4.2) return 'Different weights produced different effort patterns.';
    if (time < 5.6) return 'The near-equal version produced the most even effort.';
    return 'But in both cases, students still used the percentages to decide how to divide their effort.';
  }
  return '';
}

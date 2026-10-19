import type { MetricId } from '../../shared/contracts';
import type { ShotFrame, Three, WeightingResult } from './types';

// DEV fixtures only. These illustrative effort magnitudes are not official calculations.
export const selectedMetrics: Three<MetricId> = ['pre-class-preparation', 'in-class-participation', 'in-class-discussion-quality'];
export const uneven: WeightingResult = { id: 'first-uneven', category: 'uneven', weights: [60, 20, 20], effort: [.88, .25, .24], intensity: ['High', 'Low', 'Low'] };
export const rebalanced: WeightingResult = { id: 'second-near-equal', category: 'near-equal', weights: [34, 33, 33], effort: [.55, .53, .53], intensity: ['Medium', 'Medium', 'Medium'] };
export const stillUneven: WeightingResult = { id: 'second-uneven', category: 'uneven', weights: [45, 35, 20], effort: [.72, .55, .25], intensity: ['High', 'Medium', 'Low'] };
export const limit: WeightingResult = { ...rebalanced, id: 'test-limit' };
export const contrast: WeightingResult = { id: 'contrast-uneven', category: 'uneven', weights: [20, 60, 20], effort: [.25, .88, .24], intensity: ['Low', 'High', 'Low'] };

/** DEV-only orchestration. Production gameplay will supply the shot and snapshots.
 * Select supplied labels, never classify weights or calculate effort. */
export function buildDevPlan(first: WeightingResult, second: WeightingResult, testLimit: WeightingResult, history: readonly WeightingResult[] = []): ShotFrame[] {
  const frames: ShotFrame[] = [{ shot: 'S01', current: first }];
  const results = [...history, first];
  const hasBoth = () => results.some(r => r.category === 'uneven') && results.some(r => r.category === 'near-equal');
  if (!hasBoth()) {
    if (first.category === 'near-equal') {
      frames.push({ shot: 'S10', current: first }, { shot: 'S11', current: second, previous: first });
    } else {
      frames.push({ shot: 'S02', current: first }, { shot: 'S03', current: first },
        { shot: 'S04', current: second, previous: first }, { shot: 'S05', current: second },
        { shot: 'S06', current: second, previous: first });
    }
    results.push(second);
    if (!hasBoth() && !results.some(r => r.category === 'near-equal')) {
      frames.push({ shot: 'S07', current: second, previous: first, history: [first, second] },
        { shot: 'S08', current: testLimit }, { shot: 'S09', current: testLimit, previous: second });
      results.push(testLimit);
    }
  }
  const a = results.find(r => r.category === 'uneven');
  const b = results.find(r => r.category === 'near-equal');
  if (!a || !b) throw new Error('DEV scenario needs an externally supplied uneven and near-equal result.');
  const comparison = { uneven: a, nearEqual: b };
  frames.push(...(['S12', 'S13', 'S14'] as const).map(shot => ({ shot, current: b, comparison, history: results })));
  return frames;
}

export const scenarios = {
  rebalance: { label: 'Uneven → Rebalance → Near-equal', frames: buildDevPlan(uneven, rebalanced, limit) },
  limit: { label: 'Uneven → Uneven → Test the Limit', frames: buildDevPlan(uneven, stillUneven, limit) },
  contrast: { label: 'Near-equal → Create a Contrast', frames: buildDevPlan(rebalanced, contrast, limit) },
  first: { label: 'First result only', frames: [{ shot: 'S01', current: uneven }] as ShotFrame[] },
  'near-equal': { label: 'Near-equal improvement only', frames: [{ shot: 'S09', current: rebalanced, previous: uneven }] as ShotFrame[] },
  compare: { label: 'Compare the Patterns only', frames: buildDevPlan(uneven, rebalanced, limit).slice(-3) },
  handoff: { label: 'Simulated CIN-03A → CIN-03B handoff', frames: buildDevPlan(uneven, rebalanced, limit) },
};
export type ScenarioId = keyof typeof scenarios;

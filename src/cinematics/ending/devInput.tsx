import balancedReference from '../../../docs/visual-style/references/level3-rebalance-compare/REF-L3B-002.png';
import type { MemoryProps } from '../level3b/types';
import type { EndingInput } from './types';
import { EndingComposition } from './EndingComposition';

/** Imported only by the guarded DEV entry / Studio, never by the reusable player. */
export const devInput: EndingInput = {
  requestId: 'ending-dev-1',
  selectedMetric: 'in-class-participation',
  selectedMetrics: ['pre-class-preparation', 'in-class-participation', 'in-class-discussion-quality'],
  checklistLabels: ['Pre-class preparation', 'In-class participation', 'On-task focus', 'Discussion quality', 'Learning reflection', 'Peer response'],
  comparison: {
    uneven: { id: 'first-uneven', category: 'uneven', weights: [60, 20, 20], effort: [.88, .25, .24], intensity: ['High', 'Low', 'Low'] },
    nearEqual: { id: 'second-near-equal', category: 'near-equal', weights: [34, 33, 33], effort: [.55, .53, .53], intensity: ['Medium', 'Medium', 'Medium'] },
  },
};

/** Same text-free crop strategy as CIN-03B. This is NOT a CIN-03A animation. */
export function DevWeightMemory({ index, elapsed, reducedMotion }: MemoryProps) {
  const windows = [[90, 405, 212, 190], [329, 405, 211, 190], [559, 405, 210, 190]];
  const [x, y, width, height] = windows[index % 3];
  const drift = reducedMotion ? 0 : Math.sin(elapsed * .22) * 1.5;
  return <svg viewBox={`${x + drift} ${y} ${width} ${height}`} preserveAspectRatio="xMidYMid slice" role="img" aria-label="DEV reference memory; integrated CIN-03A behaviour pending">
    <image href={balancedReference} width="1672" height="941" />
  </svg>;
}

export const EndingStudioComposition = ({ reducedMotion = false }: { reducedMotion?: boolean }) =>
  <EndingComposition input={devInput} WeightMemory={DevWeightMemory} reducedMotion={reducedMotion} />;

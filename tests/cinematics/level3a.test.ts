import test from 'node:test';
import assert from 'node:assert/strict';
import { DIALOGUE, INTENSITIES, METRICS, SEQUENCE_DURATION, suppliedClips, sequenceFrame, storyboardId, participationBeat, reflectionText } from '../../src/cinematics/level3/adaptationTimeline.ts';

const request = {
  requestId: 'test-1', cinematicId: 'level3' as const, level: 3 as const,
  input: { selectedMetrics: ['in-class-participation', 'learning-reflection-quality', 'pre-class-preparation'] as const,
    intensity: { 'in-class-participation': 'High' as const, 'learning-reflection-quality': 'Medium' as const, 'pre-class-preparation': 'Low' as const },
    weights: { 'in-class-participation': 10, 'learning-reflection-quality': 20, 'pre-class-preparation': 70 } },
};
test('all eighteen states map exactly to S02–S19 and have official dialogue', () => {
  const shots = METRICS.flatMap(m => INTENSITIES.map(intensity => { assert.ok(DIALOGUE[m.id][intensity]); return storyboardId({ metric: m.id, intensity }); }));
  assert.deepEqual(shots, Array.from({ length: 18 }, (_, i) => `CIN3A-S${String(i + 2).padStart(2, '0')}`));
});
test('consumes supplied intensities even when weights would suggest different ones; never reorders', () => {
  assert.deepEqual(suppliedClips(request), [
    { metric: 'in-class-participation', intensity: 'High' }, { metric: 'learning-reflection-quality', intensity: 'Medium' }, { metric: 'pre-class-preparation', intensity: 'Low' },
  ]);
  assert.deepEqual(suppliedClips({ ...request, input: { ...request.input, weights: {} } }), suppliedClips(request));
});
test('incomplete, duplicate and unsupported selections never produce a fabricated clip', () => {
  assert.equal(suppliedClips({ ...request, input: { ...request.input, selectedMetrics: request.input.selectedMetrics.slice(1) } }), null);
  assert.equal(suppliedClips({ ...request, input: { ...request.input, selectedMetrics: ['in-class-participation', 'in-class-participation', 'pre-class-preparation'] } }), null);
  assert.equal(suppliedClips({ ...request, input: { ...request.input, intensity: {} } }), null);
  assert.equal(suppliedClips({ ...request, requestId: '' }), null);
});
test('orchestrator plays exactly three clips, preserving order and two short bridges', () => {
  const phases: string[] = [];
  for (let t = 0; t <= SEQUENCE_DURATION + 0.1; t += 0.01) {
    const f = sequenceFrame(t); const key = `${f.phase}:${f.clipIndex}`;
    if (phases.at(-1) !== key) phases.push(key);
  }
  assert.deepEqual(phases, ['entry:0', 'clip:0', 'bridge:0', 'clip:1', 'bridge:1', 'clip:2', 'exit:2']);
  assert.equal(sequenceFrame(SEQUENCE_DURATION + 100).phase, 'exit');
  assert.equal(sequenceFrame(-10).phase, 'entry');
  assert.equal(sequenceFrame(Number.NaN).phase, 'entry');
});
test('participation increases the number of editorial hand-raise beats', () => {
  const counts = INTENSITIES.map(i => { let count = 0; let last = ''; for (let t = 0; t < 4; t += 0.01) { const beat = participationBeat(i, t); if (beat === 'raise' && last !== beat) count++; last = beat; } return count; });
  assert.deepEqual(counts, [1, 2, 3]);
});
test('reflection retains the low two lines, a real medium thinking pause, and cumulative high edits', () => {
  assert.equal(reflectionText('Low', 3).split('\n').length, 2);
  assert.equal(reflectionText('Medium', 1.75), reflectionText('Medium', 2.05));
  assert.ok(reflectionText('Medium', 3.9).length > reflectionText('Low', 3.9).length);
  assert.ok(reflectionText('High', 3).startsWith(reflectionText('High', 1)));
  assert.match(reflectionText('High', 3), /Next time/);
});

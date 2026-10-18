import { test } from 'node:test';
import assert from 'node:assert/strict';
import { alexBlinkAt, level2Performance } from '../../src/cinematics/level2/level2Performance.ts';
import { checklistPresentation, checkingPenState } from '../../src/cinematics/level2/checklistPresentation.ts';
import { getLevel2Shots, sequenceDuration, shotAt, type Level2Request } from '../../src/cinematics/level2/level2Timeline.ts';

const request = (phase: string, category?: string): Level2Request => ({
  requestId: 'test', cinematicId: 'level2', level: 2,
  input: { phase, selectedMetrics: ['pre-class-preparation', 'in-class-participation', 'on-task-focus'], resultCategory: category },
});

test('all mock segments follow the storyboard, ending exactly once', () => {
  const segments = ['three', 'six', '10', '25', '100'];
  const shots = segments.flatMap(phase => getLevel2Shots(request(phase, 'mixed-broad')));
  assert.deepEqual(shots.map(s => s.storyboard), ['CIN2-S01', 'CIN2-S02', 'CIN2-S03', 'CIN2-S05', 'CIN2-S06', 'CIN2-S07', 'CIN2-S08', 'CIN2-S09', 'CIN2-S10', 'CIN2-S11', 'CIN2-S12']);
  // S04 is the teammate-owned gameplay selection, deliberately absent.
  for (const phase of segments) {
    const sequence = getLevel2Shots(request(phase, 'mixed-broad'));
    assert.equal(shotAt(sequence, sequenceDuration(sequence) + 100)?.shot.id, sequence.at(-1)?.id);
    assert.equal(shotAt(sequence, -10)?.time, 0);
  }
});

test('three-metric presentation requires a supplied category and never classifies metrics', () => {
  for (const category of ['visible-behaviour-heavy', 'quality-depth-heavy', 'mixed-broad']) {
    assert.equal(getLevel2Shots(request('three', category)).length, 3);
  }
  assert.deepEqual(getLevel2Shots(request('three')), []);
  assert.deepEqual(getLevel2Shots(request('three', 'invented')), []);
  assert.deepEqual(getLevel2Shots(request('unsupported')), []);
});

test('checklist completion is monotonic, bounded, and replayable at every supported density', () => {
  for (const count of [3, 6, 10, 25, 100]) {
    let previous = new Set<number>();
    for (let frame = 0; frame <= 1000; frame++) {
      const state = checklistPresentation(count, frame / 1000);
      assert.ok([...previous].every(i => state.checked.has(i)));
      assert.ok([...state.checked, ...state.targets].every(i => i >= 0 && i < count));
      assert.ok(state.linkProgress >= 0 && state.linkProgress <= 1);
      previous = state.checked;
    }
    assert.equal(previous.size, count);
    assert.equal(checklistPresentation(count, 1).targets.length, 0);
    assert.equal(checklistPresentation(count, 0, true).checked.size, count);
    assert.deepEqual(checklistPresentation(count, .4), checklistPresentation(count, .4));
  }
});

test('10 revisits a missed criterion; 25 reuses evidence; 100 closes existing gaps', () => {
  const ten = checklistPresentation(10, .9);
  assert.equal(ten.checked.size, 9);
  assert.deepEqual(ten.targets, [3]);
  const twentyFive = checklistPresentation(25, 0);
  assert.deepEqual(twentyFive.targets, [0, 3, 6]);
  assert.equal(twentyFive.checked.size, 0);
  const hundred = checklistPresentation(100, 0);
  assert.equal(hundred.checked.size, 88);
  assert.equal(hundred.targets.length, 3);
  assert.equal(checklistPresentation(100, 1).checked.size, 100);
});

test('evidence draws before a criterion is marked and malformed progress stays safe', () => {
  const linking = checklistPresentation(25, .04);
  assert.ok(linking.linkProgress > 0);
  assert.equal(linking.markProgress, 0);
  assert.equal(linking.checked.size, 0);
  for (const bad of [NaN, Infinity, -1]) assert.equal(checklistPresentation(10, bad).checked.size, 0);
  assert.equal(checklistPresentation(10, 2).checked.size, 10);
});

 test('duration ends exactly on the preview slider step', () => {
  assert.equal(sequenceDuration(getLevel2Shots(request('three', 'mixed-broad'))), 15.6);
  assert.equal(sequenceDuration(getLevel2Shots(request('100'))), 19.2);
});


test('integrated checking edits shorten while all checklist stages finish before their handoff', () => {
  assert.equal(level2Performance('three-checklist', 1).view, 'checking');
  assert.equal(level2Performance('three-checklist', 3).view, 'portrait');
  const inserts: [string, number][] = [];
  for (const [id, duration, count] of [['six-checklist', 9.5, 6], ['ten', 4.8, 10], ['twenty-five', 5.1, 25], ['hundred', 5.9, 100]] as const) {
    let seconds = 0;
    let completed = 0;
    for (let i = 0; i <= Math.round(duration * 100); i++) {
      const state = level2Performance(id, i / 100);
      if (state.view === 'insert') seconds += .01;
      const checklist = checklistPresentation(count, state.progress!);
      assert.ok(checklist.checked.size >= completed);
      completed = checklist.checked.size;
      if (state.view === 'insert') {
        const pen = checkingPenState(count, state.progress!);
        assert.ok(pen.criterion >= 1 && pen.criterion <= count);
        assert.ok(pen.mark >= 0 && pen.mark <= 1);
        assert.equal(pen.mark, checklist.checked.has(pen.criterion - 1) ? 1 : checklist.markProgress);
      }
    }
    assert.equal(completed, count);
    inserts.push([id, seconds]);
  }
  assert.ok(inserts[1][1] > inserts[2][1] && inserts[2][1] > inserts[3][1]);
});

test('reaction pauses, irregular blinking and seeking derive only from supplied time', () => {
  assert.equal(level2Performance('perfect', 3).expression, 'pleased');
  assert.equal(level2Performance('reflection', 1.6).expression, 'pleased');
  assert.equal(level2Performance('reflection', 1.9).expression, 'uncertain');
  assert.equal(level2Performance('reflection', 2.3).uncertainty, 1);
  assert.equal(alexBlinkAt(1.34), true);
  assert.equal(alexBlinkAt(1.6), false);
  for (const t of [0, 1.34, 1.9, 3.7]) {
    const expected = level2Performance('reflection', t);
    level2Performance('reflection', 5.1);
    level2Performance('reflection', 0);
    assert.deepEqual(level2Performance('reflection', t), expected);
    assert.equal(alexBlinkAt(t), alexBlinkAt(t));
  }
  assert.equal(checkingPenState(3, 1).mark, 1, 'pen holds the stroke endpoint during lift');
});

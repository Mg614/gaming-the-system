import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { SHOTS, ENDING_FRAMES, ENDING_FPS, completionLatch, dialogueAt, shotAt, sectionFrame, QUESTION, QUOTE } from '../src/cinematics/ending/endingTimeline.ts';

test('all 12 approved shots occupy the whole timeline, without gaps or overlaps', () => {
  assert.equal(SHOTS.length, 12);
  for (let f = 0; f < ENDING_FRAMES; f++) {
    const t = f / ENDING_FPS;
    const matches = SHOTS.filter(s => t >= s.start && t < s.end);
    assert.equal(matches.length, 1, `frame ${f}`);
    assert.equal(shotAt(t), matches[0]);
  }
  assert.deepEqual(SHOTS.map(s => s.id), Array.from({ length: 12 }, (_, i) => `CIN4-S${String(i + 1).padStart(2, '0')}`));
});

test('the central question and quiet threshold precede naming the theory', () => {
  assert.equal(sectionFrame('question'), 1050);
  assert.equal(sectionFrame('goodhart'), 1290);
  assert.equal(shotAt(42.8).section, 'threshold');
  assert.equal(QUESTION, 'Are we improving learning, or just improving the numbers?');
  assert.equal(QUOTE, 'When a measure becomes a target, it ceases to be a good measure.');
  assert.ok(dialogueAt(1).text.startsWith('Balancing the weights helped.'));
  assert.equal(dialogueAt(12).text, 'Isn’t that what I’m supposed to do?');
  assert.equal(dialogueAt(18), null);
});

test('completion ignores premature frames and emits once across repeat ends and seeks', () => {
  const firstRequest = completionLatch();
  assert.equal(firstRequest(ENDING_FRAMES - 2), false);
  assert.equal(firstRequest(0), false);
  assert.equal(firstRequest(ENDING_FRAMES - 1), true);
  assert.equal(firstRequest(ENDING_FRAMES - 1), false);
  assert.equal(firstRequest(0), false);
  assert.equal(firstRequest(ENDING_FRAMES - 1), false);
  const replayRequest = completionLatch();
  assert.equal(replayRequest(ENDING_FRAMES - 1), true);
  assert.equal(replayRequest(ENDING_FRAMES - 1), false);
});

test('copied upstream leaves remain byte-for-byte identical to committed sources', () => {
  const sources = {
    '1bdd0c4': ['level1/ConsequenceScene.tsx', 'level1/level1Content.ts', 'level1/branch.css'],
    c8c1c83: ['level2/AlexCheckingSequence.tsx', 'level2/ChecklistSystem.tsx', 'level2/checklistPresentation.ts', 'level2/alexCheckingTimeline.ts', 'level2/alexChecking.css', 'level2/checklist.css'],
    '0b35379': ['level3b/ResultVisuals.tsx', 'level3b/presentation.ts', 'level3b/types.ts', 'level3b/level3b.css'],
  };
  for (const [commit, paths] of Object.entries(sources)) for (const suffix of paths) {
    const path = `src/cinematics/${suffix}`;
    assert.deepEqual(readFileSync(path), execFileSync('git', ['show', `${commit}:${path}`]), path);
  }
});

test('production output excludes Ending preview data, controls and theory assets', () => {
  const scripts = readdirSync('dist/assets').filter(f => f.endsWith('.js')).map(f => readFileSync(`dist/assets/${f}`, 'utf8')).join('\n');
  for (const forbidden of ['ending-dev-1', 'CIN–04 / DEVELOPMENT SCREENING', 'Ending timeline', 'DEV reference memory; integrated CIN-03A behaviour pending']) {
    assert.equal(scripts.includes(forbidden), false, forbidden);
  }
});

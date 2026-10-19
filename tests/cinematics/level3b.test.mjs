import assert from 'node:assert/strict';
import { createServer as createHttpServer } from 'node:http';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { after, test } from 'node:test';
import { createServer, build } from 'vite';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const server = await createServer({ server: { middlewareMode: true, hmr: { server: createHttpServer() } }, appType: 'custom', logLevel: 'error' });
after(() => server.close());
const fixtures = await server.ssrLoadModule('/src/cinematics/level3b/devScenarios.ts');
const { WeightingSnapshot } = await server.ssrLoadModule('/src/cinematics/level3b/ResultVisuals.tsx');
const { resultCopy, cameraScale } = await server.ssrLoadModule('/src/cinematics/level3b/presentation.ts');
const shots = plan => plan.map(frame => frame.shot);

test('uneven → rebalance → near-equal reaches comparison without a third experiment', () => {
  assert.deepEqual(shots(fixtures.scenarios.rebalance.frames), ['S01', 'S02', 'S03', 'S04', 'S05', 'S06', 'S12', 'S13', 'S14']);
  assert.equal(fixtures.scenarios.rebalance.frames.at(-1).comparison.nearEqual, fixtures.rebalanced);
});
test('two uneven attempts request exactly one provided test-limit condition', () => {
  const frames = fixtures.scenarios.limit.frames;
  assert.deepEqual(shots(frames), ['S01', 'S02', 'S03', 'S04', 'S05', 'S06', 'S07', 'S08', 'S09', 'S12', 'S13', 'S14']);
  assert.deepEqual(frames.find(f => f.shot === 'S08').current.intensity, ['Medium', 'Medium', 'Medium']);
  assert.equal(frames.find(f => f.shot === 'S09').previous, fixtures.stillUneven);
  assert.equal(frames.at(-1).comparison.nearEqual, fixtures.limit);
});
test('near-equal first preserves its result and requests contrast, never rebalance', () => {
  const frames = fixtures.scenarios.contrast.frames;
  assert.deepEqual(shots(frames), ['S01', 'S10', 'S11', 'S12', 'S13', 'S14']);
  assert.equal(frames[0].current, fixtures.rebalanced);
  assert.equal(frames.at(-1).comparison.uneven, fixtures.contrast);
});
test('existing history with both categories skips unnecessary attempts', () => {
  assert.deepEqual(shots(fixtures.buildDevPlan(fixtures.rebalanced, fixtures.contrast, fixtures.limit, [fixtures.uneven])), ['S01', 'S12', 'S13', 'S14']);
});
test('DEV routing trusts supplied categories rather than implementing a weight classifier', () => {
  const externallyClassified = { ...fixtures.uneven, weights: [34, 33, 33] };
  assert.equal(fixtures.buildDevPlan(externallyClassified, fixtures.rebalanced, fixtures.limit)[1].shot, 'S02');
  assert.throws(() => fixtures.buildDevPlan(fixtures.rebalanced, fixtures.rebalanced, fixtures.limit), /externally supplied/);
});
test('rendering preserves arbitrary supplied values, zero effort, and metric order', () => {
  const result = { ...fixtures.uneven, weights: [47.5, 30.5, 22], effort: [0, .61, 1] };
  const selectedMetrics = ['online-peer-response-quality', 'on-task-focus', 'learning-reflection-quality'];
  const html = renderToStaticMarkup(React.createElement(WeightingSnapshot, {
    result, selectedMetrics, behaviour: { Memory: () => null }, elapsed: 5,
    reducedMotion: true, title: 'Your Weights',
  }));
  assert.ok(html.indexOf('online-peer-response-quality') < html.indexOf('on-task-focus'));
  assert.ok(html.indexOf('on-task-focus') < html.indexOf('learning-reflection-quality'));
  for (const n of [47.5, 30.5, 22]) assert.ok(html.includes(`<span>${n}</span>`));
  for (const n of [0, .61, 1]) assert.ok(html.includes(`scaleX(${n})`));
  assert.deepEqual(result.effort, [0, .61, 1]);
});
test('improvement is acknowledged and ending handoff keeps the last comparison text', () => {
  assert.equal(resultCopy('S09', 1, true), 'The effort became more balanced.');
  assert.equal(resultCopy('S09', 4, true), 'The balance improved — but the percentages still mattered.');
  assert.equal(resultCopy('S13', 7, true), resultCopy('S14', 7, true));
  assert.ok(!resultCopy('S14', 7, true).includes('Goodhart'));
});
test('camera boundaries preserve result-to-dialogue and comparison-to-ending framing', () => {
  assert.equal(cameraScale('S01', 4, false), cameraScale('S02', 0, false));
  assert.equal(cameraScale('S02', 7, false), cameraScale('S03', 0, false));
  assert.equal(cameraScale('S04', 2.4, false), cameraScale('S05', 0, false));
  assert.equal(cameraScale('S12', 2.5, false), cameraScale('S13', 0, false));
  assert.equal(cameraScale('S13', 7, false), cameraScale('S14', 0, false));
  for (let i = 1; i <= 14; i++) assert.equal(cameraScale(`S${String(i).padStart(2, '0')}`, 2, true), 1);
});
test('all eight approved source files retain their verified bytes', async () => {
  const files = {
    'docs/game-design/GAMING THE SYSTEM_Narrative V2.pdf': 'fca774a640613e06a8c9133672ec68d20f88f81a4e2602eb03ed22f885caba1e',
    'docs/game-design/Gaming_the_System_游戏机制与结果总览_v2.0(1).docx': '9d1229be94b7b84b88fb49ae3b793581164db8ebbaad82cdf65dbc48b8b26f47',
    'docs/game-design/Gaming_the_System_玩家路径与界面清单_v2.0.docx': 'aac797f770782afbf7984283e05a5e33872872d9afb4940876647240b765330a',
    'docs/storyboard/Storyboard_CIN_03B_Level3_RebalanceAndCompare_v01.xlsx': '8edd0245663b55bdcd83c4de11c6628259495f5357224c34887807ff666b5b25',
    'docs/visual-style/references/level3-rebalance-compare/REF-L3B-001.png': '8b18c71057917cc663c8daa2a97a1a70f89e927e80f6751bfd94b37b0661a5ec',
    'docs/visual-style/references/level3-rebalance-compare/REF-L3B-002.png': 'c6f0560d13c046473d5b06cc908b6e8dfa39ac5607f14e18c93b854b4912ae14',
    'docs/visual-style/references/level3-rebalance-compare/REF-L3B-003.png': '03a145a58973873402e9d7f471c3f35e98bb3f9266b5e6ed0c177aa65cb4f937',
    'assets/characters/CHAR-L1-001 — Alex Character Set.png': '4d1dde3e29a3aecbc457144edac200dec9bd450fc991d0b531c091d68c071fb1',
  };
  for (const [path, expected] of Object.entries(files)) assert.equal(createHash('sha256').update(await readFile(path)).digest('hex'), expected, path);
});
test('standalone production presentation bundles without DEV fixtures, controls or reference plates', async () => {
  const output = await build({ configFile: false, logLevel: 'silent', build: {
    write: false, lib: { entry: 'src/cinematics/level3b/Level3RebalanceCompareSequence.tsx', formats: ['es'], fileName: 'cin03b' },
    rollupOptions: { external: ['react', 'react/jsx-runtime', 'framer-motion'] },
  } });
  const chunks = (Array.isArray(output) ? output : [output]).flatMap(bundle => bundle.output).filter(item => item.type === 'chunk');
  const code = chunks.map(chunk => chunk.code).join('\n');
  assert.ok(code.includes('compare_patterns_complete'));
  for (const forbidden of ['DEV · Inject', 'DevPreview', 'first-uneven', 'REF-L3B-001', 'REF-L3B-002']) assert.ok(!code.includes(forbidden), forbidden);
});

import assert from 'node:assert/strict';
import { createServer as createHttpServer } from 'node:http';
import { after, test } from 'node:test';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createServer } from 'vite';
import React from 'react';

// Test-only renderer, cached locally without changing project dependencies or lockfiles.
// It resolves this checkout's React and scheduler so hooks share the same instance.
const cache = resolve('.cache/cin03b-test-tools');
const rendererPath = resolve(cache, 'renderer/index.js');
if (!existsSync(rendererPath)) {
  mkdirSync(cache, { recursive: true });
  const version = JSON.parse(readFileSync('node_modules/react/package.json', 'utf8')).version;
  const archive = execFileSync('npm', ['pack', `react-test-renderer@${version}`, '--pack-destination', cache, '--silent'], { encoding: 'utf8' }).trim().split('\n').at(-1);
  mkdirSync(resolve(cache, 'renderer'), { recursive: true });
  execFileSync('tar', ['-xzf', resolve(cache, archive), '--strip-components=1', '-C', resolve(cache, 'renderer')]);
}
const { default: Renderer } = await import(pathToFileURL(rendererPath).href);
const { act } = Renderer;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const server = await createServer({ server: { middlewareMode: true, hmr: { server: createHttpServer() } }, appType: 'custom', logLevel: 'error' });
after(() => server.close());
const { Level3RebalanceCompareSequence: Sequence } = await server.ssrLoadModule('/src/cinematics/level3b/Level3RebalanceCompareSequence.tsx');
const fixtures = await server.ssrLoadModule('/src/cinematics/level3b/devScenarios.ts');
const { shotSeconds, adaptationShots, handoffShots } = await server.ssrLoadModule('/src/cinematics/level3b/presentation.ts');
const comparison = { uneven: fixtures.uneven, nearEqual: fixtures.rebalanced };

async function harness(frame, extra = {}) {
  const received = { shots: [], handoffs: [], completions: [], adaptations: [] };
  const behaviour = { Memory: () => null, Adaptation: props => { received.adaptations.push(props); return null; } };
  let props = { requestId: 'test-run', frame, selectedMetrics: fixtures.selectedMetrics,
    elapsed: 0, behaviour, onShotComplete: event => received.shots.push(event),
    onHandoff: event => received.handoffs.push(event), onComplete: event => received.completions.push(event), ...extra };
  let tree;
  await act(async () => { tree = Renderer.create(React.createElement(React.StrictMode, null, React.createElement(Sequence, props))); });
  return {
    received, tree,
    async update(patch) { props = { ...props, ...patch }; await act(async () => tree.update(React.createElement(React.StrictMode, null, React.createElement(Sequence, props)))); },
    async dispose() { await act(async () => tree.unmount()); },
  };
}

test('paused completion waits for resume and repeated effects emit once per request', async () => {
  const h = await harness({ shot: 'S01', current: fixtures.uneven });
  await h.update({ elapsed: 4, paused: true });
  assert.equal(h.received.shots.length, 0);
  await h.update({ paused: false });
  await h.update({ elapsed: 40 });
  assert.equal(h.received.shots.length, 1);
  await h.update({ requestId: 'replayed-run' });
  assert.equal(h.received.shots.length, 2);
  await h.dispose();
});

test('gameplay boundaries stay on their supplied frame and emit one handoff only', async () => {
  for (const shot of handoffShots) {
    const h = await harness({ shot, current: fixtures.uneven });
    await h.update({ elapsed: 100 });
    await h.update({ elapsed: 200 });
    assert.equal(h.received.handoffs.length, 1, shot);
    assert.equal(h.received.shots.length, 0, shot);
    assert.equal(h.tree.root.findByProps({ 'data-shot': `CIN3B-${shot}` }).props['data-shot'], `CIN3B-${shot}`);
    await h.dispose();
  }
});

test('adaptation requires its real adapter callback; obsolete callbacks cannot complete a new shot', async () => {
  const h = await harness({ shot: 'S05', current: fixtures.rebalanced });
  await h.update({ elapsed: 100 });
  assert.equal(h.received.shots.length, 0);
  const oldCallback = h.received.adaptations.at(-1).onComplete;
  await h.update({ requestId: 'new-request', elapsed: 0, frame: { shot: 'S01', current: fixtures.uneven } });
  await act(async () => oldCallback());
  assert.equal(h.received.shots.length, 0);
  await h.update({ elapsed: 9, frame: { shot: 'S05', current: fixtures.rebalanced } });
  const callback = h.received.adaptations.at(-1).onComplete;
  await act(async () => callback());
  await act(async () => callback());
  assert.equal(h.received.shots.length, 1);
  await h.dispose();
});

test('near-equal and contrast adaptations retain their result-settle time', async () => {
  for (const [shot, settle] of [['S08', 2], ['S11', 3]]) {
    const h = await harness({ shot, current: fixtures.rebalanced });
    await h.update({ elapsed: 12 });
    await act(async () => h.received.adaptations.at(-1).onComplete());
    await h.update({ elapsed: 12 + settle - .1 });
    assert.equal(h.received.shots.length, 0);
    await h.update({ elapsed: 12 + settle });
    assert.equal(h.received.shots.length, 1);
    await h.dispose();
  }
});

function visualTree(value) {
  if (Array.isArray(value)) return value.map(visualTree);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).filter(([key]) => !['data-shot', 'data-request', 'data-stable-comparison'].includes(key)).map(([key, item]) => [key, visualTree(item)]));
}
test('S13 → S14 preserves the exact rendered composition and emits ending completion once', async () => {
  const h = await harness({ shot: 'S13', current: fixtures.rebalanced, comparison }, { elapsed: 7 });
  const before = visualTree(h.tree.toJSON());
  await h.update({ elapsed: 0, frame: { shot: 'S14', current: fixtures.rebalanced, comparison } });
  assert.deepEqual(visualTree(h.tree.toJSON()), before);
  await h.update({ elapsed: 1 });
  await h.update({ elapsed: 8 });
  assert.equal(h.received.completions.length, 1);
  assert.equal(h.received.completions[0].comparison, comparison);
  assert.equal(h.received.completions[0].type, 'compare_patterns_complete');
  await h.dispose();
});

test('missing comparison cannot report a successful ending handoff', async () => {
  const h = await harness({ shot: 'S14', current: fixtures.rebalanced }, { elapsed: 10 });
  assert.equal(h.received.completions.length, 0);
  await h.dispose();
});

test('all three full paths traverse real component effects and stop at their handoffs', async () => {
  for (const scenario of ['rebalance', 'limit', 'contrast']) {
    const frames = fixtures.scenarios[scenario].frames;
    const h = await harness(frames[0]);
    for (const frame of frames) {
      await h.update({ frame, elapsed: 0 });
      if (adaptationShots.includes(frame.shot)) {
        await h.update({ elapsed: 12 });
        await act(async () => h.received.adaptations.at(-1).onComplete());
        await h.update({ elapsed: 16 });
      } else await h.update({ elapsed: shotSeconds[frame.shot] });
    }
    assert.equal(h.received.completions.length, 1, scenario);
    assert.equal(h.received.handoffs.length, scenario === 'limit' ? 2 : 1, scenario);
    assert.equal(h.received.shots.length + h.received.handoffs.length + h.received.completions.length, frames.length, scenario);
    await h.dispose();
  }
});

test('DEV controls pause, resume, seek, replay and inject a result without touching gameplay', async () => {
  // A URL-only host stub lets the controls run in a component test, not a browser.
  globalThis.window = { location: new URL('http://localhost/cin03b.html?scenario=rebalance'), history: { replaceState() {} } };
  const { default: Preview } = await server.ssrLoadModule('/src/cinematics/level3b/DevPreview.tsx');
  let tree;
  await act(async () => { tree = Renderer.create(React.createElement(Preview)); });
  const sequence = () => tree.root.findByType(Sequence);
  const button = name => tree.root.findAllByType('button').find(item => item.props.children === name);
  const initialRequest = sequence().props.requestId;
  await act(async () => button('Pause').props.onClick());
  assert.equal(sequence().props.paused, true);
  await act(async () => button('Resume').props.onClick());
  assert.equal(sequence().props.paused, false);
  await act(async () => tree.root.findByProps({ 'aria-label': 'Seek within shot' }).props.onChange({ target: { value: '2.2' } }));
  assert.equal(sequence().props.elapsed, 2.2);
  assert.equal(sequence().props.paused, true);
  assert.notEqual(sequence().props.requestId, initialRequest);
  await act(async () => button('Replay').props.onClick());
  assert.equal(sequence().props.elapsed, 0);
  assert.equal(sequence().props.paused, false);
  await act(async () => tree.root.findByProps({ 'aria-label': 'Preview scenario' }).props.onChange({ target: { value: 'contrast' } }));
  assert.equal(sequence().props.frame.current.category, 'near-equal');
  await act(async () => sequence().props.onShotComplete({ requestId: sequence().props.requestId, shot: 'S01' }));
  assert.equal(sequence().props.frame.shot, 'S10');
  await act(async () => sequence().props.onHandoff({ requestId: sequence().props.requestId, shot: 'S10' }));
  await act(async () => button('DEV · Inject contrast result').props.onClick());
  assert.equal(sequence().props.frame.shot, 'S11');
  assert.equal(sequence().props.frame.current.category, 'uneven');
  await act(async () => tree.root.findAllByType('input').find(item => item.props.type === 'checkbox').props.onChange({ target: { checked: true } }));
  assert.equal(sequence().props.reducedMotion, true);
  await act(async () => tree.unmount());
  delete globalThis.window;
});

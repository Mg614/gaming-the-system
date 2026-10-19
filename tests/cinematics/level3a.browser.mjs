import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

// Uses an existing Playwright installation; does not install or download browsers.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.CIN3A_URL || 'http://127.0.0.1:5176';
const out = '.cache/cin3a';
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true, channel: process.env.CIN3A_BROWSER || 'chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 1150 } });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('response', r => { if (r.status() >= 400 && !r.url().endsWith('/favicon.ico')) errors.push(`${r.status()} ${r.url()}`); });
const metrics = ['preparation', 'participation', 'focus', 'discussion', 'reflection', 'peer-response'];
const states = ['low', 'medium', 'high'];
const results = { states: [], sequences: [], controls: [], opening: false };
const stage = page.locator('.l3a-stage');
async function seek(value) {
  await page.getByRole('slider', { name: 'Playback position' }).evaluate((el, v) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, String(v));
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
  await page.waitForFunction(v => Math.abs(Number(document.querySelector('.l3a-stage').dataset.time) - v) < 0.02, value);
}
try {
  for (let m = 0; m < metrics.length; m++) {
    for (let i = 0; i < states.length; i++) {
      const shot = `CIN3A-S${String(2 + m * 3 + i).padStart(2, '0')}`;
      await page.goto(`${base}/level3a.html?metric=${metrics[m]}&intensity=${states[i]}&paused=1&t=2.8`);
      await page.locator(`[data-storyboard="${shot}"]`).waitFor();
      assert.equal(await page.locator('.l3a-scene').count(), 1);
      assert.equal(await stage.getAttribute('data-time'), '2.800');
      await stage.screenshot({ path: `${out}/${metrics[m]}-${states[i]}.png` });
      // Inspect initial and diagnostic end frames as well as the mid-frame.
      await seek(0.3); await stage.screenshot({ path: `${out}/${metrics[m]}-${states[i]}-start.png` });
      await seek(3.8); await stage.screenshot({ path: `${out}/${metrics[m]}-${states[i]}-end.png` });
      const text = await stage.innerText(); assert.ok(text.length > 8);
      if (metrics[m] === 'focus' && states[i] === 'low') {
        await seek(1.1); assert.equal(await page.locator('.l3a-scene').getAttribute('data-beat'), 'phone-glance');
        await stage.screenshot({ path: `${out}/focus-low-phone.png` });
        await seek(3.2); assert.equal(await page.locator('.l3a-scene').getAttribute('data-beat'), 'return-to-task');
      }
      if (metrics[m] === 'reflection' && states[i] === 'low') assert.equal(await page.locator('[data-action]').getAttribute('data-action'), 'reflection-submitted');
      if (metrics[m] === 'preparation' && states[i] === 'low') assert.equal(await page.locator('[data-action]').getAttribute('data-action'), 'reading-closed');
      if (metrics[m] === 'peer-response' && states[i] === 'high') {
        for (const [t, name] of [[1.1, 'Jamie'], [2.1, 'Morgan'], [3.2, 'Riley']]) {
          await seek(t); assert.equal(await page.locator('.l3a-post-tabs .active').innerText(), name);
        }
      }
      results.states.push({ metric: metrics[m], intensity: states[i], shot });
    }
    console.log(`Verified rendered states: ${metrics[m]}`);
  }
  await page.goto(`${base}/level3a.html?metric=reflection&intensity=medium`);
  await page.waitForFunction(() => Number(document.querySelector('.l3a-stage')?.dataset.time) > 0.6);
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  // Let the pause render and GPU filters finish painting before comparing pixels.
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const paused = await stage.getAttribute('data-time');
  const before = createHash('sha256').update(await stage.screenshot({ path: `${out}/pause-before.png` })).digest('hex');
  await page.waitForTimeout(250);
  assert.equal(await stage.getAttribute('data-time'), paused);
  assert.equal(createHash('sha256').update(await stage.screenshot({ path: `${out}/pause-after.png` })).digest('hex'), before);
  await seek(2.8); await page.getByRole('button', { name: 'Replay', exact: true }).click();
  await page.waitForFunction(() => Number(document.querySelector('.l3a-stage').dataset.time) > 0.1);
  assert.ok(Number(await stage.getAttribute('data-time')) < 1);
  results.controls.push('pause freezes exact rendered frame', 'seek updates playhead', 'replay restarts');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (let m = 0; m < metrics.length; m++) for (let i = 0; i < states.length; i++) {
    await page.goto(`${base}/level3a.html?metric=${metrics[m]}&intensity=${states[i]}&paused=1&t=2.8`);
    await page.locator('.l3a-scene').waitFor();
    assert.equal(await stage.getAttribute('data-reduced-motion'), 'true');
    assert.equal(await page.locator('.l3a-scene').getAttribute('data-intensity'), states[i][0].toUpperCase() + states[i].slice(1));
    assert.equal(await page.locator('.l3a-dust').evaluate(el => getComputedStyle(el).display), 'none');
  }
  results.controls.push('OS reduced motion retains all 18 states');
  await page.emulateMedia({ reducedMotion: 'no-preference' });

  for (const fixture of ['mixed', 'equal', 'priority']) {
    await page.goto(`${base}/level3a.html?sequence=${fixture}`);
    await page.locator('.l3a-sequence').waitFor();
    await page.evaluate(() => {
      window.cin3aSeen = [];
      window.cin3aTimer = setInterval(() => {
        const s = document.querySelector('.l3a-sequence');
        const key = `${s.dataset.phase}:${s.dataset.clipIndex}`;
        if (window.cin3aSeen.at(-1) !== key) window.cin3aSeen.push(key);
      }, 20);
    });
    await page.locator('[data-completion-count="1"]').waitFor({ timeout: 26000 });
    await page.waitForTimeout(250);
    assert.equal(await page.locator('[data-completion-count]').getAttribute('data-completion-count'), '1');
    const seen = await page.evaluate(() => { clearInterval(window.cin3aTimer); return window.cin3aSeen; });
    assert.deepEqual(seen, ['entry:0', 'clip:0', 'bridge:0', 'clip:1', 'bridge:1', 'clip:2', 'exit:2']);
    await stage.screenshot({ path: `${out}/sequence-${fixture}-exit.png` });
    results.sequences.push({ fixture, seen, completionCount: 1 });
    console.log(`Full real-time sequence passed: ${fixture}`);
  }
  const previousRequest = await page.locator('.l3a-sequence').getAttribute('data-request');
  await page.getByRole('button', { name: 'Replay', exact: true }).click();
  assert.notEqual(await page.locator('.l3a-sequence').getAttribute('data-request'), previousRequest);
  await seek(17.9);
  assert.equal(await page.locator('[data-completion-count]').getAttribute('data-completion-count'), '0');
  await seek(17.7); await page.getByRole('button', { name: 'Play', exact: true }).click();
  await page.locator('[data-completion-count="1"]').waitFor();
  await page.getByRole('checkbox', { name: 'Reduced motion' }).check();
  assert.equal(await page.locator('[data-completion-count]').getAttribute('data-completion-count'), '1');
  results.controls.push('seek while paused never completes', 'new replay request completes once', 'rerender never duplicates completion');
  await page.goto(base);
  await page.locator('h1').first().waitFor();
  await page.screenshot({ path: `${out}/opening.png` });
  results.opening = true;
  assert.deepEqual(errors, []);

  // Contact sheets contain captured frames only, never 18 mounted cinematics.
  for (const metric of metrics) {
    const tiles = await Promise.all(states.map(async state => `<div><h2>${metric} · ${state}</h2><img src="data:image/png;base64,${(await readFile(`${out}/${metric}-${state}.png`)).toString('base64')}"><img src="data:image/png;base64,${(await readFile(`${out}/${metric}-${state}-end.png`)).toString('base64')}"></div>`));
    await page.setViewportSize({ width: 1500, height: 650 });
    await page.setContent(`<body style="margin:0;background:#181a17;color:white;font:14px system-ui"><main style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">${tiles.join('')}</main><style>h2{font-size:15px;padding:8px}img{width:100%;display:block;margin-bottom:12px}</style></body>`);
    await page.screenshot({ path: `${out}/review-${metric}.png` });
  }
  await writeFile(`${out}/browser-results.json`, JSON.stringify({ ...results, errors }, null, 2));
  console.log('PASS: 18 normal + 18 reduced-motion states, 3 full montages, controls, callback, opening, zero runtime/asset errors.');
} finally { await browser.close(); }

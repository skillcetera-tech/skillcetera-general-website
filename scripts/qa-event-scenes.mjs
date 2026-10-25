import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const output = new URL('../.preview/event-scenes/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_EXECUTABLE ? { executablePath: process.env.BROWSER_EXECUTABLE } : {}), ignoreDefaultArgs: ['--disable-back-forward-cache'] });
const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
const results = { checks: [], errors: [] };
context.on('page', page => page.on('pageerror', error => results.errors.push(error.message)));
const check = (name, passed, evidence) => {
  results.checks.push({ name, passed: Boolean(passed), evidence });
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}${evidence ? `: ${JSON.stringify(evidence)}` : ''}`);
};
const open = async () => {
  const page = await context.newPage();
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(200);
  return page;
};
const target = (page, id) => page.locator(`#${id} .event-inner`).evaluate(element => element.getBoundingClientRect().top + scrollY - 76);
const scroll = (page, y) => page.evaluate(top => window.scrollTo({ top, behavior: 'instant' }), y);
const scene = (page, id) => page.locator(`#${id}`).evaluate(element => {
  const inner = element.querySelector('.event-inner');
  const rect = inner.getBoundingClientRect();
  const image = element.querySelector('.event-photo img');
  return {
    y: scrollY, top: rect.top, height: rect.height, fit: element.dataset.motionFit === 'true', state: element.dataset.counterState,
    values: [...element.querySelectorAll('.event-counter-value')].map(value => value.textContent),
    final: [...element.querySelectorAll('[data-to]')].every(value => value.querySelector('.event-counter-value').textContent === `${Number(value.dataset.to).toFixed(Number(value.dataset.dec || 0))}${value.dataset.suf || ''}`),
    accessible: [...element.querySelectorAll('[data-to]')].every(value => value.querySelector('.event-counter-accessible').textContent === `${Number(value.dataset.to).toFixed(Number(value.dataset.dec || 0))}${value.dataset.suf || ''}`),
    focus: document.activeElement.id || document.activeElement.tagName, imageTransform: getComputedStyle(image).transform,
    frameState: element.dataset.frameState,
    frameOpacity: getComputedStyle(inner, '::after').opacity,
    frameColor: getComputedStyle(inner, '::after').borderTopColor,
  };
});

try {
  const page = await open();
  const first = await scene(page, 'esc');
  check('desktop event fills available viewport without sticky/zoom', first.fit && first.height === 824 && first.imageTransform === 'none' && await page.locator('[data-motion-pinned]').count() === 0, first);
  let escTarget = await target(page, 'esc');
  await scroll(page, escTarget - 180);
  await page.waitForTimeout(250);
  check('programmatic positioning alone does not auto-snap', Math.abs((await scene(page, 'esc')).y - (escTarget - 180)) <= 2);
  await page.evaluate(() => {
    window.__counts = [];
    new MutationObserver(records => records.forEach(record => {
      if (record.target.dataset.counterState === 'running') window.__counts.push({ id: record.target.id, top: record.target.querySelector('.event-inner').getBoundingClientRect().top, focus: document.activeElement.id || document.activeElement.tagName });
    })).observe(document.querySelector('main'), { subtree: true, attributes: true, attributeFilter: ['data-counter-state'] });
  });
  await page.mouse.wheel(0, 90);
  await page.waitForTimeout(800);
  const loading = await scene(page, 'esc');
  const starts = await page.evaluate(() => window.__counts);
  check('wheel pause gently aligns the event', Math.abs(loading.top - 76) <= 2, loading);
  check('counter starts after alignment without grabbing focus', starts.length === 1 && starts[0].id === 'esc' && Math.abs(starts[0].top - 76) <= 2 && starts[0].focus === first.focus, starts);
  check('time-based counter is loading while accessible value stays final', loading.state === 'running' && !loading.final && loading.accessible, loading);
  await page.waitForTimeout(700);
  check('counter remains visibly loading after 1.5 seconds', (await scene(page, 'esc')).state === 'running' && !(await scene(page, 'esc')).final);
  await page.waitForTimeout(800);
  check('counter reaches exact final values', (await scene(page, 'esc')).final, await scene(page, 'esc'));
  await page.mouse.wheel(0, -240);
  await page.waitForTimeout(400);
  await page.mouse.wheel(0, 220);
  await page.waitForTimeout(600);
  check('scrolling within a frame does not trap the user or restart the counter', Math.abs((await scene(page, 'esc')).top - 96) <= 2 && (await scene(page, 'esc')).final && await page.evaluate(() => window.__counts.filter(item => item.id === 'esc').length) === 1);

  const tedxTarget = await target(page, 'tedx');
  await scroll(page, tedxTarget - 1200);
  await page.waitForTimeout(250);
  await page.mouse.wheel(0, 2050);
  await page.waitForTimeout(850);
  const fast = await scene(page, 'tedx');
  check('fast scroll past the capture region is not pulled back', Math.abs(fast.y - (tedxTarget + 850)) <= 3 && fast.final && fast.state !== 'running', fast);
  await page.locator('.desktop-nav .nav-tedx').click();
  await page.waitForTimeout(550);
  const pointerNav = await scene(page, 'tedx');
  check('pointer navigation aligns but does not focus the event heading', Math.abs(pointerNav.top - 76) <= 2 && pointerNav.focus !== 'tedx-title', pointerNav);
  await page.waitForTimeout(2000);
  check('TEDx count finishes once after navigation', (await scene(page, 'tedx')).final && await page.evaluate(() => window.__counts.filter(item => item.id === 'tedx').length) === 1);
  await page.locator('.desktop-nav .nav-esc').focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(700);
  check('explicit keyboard navigation retains accessible focus', (await scene(page, 'esc')).focus === 'esc-title');
  await page.screenshot({ path: fileURLToPath(new URL('esc-desktop.png', output)) });

  // Real wheel bursts exceeding the former cumulative-distance cutoff, both directions.
  for (const id of ['esc', 'tedx']) {
    const previousStarts = await page.evaluate(eventId => window.__counts.filter(item => item.id === eventId).length, id);
    for (let round = 0; round < 10; round++) {
      const direction = round % 2 ? -1 : 1;
      const offset = [350, 260, 80, -260, -350][round % 5];
      const y = await target(page, id);
      await scroll(page, y - direction * 800);
      await page.waitForTimeout(210);
      const travel = direction * 800 + offset;
      for (let step = 0; step < 5; step++) {
        await page.mouse.wheel(0, travel / 5);
        await page.waitForTimeout(40);
        // Entry capture now starts during scrolling, before reaching the old endpoint.
        if (['aligning', 'aligned'].includes((await scene(page, id)).frameState)) break;
      }
      await page.waitForTimeout(760);
      const value = await scene(page, id);
      check(`${id} wheel approach ${round + 1}/10 aligns and loads on repeated entry`, Math.abs(value.top - 76) <= 2 && value.frameState === 'aligned' && value.frameOpacity === '1' && value.state === 'running' && !value.final, value);
    }
    check(`${id} counter starts once per deliberate entry`, await page.evaluate(eventId => window.__counts.filter(item => item.id === eventId).length, id) === previousStarts + 10);
  }
  await page.screenshot({ path: fileURLToPath(new URL('tedx-desktop.png', output)) });
  await page.waitForTimeout(1500);

  for (const viewport of [{ width: 390, height: 844 }, { width: 1920, height: 1080 }, { width: 1366, height: 768 }, { width: 844, height: 390 }, { width: 1366, height: 900 }]) {
    await page.setViewportSize(viewport);
    await page.waitForTimeout(300);
    const value = await scene(page, 'esc');
    const expected = viewport.width >= 1024 && viewport.height >= 760;
    check(`fit and stable values after resize ${viewport.width}x${viewport.height}`, value.fit === expected && value.final && (!expected || value.height === viewport.height - 76), value);
  }

  const interrupted = await open();
  escTarget = await target(interrupted, 'esc');
  await scroll(interrupted, escTarget - 180);
  await interrupted.waitForTimeout(220);
  await interrupted.mouse.wheel(0, 90);
  await interrupted.waitForTimeout(70);
  const during = await scene(interrupted, 'esc');
  await interrupted.mouse.wheel(0, -240);
  await interrupted.waitForTimeout(750);
  const canceled = await scene(interrupted, 'esc');
  check('new input cancels alignment immediately', canceled.y < during.y - 100 && Math.abs(canceled.top - 76) > 100 && canceled.final, { during, canceled });

  for (const id of ['esc', 'tedx']) {
    const arrival = await open();
    const y = await target(arrival, id);
    await scroll(arrival, y - 844);
    await arrival.waitForTimeout(220);
    await arrival.evaluate(eventId => window.addEventListener('wheel', () => {
      window.__inputState = document.getElementById(eventId).dataset.frameState;
    }, { once: true }), id);
    await arrival.mouse.wheel(0, 40);
    await arrival.waitForFunction(() => window.__inputState !== undefined);
    check(`${id} starts capture in the wheel handler before the next frame is visible`, await arrival.evaluate(() => window.__inputState) === 'aligning');
    await arrival.waitForTimeout(60);
    const entering = await scene(arrival, id);
    check(`${id} captures on entry without waiting for scroll idle`, entering.top < 450, entering);
    await arrival.waitForTimeout(400);
    const value = await scene(arrival, id);
    check(`${id} arrival from the upper frame aligns and starts counting via wheel alone`, Math.abs(value.top - 76) <= 2 && value.state === 'running' && !value.final && value.focus === 'BODY', value);
    await arrival.mouse.wheel(0, 12);
    await arrival.waitForTimeout(150);
    check(`${id} small scroll does not swallow the loading animation`, (await scene(arrival, id)).state === 'running');
    await arrival.close();
  }

  for (const interruption of ['pointercancel', 'blur']) {
    await interrupted.reload({ waitUntil: 'networkidle' });
    await interrupted.evaluate(kind => {
      window.dispatchEvent(new PointerEvent('pointerdown'));
      window.dispatchEvent(kind === 'pointercancel' ? new PointerEvent(kind) : new Event(kind));
      window.skillceteraMotion.scrollToSection('esc', { behavior: 'instant' });
    }, interruption);
    await interrupted.waitForTimeout(2400);
    const recovered = await scene(interrupted, 'esc');
    check(`${interruption} releases pointer state for later navigation`, recovered.state === 'complete' && recovered.final, recovered);
  }

  const partial = await open();
  await partial.evaluate(() => window.skillceteraMotion.scrollToSection('esc', { behavior: 'instant' }));
  await partial.waitForTimeout(400);
  check('explicit alignment starts a timed count', (await scene(partial, 'esc')).state === 'running');
  await partial.setViewportSize({ width: 390, height: 844 });
  await partial.waitForTimeout(300);
  const resized = await scene(partial, 'esc');
  check('resizing a running count finalizes it instead of freezing', resized.final && !resized.fit && resized.state === 'complete', resized);
  await partial.setViewportSize({ width: 1366, height: 900 });
  await partial.waitForTimeout(300);
  await partial.evaluate(() => window.skillceteraMotion.scrollToSection('esc', { behavior: 'instant' }));
  await partial.waitForTimeout(450);
  check('returning to desktop never resets a finished count', (await scene(partial, 'esc')).final);
  await partial.emulateMedia({ reducedMotion: 'reduce' });
  await partial.waitForTimeout(250);
  const reduced = await scene(partial, 'esc');
  const loops = await partial.evaluate(() => document.getAnimations().filter(animation => animation.playState === 'running' && animation.effect?.getTiming().iterations === Infinity).length);
  check('reduced motion uses static complete values and no ambient loops', !reduced.fit && reduced.final && loops === 0, { reduced, loops });

  const initialFallback = await context.newPage();
  await initialFallback.setViewportSize({ width: 390, height: 844 });
  await initialFallback.goto(base, { waitUntil: 'networkidle' });
  await initialFallback.setViewportSize({ width: 1366, height: 900 });
  await initialFallback.waitForTimeout(400);
  await initialFallback.evaluate(() => window.skillceteraMotion.scrollToSection('esc', { behavior: 'instant' }));
  await initialFallback.waitForTimeout(500);
  const recoveredCount = await scene(initialFallback, 'esc');
  check('initial fallback does not consume the ESC count before it plays', recoveredCount.fit && recoveredCount.state === 'running' && !recoveredCount.final, recoveredCount);

  const historyPage = await open();
  await historyPage.addInitScript(() => { window.__restores = []; window.addEventListener('pageshow', event => window.__restores.push(event.persisted)); });
  await historyPage.reload({ waitUntil: 'networkidle' });
  await historyPage.evaluate(() => window.skillceteraMotion.scrollToSection('esc', { behavior: 'instant' }));
  await historyPage.waitForTimeout(2400);
  const generated = await historyPage.locator('[data-ambient-generated]').count();
  for (let round = 1; round <= 2; round++) {
    await historyPage.goto(`${base}/about`, { waitUntil: 'networkidle' });
    await historyPage.evaluate(() => history.back());
    await historyPage.waitForTimeout(650);
    const restored = await scene(historyPage, 'esc');
    check(`Back restores frames and final values without replay, round ${round}`, restored.fit && restored.final && restored.state === 'complete' && restored.frameState === 'aligned' && restored.frameOpacity === '1' && await historyPage.evaluate(() => window.__restores.at(-1)) && await historyPage.locator('[data-ambient-generated]').count() === generated, restored);
  }
  const footer = await context.newPage();
  await footer.goto(`${base}/esc`, { waitUntil: 'networkidle' });
  await footer.locator('.footer .f-logo').scrollIntoViewIfNeeded();
  check('shared footer remains visible', await footer.locator('.footer .f-logo').evaluate(element => getComputedStyle(element).opacity) === '1');
  check('no browser JavaScript exceptions', results.errors.length === 0, results.errors);
} finally {
  await writeFile(new URL('results.json', output), JSON.stringify(results, null, 2));
  await browser.close();
}
if (results.checks.some(check => !check.passed)) process.exitCode = 1;

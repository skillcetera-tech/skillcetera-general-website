import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_EXECUTABLE ? { executablePath: process.env.BROWSER_EXECUTABLE } : {}) });
const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
const results = { checks: [], errors: [] };
page.on('pageerror', error => results.errors.push(error.message));
const check = (name, passed, evidence) => {
  results.checks.push({ name, passed: Boolean(passed), evidence });
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}: ${JSON.stringify(evidence)}`);
};
const position = async top => { await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), top); await page.waitForTimeout(280); };
const state = () => page.evaluate(() => ({ y: scrollY, active: document.documentElement.dataset.chapterTransition, focus: document.activeElement.tagName }));
const output = new URL('../.preview/chapter-scroll/', import.meta.url);
await mkdir(output, { recursive: true });
try {
  await page.goto(process.env.PREVIEW_URL || 'http://127.0.0.1:4173', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  const chapters = await page.evaluate(() => {
    const max = document.documentElement.scrollHeight - innerHeight;
    return [...document.querySelectorAll('main > section[id], #footer')].map(element => ({ id: element.id, top: Math.min(max, Math.max(0, element.getBoundingClientRect().top + scrollY - 76)) }));
  });
  check('all homepage chapters participate in document order', chapters.length === 10, chapters);
  for (let i = 0; i < chapters.length - 1; i++) {
    const current = chapters[i], next = chapters[i + 1];
    await position(next.top - Math.min(824 * 0.65, (next.top - current.top) * 0.7));
    await page.mouse.wheel(0, 100);
    await page.waitForTimeout(120);
    const moving = await state();
    check(`${current.id} → ${next.id} has a gradual transition`, moving.active === next.id && Math.abs(moving.y - next.top) > 4, moving);
    await page.waitForTimeout(850);
    const down = await state();
    check(`${current.id} → ${next.id} settles below the header`, !down.active && Math.abs(down.y - next.top) <= 2 && down.focus === 'BODY', down);
    if (['esc', 'tedx'].includes(next.id)) {
      check(`${next.id} count starts on arrival`, await page.locator(`#${next.id}`).getAttribute('data-counter-state') === 'running');
    }
    await position(next.top + Math.min(100, (chapters[i + 2]?.top - next.top || 300) * 0.3));
    await page.mouse.wheel(0, -100);
    await page.waitForTimeout(1000);
    const up = await state();
    const expected = Math.max(current.top, next.top - 824);
    check(`${next.id} → ${current.id} preserves the previous chapter's reading end`, !up.active && Math.abs(up.y - expected) <= 2, { ...up, expected });
  }
  const esc = chapters.find(item => item.id === 'esc');
  await position(esc.top - 500);
  await page.mouse.wheel(0, 30);
  await page.waitForTimeout(400);
  check('small wheel movement below the threshold remains native', !(await state()).active && Math.abs((await state()).y - (esc.top - 470)) <= 2, await state());
  await position(esc.top - 500);
  await page.mouse.wheel(0, 100);
  await page.waitForTimeout(120);
  await page.mouse.wheel(0, -140);
  await page.waitForTimeout(850);
  check('reverse input cancels instead of finishing the old transition', !(await state()).active && Math.abs((await state()).y - esc.top) > 100, await state());
  const long = chapters.find((item, i) => chapters[i + 1]?.top - item.top > 1100);
  if (long) {
    await position(long.top + 50);
    const before = await state();
    await page.mouse.wheel(0, 100);
    await page.waitForTimeout(850);
    check('long chapters retain native scrolling before their boundary', !(await state()).active && Math.abs((await state()).y - before.y - 100) <= 2, await state());
  }
  await position(esc.top - 500);
  await page.evaluate(() => {
    const box = document.createElement('div');
    box.id = 'qa-scrollbox';
    box.style.cssText = 'position:fixed;inset:150px auto auto 20px;width:160px;height:100px;overflow-y:auto;z-index:99999;background:white';
    box.innerHTML = '<div style="height:600px">Nested reading</div>';
    document.body.append(box);
  });
  await page.mouse.move(60, 180);
  await page.mouse.wheel(0, 200);
  await page.waitForTimeout(400);
  check('nested scrolling is not captured', !(await state()).active && await page.locator('#qa-scrollbox').evaluate(element => element.scrollTop > 0));
  await page.locator('#qa-scrollbox').evaluate(element => element.remove());
  await page.mouse.move(700, 400);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(300);
  await position(esc.top - 500);
  await page.mouse.wheel(0, 120);
  await page.waitForTimeout(850);
  check('reduced motion disables chapter transitions', !(await state()).active && Math.abs((await state()).y - esc.top + 380) <= 2, await state());
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 390, height: 844 });
  await position(300);
  await page.mouse.wheel(0, 120);
  await page.waitForTimeout(850);
  check('mobile retains native scrolling', !(await state()).active && Math.abs((await state()).y - 420) <= 2, await state());
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.waitForTimeout(300);
  await page.evaluate(() => window.skillceteraMotion.scrollToSection('esc', { behavior: 'instant', focus: false }));
  await page.waitForTimeout(400);
  check('menu anchors remain exact without changing focus', Math.abs(await page.locator('#esc .event-inner').evaluate(element => element.getBoundingClientRect().top) - 76) <= 2 && (await state()).focus === 'BODY');
  await position(esc.top - 500);
  await page.mouse.wheel(0, 100);
  await page.waitForTimeout(100);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(850);
  check('resize cancels an active transition', !(await state()).active, await state());
  check('no browser JavaScript exceptions', results.errors.length === 0, results.errors);
} finally {
  await writeFile(new URL('results.json', output), JSON.stringify(results, null, 2));
  await browser.close();
}
if (results.checks.some(item => !item.passed)) process.exitCode = 1;

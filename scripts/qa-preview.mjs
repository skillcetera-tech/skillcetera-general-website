import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const output = new URL('../.preview/', import.meta.url);
await mkdir(output, { recursive: true });
const errors = [];
const page = await browser.newPage({ viewport: { width: 1366, height: 900 }, deviceScaleFactor: 1 });
page.on('pageerror', error => errors.push(error.message));
page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()}: ${response.url()}`); });
const response = await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(500);
const results = { http: response.status(), errors, desktop: await page.evaluate(() => ({ horizontalOverflow: document.documentElement.scrollWidth > innerWidth, images: [...document.images].filter(image => !image.complete || !image.naturalWidth).map(image => image.src), pinned: window.ScrollTrigger.getAll().filter(trigger => trigger.pin).map(trigger => ({ id: trigger.trigger.id, start: trigger.start, end: trigger.end })), events: [...document.querySelectorAll('.event-inner')].map(element => ({ height: element.scrollHeight, available: innerHeight - 76 })) })) };
await page.screenshot({ path: new URL('desktop.png', output).pathname.replace(/^\/(\w:)/, '$1') });
await page.evaluate(() => { window.skillceteraMotion.scrollToSection('esc', { behavior: 'instant', focus: false }); });
await page.waitForTimeout(600);
await page.screenshot({ path: new URL('esc.png', output).pathname.replace(/^\/(\w:)/, '$1') });
results.escAnchor = await page.evaluate(() => ({ top: document.querySelector('#esc .event-inner').getBoundingClientRect().top, y: scrollY }));
await page.evaluate(() => window.skillceteraMotion.scrollToSection('tedx', { behavior: 'instant', focus: false }));
await page.waitForTimeout(600);
await page.screenshot({ path: new URL('tedx.png', output).pathname.replace(/^\/(\w:)/, '$1') });
await page.locator('[data-year="2021"]').click();
results.yearControl = await page.locator('.season-theme').textContent();
await page.locator('[data-project="retreat"] .project-select').click();
results.projectControl = await page.locator('#project-preview-title').textContent();
await page.setViewportSize({ width: 1366, height: 768 });
await page.waitForTimeout(350);
results.laptop = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > innerWidth, pins: window.ScrollTrigger.getAll().filter(trigger => trigger.pin).length, events: [...document.querySelectorAll('.event-inner')].map(element => ({ height: element.scrollHeight, available: innerHeight - 76 })) }));
await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
await page.waitForTimeout(300);
await page.screenshot({ path: new URL('laptop.png', output).pathname.replace(/^\/(\w:)/, '$1') });
await page.setViewportSize({ width: 390, height: 844 });
await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
await page.waitForTimeout(400);
results.mobile = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > innerWidth, pins: window.ScrollTrigger.getAll().filter(trigger => trigger.pin).length }));
await page.screenshot({ path: new URL('mobile.png', output).pathname.replace(/^\/(\w:)/, '$1') });
await page.locator('.menu-toggle').click();
results.mobileMenu = await page.locator('#mobile-nav').isVisible();
await page.keyboard.press('Escape');
results.menuClosed = !(await page.locator('#mobile-nav').isVisible());
await page.emulateMedia({ reducedMotion: 'reduce' });
await page.setViewportSize({ width: 1366, height: 900 });
await page.waitForTimeout(400);
results.reducedMotion = await page.evaluate(() => ({ pins: window.ScrollTrigger.getAll().filter(trigger => trigger.pin).length, hiddenContent: [...document.querySelectorAll('.reveal')].filter(element => Number(getComputedStyle(element).opacity) < 1).length }));
await page.screenshot({ path: new URL('fullpage.png', output).pathname.replace(/^\/(\w:)/, '$1'), fullPage: true });
await page.setViewportSize({ width: 844, height: 390 });
await page.waitForTimeout(300);
results.landscape = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > innerWidth, pins: window.ScrollTrigger.getAll().filter(trigger => trigger.pin).length }));

await page.emulateMedia({ reducedMotion: 'no-preference' });
await page.setViewportSize({ width: 1366, height: 900 });
results.subpages = {};
for (const route of ['/about', '/esc', '/tedx', '/projects', '/join', '/contact', '/studio']) {
  const subRes = await page.goto(`http://localhost:4173${route}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(250);
  const check = await page.evaluate(() => ({
    title: document.title,
    overflow: document.documentElement.scrollWidth > innerWidth,
    brokenImages: [...document.images].filter(img => img.getAttribute('src') && (!img.complete || !img.naturalWidth)).map(img => img.src),
  }));
  results.subpages[route] = { status: subRes.status(), ...check };
}

await writeFile(new URL('qa-results.json', output), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
await browser.close();
const subpageFailed = Object.values(results.subpages).some(s => s.status !== 200 || s.overflow || s.brokenImages.length > 0);
if (errors.length || results.desktop.horizontalOverflow || results.mobile.overflow || results.landscape.overflow || results.desktop.images.length || results.mobile.pins || results.reducedMotion.pins || results.reducedMotion.hiddenContent || subpageFailed) process.exitCode = 1;

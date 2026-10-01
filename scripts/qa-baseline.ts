/** QA screenshots — one shot per tab (showroom / library / editor). */
import { chromium } from '@playwright/test';

const BASE = 'http://127.0.0.1:5199';
const OUT = '/home/z/my-project/scripts/shots-baseline';

async function settle(page: import('@playwright/test').Page, frames = 30) {
  await page.evaluate(async (n) => {
    const api = (window as any).__RESORT__;
    const start = api.frameCount();
    const t0 = performance.now();
    while (api.frameCount() - start < n && performance.now() - t0 < 60000) {
      await new Promise((r) => setTimeout(r, 100));
    }
  }, frames);
}

async function main() {
  const browser = await chromium.launch({
    args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'],
  });
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') console.log('[console.error]', m.text().slice(0, 300)); });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => {
    const a = (window as any).__RESORT__;
    return a ? a.ready() : false;
  }, undefined, { timeout: 120_000 });
  console.log('backend:', await page.evaluate(() => (window as any).__RESORT__.backend()));

  await page.evaluate(() => (window as any).__RESORT__.setMode('showroom'));
  await settle(page, 25);
  await page.screenshot({ path: `${OUT}/01-showroom.png`, timeout: 120000 });

  await page.evaluate(() => (window as any).__RESORT__.setMode('library'));
  await settle(page, 25);
  await page.screenshot({ path: `${OUT}/02-library.png`, timeout: 120000 });

  await page.evaluate(() => (window as any).__RESORT__.setMode('editor'));
  await settle(page, 25);
  await page.screenshot({ path: `${OUT}/03-editor.png`, timeout: 120000 });

  await page.mouse.click(800, 450);
  await settle(page, 25);
  await page.screenshot({ path: `${OUT}/04-editor-selected.png`, timeout: 120000 });

  console.log('DONE');
  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });

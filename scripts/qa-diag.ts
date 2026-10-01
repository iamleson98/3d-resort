/** Pull shadow diagnostics from the live app. */
import { chromium } from '@playwright/test';

const BASE = 'http://127.0.0.1:5199';

async function main() {
  const browser = await chromium.launch({
    args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'],
  });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/?grain=0`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => (window as any).__RESORT__?.ready?.(), undefined, { timeout: 180_000 });
  await page.evaluate(() => (window as any).__RESORT__.flyToZone('bed', true));
  await page.evaluate(async () => {
    const api = (window as any).__RESORT__;
    const start = api.frameCount();
    while (api.frameCount() - start < 15) await new Promise((r) => setTimeout(r, 150));
  });
  const info = await page.evaluate(() => (window as any).__RESORT__.debugShadow());
  console.log(JSON.stringify(info, null, 2));
  console.log('navigator.gpu:', await page.evaluate(() => 'gpu' in navigator));
  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });

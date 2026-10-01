/** Shadow A/B experiment — fresh page per variant, parked camera, pixel diff. */
import { chromium } from '@playwright/test';
import { PNG } from 'pngjs';
import { writeFileSync } from 'node:fs';

const BASE = 'http://127.0.0.1:5199';

async function settle(page: import('@playwright/test').Page, frames = 20) {
  await page.evaluate(async (n) => {
    const api = (window as any).__RESORT__;
    const start = api.frameCount();
    const t0 = performance.now();
    while (api.frameCount() - start < n && performance.now() - t0 < 120000) {
      await new Promise((r) => setTimeout(r, 150));
    }
  }, frames);
}

async function shot(ctx: import('@playwright/test').BrowserContext, suffix: string, query: string) {
  const page = await ctx.newPage();
  await page.goto(`${BASE}/${query}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(() => (window as any).__RESORT__?.ready?.(), undefined, { timeout: 180_000 });
  await page.evaluate(() => (window as any).__RESORT__.flyToZone('bed', true));
  await settle(page, 22);
  const buf = await page.screenshot({ timeout: 120_000 });
  writeFileSync(`/home/z/my-project/scripts/shadow-${suffix}.png`, buf);
  await page.close();
  return PNG.sync.read(buf);
}

function regionStats(png: PNG, x0: number, y0: number, x1: number, y1: number) {
  let sum = 0, n = 0, mn = 255, mx = 0;
  for (let y = y0; y < y1; y += 3) {
    for (let x = x0; x < x1; x += 3) {
      const i = (y * png.width + x) * 4;
      const l = 0.2126 * png.data[i]! + 0.7152 * png.data[i + 1]! + 0.0722 * png.data[i + 2]!;
      sum += l; n++;
      if (l < mn) mn = l;
      if (l > mx) mx = l;
    }
  }
  return { mean: sum / n, min: mn, max: mx, n };
}

async function main() {
  const browser = await chromium.launch({
    args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'],
  });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const on = await shot(ctx, 'on2', '?grain=0');
  const off = await shot(ctx, 'off2', '?grain=0&shadows=off');

  const floorOn = regionStats(on, 300, 400, 900, 640);
  const floorOff = regionStats(off, 300, 400, 900, 640);
  const allOn = regionStats(on, 0, 0, on.width, on.height);
  const allOff = regionStats(off, 0, 0, off.width, off.height);
  let diff = 0;
  for (let i = 0; i < on.data.length; i += 4) {
    const d = Math.abs(on.data[i]! - off.data[i]!) + Math.abs(on.data[i + 1]! - off.data[i + 1]!) + Math.abs(on.data[i + 2]! - off.data[i + 2]!);
    if (d > 18) diff++;
  }
  console.log('floor region  on:', floorOn.mean.toFixed(1), 'off:', floorOff.mean.toFixed(1));
  console.log('whole frame   on:', allOn.mean.toFixed(1), 'off:', allOff.mean.toFixed(1));
  console.log('diff pixels (>18/765):', diff, 'of', on.data.length / 4);
  console.log('shadow darkens floor by:', (floorOff.mean - floorOn.mean).toFixed(1));
  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });

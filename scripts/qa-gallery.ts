/**
 * Dev QA gallery — capture screenshots across presets / modes / zones.
 * Usage: npx tsx scripts/qa-gallery.ts [shots...]
 *   shots: golden dawn noon dusk bed lounge editor editor-dusk library
 *   (default: golden + editor). Frames settle at ~1 fps on SwiftShader —
 *   pass a small subset per run to stay under the shell timeout.
 */
import { chromium } from '@playwright/test';

const BASE = process.env.BASE ?? 'http://127.0.0.1:5173';
const OUT = process.env.OUT ?? '/home/z/my-project/scripts/shots-qa';

async function settle(page: import('@playwright/test').Page, frames = 14) {
  await page.evaluate(async (n) => {
    const api = (window as any).__RESORT__;
    const start = api.frameCount();
    const t0 = performance.now();
    while (api.frameCount() - start < n && performance.now() - t0 < 90000) {
      await new Promise((r) => setTimeout(r, 150));
    }
  }, frames);
}

const SHOTS: Record<string, (page: import('@playwright/test').Page) => Promise<void>> = {
  golden: async (page) => {
    await page.evaluate(() => (window as any).__RESORT__.flyToZone('overview', true));
    await settle(page, 14);
  },
  dawn: async (page) => { await preset(page, 'dawn'); },
  noon: async (page) => { await preset(page, 'noon'); },
  dusk: async (page) => { await preset(page, 'dusk'); },
  bed: async (page) => { await zone(page, 'bed'); },
  lounge: async (page) => { await zone(page, 'lounge'); },
  editor: async (page) => {
    await page.evaluate(() => (window as any).__RESORT__.setMode('editor'));
    await settle(page, 14);
  },
  'editor-dusk': async (page) => {
    await page.evaluate(() => {
      const a = (window as any).__RESORT__;
      a.setMode('editor');
      a.setTimeOfDay('dusk');
    });
    await settle(page, 24);
  },
  library: async (page) => {
    await page.evaluate(() => (window as any).__RESORT__.setMode('library'));
    await page.waitForTimeout(1500);
  },
};

async function preset(page: import('@playwright/test').Page, id: string) {
  await page.evaluate((p) => (window as any).__RESORT__.setTimeOfDay(p), id);
  await page.evaluate(() => (window as any).__RESORT__.flyToZone('overview', true));
  await settle(page, 30);
}

async function zone(page: import('@playwright/test').Page, id: string) {
  await page.evaluate((z) => (window as any).__RESORT__.flyToZone(z, true), id);
  await settle(page, 14);
}

async function main() {
  const wanted = process.argv.slice(2).filter((a) => a in SHOTS);
  const shots = wanted.length ? wanted : ['golden', 'editor'];
  const browser = await chromium.launch({
    args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'],
  });
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') console.log('[console.error]', m.text().slice(0, 200)); });
  await page.goto(`${BASE}/?grain=0`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => (window as any).__RESORT__?.ready?.(), undefined, { timeout: 200_000 });
  for (const name of shots) {
    await SHOTS[name]!(page);
    await page.screenshot({ path: `${OUT}/${name}.png`, timeout: 150_000 });
    console.log('captured', name);
  }
  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });

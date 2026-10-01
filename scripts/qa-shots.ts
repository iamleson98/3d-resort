/** Capture showcase screenshots for visual QA (showroom / library / editor). */
import { chromium } from '@playwright/test';

const URL = process.env.RESORT_URL ?? 'http://localhost:5173';
const OUT = 'tests/.artifacts';

async function ready(page: import('@playwright/test').Page): Promise<void> {
  await page.waitForFunction(() => {
    const a = (window as unknown as { __RESORT__?: { ready(): boolean } }).__RESORT__;
    return a ? a.ready() : false;
  }, undefined, { timeout: 90_000 });
}

async function main(): Promise<void> {
  const browser = await chromium.launch({
    args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'],
  });
  const page = await browser.newPage({ viewport: { width: 1120, height: 700 } });
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await ready(page);

  // 1. Showroom overview — deluxe king
  await page.evaluate(() => (window as unknown as { __RESORT__: { flyToZone(z: string, instant?: boolean): boolean } }).__RESORT__.flyToZone('overview', true));
  await page.waitForTimeout(10000);
  await page.screenshot({ path: `${OUT}/qa-showroom.png`, timeout: 90_000 });

  // 2. Suite bed zone closeup
  await page.evaluate(() => (window as unknown as { __RESORT__: { flyToZone(z: string, instant?: boolean): boolean } }).__RESORT__.flyToZone('bed', true));
  await page.waitForTimeout(10000);
  await page.screenshot({ path: `${OUT}/qa-bed.png`, timeout: 90_000 });

  // 3. Library mode with podium model + panel open
  await page.evaluate(() => (window as unknown as { __RESORT__: { setMode(m: string): void } }).__RESORT__.setMode('library'));
  await page.waitForTimeout(9000);
  await page.screenshot({ path: `${OUT}/qa-library.png`, timeout: 90_000 });

  // 4. Editor mode with furniture placed
  await page.evaluate(() => (window as unknown as { __RESORT__: { setMode(m: string): void } }).__RESORT__.setMode('editor'));
  await page.evaluate(() => {
    const a = (window as unknown as { __RESORT__: { place(m: string, v: string, x: number, z: number, r?: number): string | null } }).__RESORT__;
    a.place('sofa_3seat', 'linen', -1.2, 0.8, 0);
    a.place('coffee_table_round', 'travertine', 0, 0.6, 0);
    a.place('floor_lamp_arc', 'brass_linen', 1.6, 0.2, 0);
    a.place('monstera', 'grand', -1.9, -1.2, 0);
  });
  await page.waitForTimeout(10000);
  await page.screenshot({ path: `${OUT}/qa-editor.png`, timeout: 90_000 });

  const stats = await page.evaluate(() => {
    const a = (window as unknown as { __RESORT__: { mode(): string; stats(): unknown } }).__RESORT__;
    return { mode: a.mode(), stats: a.stats() };
  });
  console.log('final:', JSON.stringify(stats));
  await browser.close();
}

main().catch((e) => { console.error('CAPTURE FAILED:', e); process.exit(1); });

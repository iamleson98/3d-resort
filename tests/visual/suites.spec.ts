/**
 * Visual inspection — screenshot every suite + zone, assert pixel statistics.
 * These are NOT golden-file comparisons (3D noise differs per GPU) but
 * statistical invariants: a healthy render is neither black nor white,
 * has color diversity and texture detail in the floor region.
 */
import { test, expect, type Page } from '@playwright/test';
import { analyzeBuffer, regionStd } from './pixels';
import { waitForReady } from '../functional/helpers';

/** Frame-count based settle — renderer-speed independent (software raster ~1 fps). */
async function settleFrames(page: Page, frames: number): Promise<void> {
  const start = await page.evaluate(() => (window as unknown as { __RESORT__: { frameCount(): number } }).__RESORT__.frameCount());
  const deadline = Date.now() + 30_000;
  for (;;) {
    const now = await page.evaluate(() => (window as unknown as { __RESORT__: { frameCount(): number } }).__RESORT__.frameCount());
    if (now - start >= frames) return;
    if (Date.now() > deadline) throw new Error(`settleFrames(${frames}) timed out at ${now - start} frames`);
    await page.waitForTimeout(300);
  }
}

const SUITES = [
  { id: 'deluxe-king', zones: ['overview', 'bed', 'lounge', 'bath'] },
  { id: 'ocean-suite', zones: ['overview', 'living', 'sleep', 'window'] },
  { id: 'garden-villa', zones: ['overview', 'living', 'dining', 'bed', 'bath'] },
  { id: 'cliffside-penthouse', zones: ['overview', 'lounge', 'bar', 'dining', 'bed'] },
  { id: 'beachfront-villa', zones: ['overview', 'lounge', 'terrace', 'dining', 'bed', 'bath'] },
];

test.describe('visual inspection — suites', () => {
  for (const suite of SUITES) {
    test(`${suite.id} renders all zones`, async ({ page }) => {
      await page.goto('/');
      await waitForReady(page);
      await page.setViewportSize({ width: 1024, height: 640 });
      await page.evaluate(async (id) => (window as unknown as { __RESORT__: { loadSuite(id: string): Promise<void> } }).__RESORT__.loadSuite(id), suite.id);
      await page.evaluate(() => (window as unknown as { __RESORT__: { setMode(m: string): void } }).__RESORT__.setMode('showroom'));

      for (const zone of suite.zones) {
        // instant=true → deterministic final viewpoint (software rasterizers run ~1 fps,
        // a 1.3 s eased tween would still be mid-flight at screenshot time)
        await page.evaluate((z) => (window as unknown as { __RESORT__: { flyToZone(z: string, instant?: boolean): boolean } }).__RESORT__.flyToZone(z, true), zone);
        // damped camera convergence settle — frame-count based (renderer-speed independent)
        await settleFrames(page, 8);
        await page.waitForTimeout(400);
        const buf = await page.screenshot({ type: 'png' });
        const stats = analyzeBuffer(buf);

        // healthy render invariants
        expect(stats.meanLuma, `${suite.id}/${zone} mean luminance`).toBeGreaterThan(30);
        expect(stats.meanLuma, `${suite.id}/${zone} not blown out`).toBeLessThan(225);
        expect(stats.stdLuma, `${suite.id}/${zone} has contrast`).toBeGreaterThan(18);
        expect(stats.blackRatio, `${suite.id}/${zone} not black`).toBeLessThan(0.25);
        expect(stats.whiteRatio, `${suite.id}/${zone} not white`).toBeLessThan(0.2);
        expect(stats.colorDiversity, `${suite.id}/${zone} color diversity`).toBeGreaterThan(120);

        // floor region shows texture variance (wood grain / marble veins)
        // bottom-center band of the viewport usually covers the floor
        const floorStd = regionStd(buf, Math.floor(stats.width * 0.35), Math.floor(stats.height * 0.72), Math.floor(stats.width * 0.65), Math.floor(stats.height * 0.92));
        expect(floorStd, `${suite.id}/${zone} floor texture detail`).toBeGreaterThan(4);
      }
    });
  }

  test('library mode podium renders models', async ({ page }) => {
    await page.goto('/');
    await waitForReady(page);
    await page.setViewportSize({ width: 1024, height: 640 });
    await page.evaluate(() => (window as unknown as { __RESORT__: { setMode(m: string): void } }).__RESORT__.setMode('library'));
    await page.waitForTimeout(1200);
    const buf = await page.screenshot({ type: 'png' });
    const stats = analyzeBuffer(buf);
    expect(stats.meanLuma).toBeGreaterThan(30);
    expect(stats.stdLuma).toBeGreaterThan(15);
    expect(stats.colorDiversity).toBeGreaterThan(60);
  });

  test('editor mode with placed furniture renders', async ({ page }) => {
    await page.goto('/');
    await waitForReady(page);
    await page.setViewportSize({ width: 1024, height: 640 });
    await page.evaluate(() => (window as unknown as { __RESORT__: { setMode(m: string): void } }).__RESORT__.setMode('editor'));
    await page.evaluate(() => {
      const a = (window as unknown as { __RESORT__: { place(m: string, v: string, x: number, z: number, r?: number): string | null } }).__RESORT__;
      a.place('sofa_3seat', 'linen', 3, 4, 0);
      a.place('coffee_table_rect', 'nero', 3, 3, 0);
      a.place('rug_area', 'border', 3, 3.6, 0);
      a.place('floor_lamp_arc', 'brass_linen', 1.4, 3, 0);
      a.place('palm_areca', 'terra', 5.6, 4.6, 0);
    });
    await page.waitForTimeout(1500);
    const buf = await page.screenshot({ type: 'png' });
    const stats = analyzeBuffer(buf);
    expect(stats.meanLuma).toBeGreaterThan(30);
    expect(stats.stdLuma).toBeGreaterThan(18);
    expect(stats.colorDiversity).toBeGreaterThan(120);
  });
});

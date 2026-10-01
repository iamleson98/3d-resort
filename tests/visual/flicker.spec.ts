/**
 * Frame-stability (flicker regression) — the v1 floor-flicker bug guard.
 * Captures consecutive frames with the camera parked (no auto-orbit, no
 * tween) and asserts per-pixel temporal stability. Z-fighting / shadow
 * acne / transparent-sort popping show up as large frame-to-frame deltas.
 */
import { test, expect } from '@playwright/test';
import { frameDifference, analyzeBuffer } from './pixels';
import { waitForReady } from '../functional/helpers';

/**
 * In software rendering (~1 fps) a "settled" camera needs a couple of frames.
 * Frame-count based (not wall-clock) so it is correct at any renderer speed:
 * 8 frames let the damped camera rig converge to sub-pixel residual.
 */
async function settle(page: import('@playwright/test').Page, frames = 8): Promise<void> {
  const start = await page.evaluate(() => (window as unknown as { __RESORT__: { frameCount(): number } }).__RESORT__.frameCount());
  const deadline = Date.now() + 30_000;
  for (;;) {
    const now = await page.evaluate(() => (window as unknown as { __RESORT__: { frameCount(): number } }).__RESORT__.frameCount());
    if (now - start >= frames) return;
    if (Date.now() > deadline) throw new Error(`settle(${frames}) timed out at ${now - start} frames`);
    await page.waitForTimeout(300);
  }
}

test.describe('frame stability (anti-flicker)', () => {
  test('parked camera → consecutive frames are pixel-stable', async ({ page }) => {
    await page.goto('/');
    await waitForReady(page);
    await page.setViewportSize({ width: 800, height: 500 });

    // park the camera: instant flyTo the overview zone — this also disables
    // auto-orbit, so "parked" means truly stationary (dollhouse wall state
    // included — wall visibility is a pure function of camera position)
    await page.evaluate(() => (window as unknown as { __RESORT__: { flyToZone(z: string, instant?: boolean): boolean } }).__RESORT__.flyToZone('overview', true));

    // settle on the parked suite view, then sample pairs of frames
    await settle(page);
    const a1 = await page.screenshot({ type: 'png' });
    await page.waitForTimeout(260);
    const a2 = await page.screenshot({ type: 'png' });
    const diff1 = frameDifference(a1, a2);

    // a second pair, later
    await page.waitForTimeout(500);
    const b1 = await page.screenshot({ type: 'png' });
    await page.waitForTimeout(260);
    const b2 = await page.screenshot({ type: 'png' });
    const diff2 = frameDifference(b1, b2);

    // auto-orbit is ON in showroom… camera drifts slowly, so the threshold
    // allows gentle motion but catches flicker (which is 10-100× stronger).
    expect(diff1, `frame delta pair 1 (${diff1.toFixed(2)})`).toBeLessThan(3.5);
    expect(diff2, `frame delta pair 2 (${diff2.toFixed(2)})`).toBeLessThan(3.5);
  });

  test('floor does not shimmer — region stability over 5 samples', async ({ page }) => {
    await page.goto('/');
    await waitForReady(page);
    await page.setViewportSize({ width: 800, height: 500 });
    await page.evaluate(() => (window as unknown as { __RESORT__: { flyToZone(z: string, instant?: boolean): boolean } }).__RESORT__.flyToZone('overview', true));
    await settle(page);

    const PNGlib = await import('pngjs');
    const samples: Array<{ floorLuma: number }> = [];
    for (let i = 0; i < 4; i++) {
      const buf = await page.screenshot({ type: 'png' });
      const png = PNGlib.PNG.sync.read(buf);
      // floor band sample
      let sum = 0;
      let n = 0;
      const y0 = Math.floor(png.height * 0.78);
      const y1 = Math.floor(png.height * 0.9);
      const x0 = Math.floor(png.width * 0.4);
      const x1 = Math.floor(png.width * 0.6);
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const idx = (y * png.width + x) * 4;
          sum += 0.2126 * png.data[idx]! + 0.7152 * png.data[idx + 1]! + 0.0722 * png.data[idx + 2]!;
          n += 1;
        }
      }
      samples.push({ floorLuma: sum / n });
      await page.waitForTimeout(300);
    }
    const lumas = samples.map((s) => s.floorLuma);
    const mean = lumas.reduce((a, b) => a + b, 0) / lumas.length;
    const maxDrift = Math.max(...lumas.map((l) => Math.abs(l - mean)));
    // shimmering floors drift wildly between frames; stable floors don't
    expect(maxDrift, `floor luminance drift (${maxDrift.toFixed(2)})`).toBeLessThan(2.5);
    // floor must not be uniformly flat either (texture present)
    expect(mean).toBeGreaterThan(20);
  });

  test('editor scene stays stable with many overlapping shadows', async ({ page }) => {
    await page.goto('/');
    await waitForReady(page);
    await page.setViewportSize({ width: 800, height: 500 });
    await page.evaluate(() => (window as unknown as { __RESORT__: { setMode(m: string): void } }).__RESORT__.setMode('editor'));
    await page.evaluate(() => {
      const a = (window as unknown as { __RESORT__: { place(m: string, v: string, x: number, z: number, r?: number): string | null } }).__RESORT__;
      a.place('rug_area', 'border', 3, 3.6, 0);
      a.place('sofa_3seat', 'linen', 3, 4.2, 0);
      a.place('coffee_table_rect', 'nero', 3, 3, 0);
      a.place('pouf', 'boucle', 4.2, 2.8, 0);
      a.place('side_table', 'brass_marble', 2, 2.6, 0);
      a.place('plant_potted', 'fern', 5.6, 2, 0);
      return true;
    });
    await settle(page);
    const f1 = await page.screenshot({ type: 'png' });
    await page.waitForTimeout(280);
    const f2 = await page.screenshot({ type: 'png' });
    const diff = frameDifference(f1, f2);
    expect(diff, `editor frame delta (${diff.toFixed(2)})`).toBeLessThan(3.0);

    const stats = analyzeBuffer(f1);
    expect(stats.meanLuma).toBeGreaterThan(25);
    expect(stats.stdLuma).toBeGreaterThan(15);
  });
});

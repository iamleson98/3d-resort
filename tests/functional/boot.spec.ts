/** Boot — splash → app, backend, first frames, no console errors. */
import { test, expect } from '@playwright/test';
import { waitForReady, waitForFrames, captureErrors } from './helpers';

test.describe('boot', () => {
  test('loads without console or page errors', async ({ page }) => {
    const errors = await captureErrors(page, async () => {
      await page.goto('/?fx=off&seed=0');
      await waitForReady(page);
      await waitForFrames(page, 5);
    });
    expect(errors).toEqual([]);
  });

  test('splash transitions to the app shell', async ({ page }) => {
    await page.goto('/?fx=off&seed=0');
    // on warm shader caches the app can boot before this assertion runs — the
    // splash may legitimately already be dismissed, so accept either state
    await expect(page.locator('#splash')).toBeAttached();
    await waitForReady(page);
    await expect(page.locator('#splash')).toHaveClass(/done/, { timeout: 90_000 });
    await expect(page.locator('.topnav')).toBeVisible();
    await expect(page.locator('.brand-mark')).toBeVisible();
  });

  test('renderer reports WebGPU or WebGL2 backend', async ({ page }) => {
    await page.goto('/?fx=off&seed=0');
    const backend = await waitForReady(page);
    expect(['WebGPU', 'WebGL2']).toContain(backend);
  });

  test('canvas renders continuously', async ({ page }) => {
    await page.goto('/?fx=off&seed=0');
    await waitForReady(page);
    // SwiftShader (software) runs ~1 fps — any monotonic progress over 4s proves the loop lives
    const f1 = await page.evaluate(() => (window as unknown as { __RESORT__: { frameCount(): number } }).__RESORT__.frameCount());
    await page.waitForTimeout(4000);
    const f2 = await page.evaluate(() => (window as unknown as { __RESORT__: { frameCount(): number } }).__RESORT__.frameCount());
    expect(f2).toBeGreaterThan(f1);
    expect(f2 - f1).toBeGreaterThanOrEqual(2);
  });

  test('scene contains real geometry', async ({ page }) => {
    await page.goto('/?fx=off&seed=0');
    await waitForReady(page);
    const stats = await page.evaluate(() => (window as unknown as { __RESORT__: { stats(): { meshes: number; triangles: number } } }).__RESORT__.stats());
    expect(stats.meshes).toBeGreaterThan(150);
    expect(stats.triangles).toBeGreaterThan(10_000);
  });
});

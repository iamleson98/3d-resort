/** Photoreal pipeline — time-of-day, post chain, quality tiers, seeded configurator. */
import { test, expect, type Page } from '@playwright/test';
import { waitForReady, expectNoErrors } from './helpers';

async function call<T>(page: Page, expr: string): Promise<T> {
  return page.evaluate(`window.__RESORT__.${expr}`) as Promise<T>;
}

test.describe('photoreal pipeline', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?fx=off&seed=0');
    await waitForReady(page);
  });

  test('boots at golden hour with the sun west of the glazing', async ({ page }) => {
    await expectNoErrors(page, async () => {
      expect(await call<string>(page, 'timeOfDay()')).toBe('golden');
      const d = await call<{ sunPos: number[]; sunIntensity: number; pointLights: number; castShadowMeshes: number }>(page, 'debugShadow()');
      // sun must sit beyond the north glazing (negative z) and west (negative x
      // relative to the room center ~3.25) so beams clear the window's east jamb
      expect(d.sunPos[2]).toBeLessThan(0);
      expect(d.sunPos[0]).toBeLessThan(3.25);
      expect(d.sunIntensity).toBeGreaterThan(1);
      expect(d.castShadowMeshes).toBeGreaterThan(20);
    });
  });

  test('time-of-day presets switch and lamps track the level', async ({ page }) => {
    await expectNoErrors(page, async () => {
      await call(page, "setTimeOfDay('dusk')");
      expect(await call<string>(page, 'timeOfDay()')).toBe('dusk');
      const duskLights = (await call<{ pointLights: number }>(page, 'debugShadow()')).pointLights;
      await call(page, "setTimeOfDay('noon')");
      expect(await call<string>(page, 'timeOfDay()')).toBe('noon');
      // lamp point lights exist in both presets (intensity scales, count does not)
      expect((await call<{ pointLights: number }>(page, 'debugShadow()')).pointLights).toBe(duskLights);
      // invalid preset ids are ignored
      await call(page, "setTimeOfDay('midnight')");
      expect(await call<string>(page, 'timeOfDay()')).toBe('noon');
    });
  });

  test('post chain reports off when booted with fx=off', async ({ page }) => {
    await expectNoErrors(page, async () => {
      expect(await call<boolean>(page, 'postEnabled()')).toBe(false);
      expect(await call<string>(page, 'quality()')).toBe('off');
    });
  });

  test('editor seeds the suite baseline by default', async ({ page }) => {
    await page.goto('/?fx=off');
    await waitForReady(page);
    await page.evaluate(() => (window as unknown as { __RESORT__: { setMode(m: string): void } }).__RESORT__.setMode('editor'));
    const ps = await call<Array<{ modelId: string }>>(page, 'placements()');
    expect(ps.length).toBeGreaterThanOrEqual(15);
    expect(ps.some((p) => p.modelId === 'bed_king')).toBe(true);
    const spec = await page.evaluate(() => (window as unknown as { __RESORT__: { spec(): { itemCount: number } } }).__RESORT__.spec());
    expect(spec.itemCount).toBeGreaterThan(10);
  });
});

test.describe('photoreal pipeline with the full post chain', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?grain=0');
    await waitForReady(page);
  });

  test('renders frames through the post chain without errors', async ({ page }) => {
    await expectNoErrors(page, async () => {
      expect(await call<boolean>(page, 'postEnabled()')).toBe(true);
      expect(await call<string>(page, 'quality()')).toContain('balanced');
      // settle the GTAO temporal accumulation
      await page.waitForTimeout(2500);
      expect(await call<boolean>(page, 'postEnabled()')).toBe(true);
    });
  });

  test('quality tiers switch without breaking the frame', async ({ page }) => {
    await expectNoErrors(page, async () => {
      await call(page, "setQuality('efficient')");
      expect(await call<string>(page, 'quality()')).toContain('efficient');
      await page.waitForTimeout(1200);
      await call(page, "setQuality('balanced')");
      await page.waitForTimeout(1200);
      expect(await call<string>(page, 'quality()')).toContain('balanced');
    });
  });
});

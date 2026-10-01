/** Editor mode — placement, selection, rotate/move/delete, undo/redo, spec sync. */
import { test, expect } from '@playwright/test';
import { waitForReady, expectNoErrors } from './helpers';

test.describe('editor mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForReady(page);
    await page.evaluate(() => (window as unknown as { __RESORT__: { setMode(m: string): void } }).__RESORT__.setMode('editor'));
  });

  test('starts with an empty room and an empty spec', async ({ page }) => {
    const spec = await page.evaluate(() => (window as unknown as { __RESORT__: { spec(): { itemCount: number; lines: unknown[] } } }).__RESORT__.spec());
    expect(spec.itemCount).toBe(0);
    expect(spec.lines).toHaveLength(0);
    await expect(page.locator('.spec-empty')).toBeVisible();
  });

  test('place → auto spec updates', async ({ page }) => {
    await expectNoErrors(page, async () => {
      const id = await page.evaluate(() => (window as unknown as { __RESORT__: { place(m: string, v: string, x: number, z: number, r?: number): string | null } }).__RESORT__.place('sofa_3seat', 'linen', 3, 4, 0));
      expect(id).toBeTruthy();
      const spec = await page.evaluate(() => (window as unknown as { __RESORT__: { spec(): { itemCount: number; lines: Array<{ label: string; quantity: number }> } } }).__RESORT__.spec());
      expect(spec.itemCount).toBe(1);
      expect(spec.lines[0]!.quantity).toBe(1);
      expect(spec.lines[0]!.label).toContain('Lan Bay Three-Seat Sofa');
    });
  });

  test('multiple placements of the same variant fold into one line', async ({ page }) => {
    await page.evaluate(() => {
      const a = (window as unknown as { __RESORT__: { place(m: string, v: string, x: number, z: number, r?: number): string | null } }).__RESORT__;
      a.place('dining_chair', 'oak_cognac', 2, 2, 0);
      a.place('dining_chair', 'oak_cognac', 3, 2, 0);
      a.place('dining_chair', 'oak_cognac', 4, 2, 0);
    });
    const spec = await page.evaluate(() => (window as unknown as { __RESORT__: { spec(): { lines: Array<{ quantity: number }>; itemCount: number } } }).__RESORT__.spec());
    expect(spec.lines).toHaveLength(1);
    expect(spec.lines[0]!.quantity).toBe(3);
    expect(spec.itemCount).toBe(3);
    await expect(page.locator('.spec-row')).toHaveCount(1);
  });

  test('selection + rotate + move', async ({ page }) => {
    await expectNoErrors(page, async () => {
      const id = await page.evaluate(() => (window as unknown as { __RESORT__: { place(m: string, v: string, x: number, z: number, r?: number): string | null } }).__RESORT__.place('lounge_armchair', 'cognac', 2, 2, 0));
      expect(id).toBeTruthy();
      await page.evaluate((pid) => (window as unknown as { __RESORT__: { select(id: string): void } }).__RESORT__.select(pid), id as string);
      await page.evaluate((pid) => (window as unknown as { __RESORT__: { rotate(id: string, d?: number): void } }).__RESORT__.rotate(pid, 45), id as string);
      const moved = await page.evaluate((pid) => (window as unknown as { __RESORT__: { move(id: string, x: number, z: number): boolean } }).__RESORT__.move(pid, 4, 3), id as string);
      expect(moved).toBe(true);
      const ps = await page.evaluate(() => (window as unknown as { __RESORT__: { placements(): Array<{ rotation: number; x: number; z: number }> } }).__RESORT__.placements());
      expect(Math.abs(ps[0]!.rotation - Math.PI / 4)).toBeLessThan(0.01);
      expect(ps[0]!.x).toBeCloseTo(4);
      expect(ps[0]!.z).toBeCloseTo(3);
    });
  });

  test('rotation snaps to 15° increments', async ({ page }) => {
    const id = await page.evaluate(() => (window as unknown as { __RESORT__: { place(m: string, v: string, x: number, z: number, r?: number): string | null } }).__RESORT__.place('pouf', 'boucle', 3, 3, 23));
    const ps = await page.evaluate(() => (window as unknown as { __RESORT__: { placements(): Array<{ rotation: number }> } }).__RESORT__.placements());
    const deg = (ps[0]!.rotation * 180) / Math.PI;
    expect(Math.abs(deg - 30)).toBeLessThan(0.5);
    void id;
  });

  test('positions clamp inside the room bounds', async ({ page }) => {
    await page.evaluate(() => (window as unknown as { __RESORT__: { place(m: string, v: string, x: number, z: number, r?: number): string | null } }).__RESORT__.place('side_table', 'brass_marble', -50, -50, 0));
    const ps = await page.evaluate(() => (window as unknown as { __RESORT__: { placements(): Array<{ x: number; z: number }> } }).__RESORT__.placements());
    expect(ps[0]!.x).toBeGreaterThanOrEqual(0);
    expect(ps[0]!.z).toBeGreaterThanOrEqual(0);
  });

  test('delete removes from scene and spec', async ({ page }) => {
    const id = await page.evaluate(() => (window as unknown as { __RESORT__: { place(m: string, v: string, x: number, z: number, r?: number): string | null } }).__RESORT__.place('bed_king', 'linen_oak', 3, 2, 180));
    expect(id).toBeTruthy();
    let spec = await page.evaluate(() => (window as unknown as { __RESORT__: { spec(): { itemCount: number } } }).__RESORT__.spec());
    expect(spec.itemCount).toBe(1);
    const ok = await page.evaluate((pid) => (window as unknown as { __RESORT__: { remove(id: string): boolean } }).__RESORT__.remove(pid), id as string);
    expect(ok).toBe(true);
    spec = await page.evaluate(() => (window as unknown as { __RESORT__: { spec(): { itemCount: number } } }).__RESORT__.spec());
    expect(spec.itemCount).toBe(0);
  });

  test('undo/redo restores placement history', async ({ page }) => {
    await expectNoErrors(page, async () => {
      await page.evaluate(() => {
        const a = (window as unknown as { __RESORT__: { place(m: string, v: string, x: number, z: number, r?: number): string | null } }).__RESORT__;
        a.place('pouf', 'boucle', 2, 2, 0);
        a.place('pouf', 'navy', 3, 3, 0);
        a.place('side_table', 'brass_marble', 4, 4, 0);
      });
      expect((await page.evaluate(() => (window as unknown as { __RESORT__: { spec(): { itemCount: number } } }).__RESORT__.spec())).itemCount).toBe(3);
      expect(await page.evaluate(() => (window as unknown as { __RESORT__: { undo(): boolean } }).__RESORT__.undo())).toBe(true);
      expect((await page.evaluate(() => (window as unknown as { __RESORT__: { spec(): { itemCount: number } } }).__RESORT__.spec())).itemCount).toBe(2);
      expect(await page.evaluate(() => (window as unknown as { __RESORT__: { undo(): boolean } }).__RESORT__.undo())).toBe(true);
      expect((await page.evaluate(() => (window as unknown as { __RESORT__: { spec(): { itemCount: number } } }).__RESORT__.spec())).itemCount).toBe(1);
      expect(await page.evaluate(() => (window as unknown as { __RESORT__: { redo(): boolean } }).__RESORT__.redo())).toBe(true);
      expect((await page.evaluate(() => (window as unknown as { __RESORT__: { spec(): { itemCount: number } } }).__RESORT__.spec())).itemCount).toBe(2);
      // undo past empty → false
      expect(await page.evaluate(() => (window as unknown as { __RESORT__: { undo(): boolean } }).__RESORT__.undo())).toBe(true);
      expect(await page.evaluate(() => (window as unknown as { __RESORT__: { undo(): boolean } }).__RESORT__.undo())).toBe(true);
      expect(await page.evaluate(() => (window as unknown as { __RESORT__: { undo(): boolean } }).__RESORT__.undo())).toBe(false);
    });
  });

  test('manual quantity override + reset round trip', async ({ page }) => {
    await page.evaluate(() => (window as unknown as { __RESORT__: { place(m: string, v: string, x: number, z: number, r?: number): string | null } }).__RESORT__.place('pouf', 'boucle', 2, 2, 0));
    const ok = await page.evaluate(() => (window as unknown as { __RESORT__: { setQuantity(m: string, v: string, q: number): boolean } }).__RESORT__.setQuantity('pouf', 'boucle', 6));
    expect(ok).toBe(true);
    let spec = await page.evaluate(() => (window as unknown as { __RESORT__: { spec(): { lines: Array<{ quantity: number; manual: boolean }>; itemCount: number } } }).__RESORT__.spec());
    expect(spec.lines[0]!.quantity).toBe(6);
    expect(spec.lines[0]!.manual).toBe(true);
    expect(spec.itemCount).toBe(1); // physical count unchanged
    const cleared = await page.evaluate(() => (window as unknown as { __RESORT__: { clearManual(m: string, v: string): boolean } }).__RESORT__.clearManual('pouf', 'boucle'));
    expect(cleared).toBe(true);
    spec = await page.evaluate(() => (window as unknown as { __RESORT__: { spec(): { lines: Array<{ quantity: number; manual: boolean }>; itemCount: number } } }).__RESORT__.spec());
    expect(spec.lines[0]!.quantity).toBe(1);
    expect(spec.lines[0]!.manual).toBe(false);
  });

  test('quantity input in the spec panel edits live', async ({ page }) => {
    await page.evaluate(() => (window as unknown as { __RESORT__: { place(m: string, v: string, x: number, z: number, r?: number): string | null } }).__RESORT__.place('pouf', 'boucle', 2, 2, 0));
    const input = page.locator('.qty-input').first();
    await input.fill('4');
    await input.dispatchEvent('change');
    await expect(page.locator('.spec-row')).toHaveClass(/manual/);
    const spec = await page.evaluate(() => (window as unknown as { __RESORT__: { spec(): { lines: Array<{ quantity: number }> } } }).__RESORT__.spec());
    expect(spec.lines[0]!.quantity).toBe(4);
  });

  test('spec export produces procurement JSON', async ({ page }) => {
    await page.evaluate(() => (window as unknown as { __RESORT__: { place(m: string, v: string, x: number, z: number, r?: number): string | null } }).__RESORT__.place('bed_king', 'linen_oak', 3, 2, 180));
    const data = await page.evaluate(() => (window as unknown as { __RESORT__: { exportSpec(): { currency: string; lines: Array<{ model: string; quantity: number; quantitySource: string }>; totals: { total: number } } } }).__RESORT__.exportSpec());
    expect(data.currency).toBe('USD');
    expect(data.lines[0]!.model).toBe('bed_king');
    expect(data.lines[0]!.quantitySource).toBe('auto');
    expect(data.totals.total).toBeGreaterThan(0);
  });

  test('toolbar buttons disabled state follows selection', async ({ page }) => {
    await expect(page.locator('.editor-toolbar .icon-btn').first()).toHaveClass(/disabled/);
    const id = await page.evaluate(() => (window as unknown as { __RESORT__: { place(m: string, v: string, x: number, z: number, r?: number): string | null } }).__RESORT__.place('pouf', 'boucle', 2, 2, 0));
    expect(id).toBeTruthy();
    await page.evaluate((pid) => (window as unknown as { __RESORT__: { select(id: string): void } }).__RESORT__.select(pid), id as string);
    await expect(page.locator('.editor-toolbar .icon-btn').first()).not.toHaveClass(/disabled/);
  });

  test('placing via catalog "Place in room" starts a ghost drag', async ({ page }) => {
    await page.click('.entry-card:has-text("Coral Pouf")');
    await page.click('.place-btn');
    // ghost lives in the scene; move the mouse over the canvas floor and release
    const canvas = page.locator('#stage');
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width * 0.55, box.y + box.height * 0.55);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5, { steps: 4 });
      await page.mouse.up();
    }
    const ps = await page.evaluate(() => (window as unknown as { __RESORT__: { placements(): Array<{ modelId: string }> } }).__RESORT__.placements());
    expect(ps.some((p) => p.modelId === 'pouf')).toBe(true);
  });
});

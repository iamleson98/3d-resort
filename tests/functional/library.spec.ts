/** Library mode — catalog browsing, category filters, variant switching. */
import { test, expect } from '@playwright/test';
import { waitForReady, expectNoErrors } from './helpers';

test.describe('library mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?fx=off&seed=0');
    await waitForReady(page);
    await page.evaluate(() => (window as unknown as { __RESORT__: { setMode(m: string): void } }).__RESORT__.setMode('library'));
  });

  test('catalog panel lists every model', async ({ page }) => {
    const cards = page.locator('.entry-card');
    expect(await cards.count()).toBeGreaterThanOrEqual(60);
  });

  test('category chips filter the list', async ({ page }) => {
    await expectNoErrors(page, async () => {
      const n = await page.evaluate(() => (window as unknown as { __RESORT__: { selectCategory(c: string): number } }).__RESORT__.selectCategory('seating'));
      expect(n).toBeGreaterThanOrEqual(8);
      const cards = page.locator('.entry-card');
      expect(await cards.count()).toBe(n);
      const all = await page.evaluate(() => (window as unknown as { __RESORT__: { selectCategory(c: string): number } }).__RESORT__.selectCategory('all'));
      expect(await cards.count()).toBe(all);
    });
  });

  test('clicking a card shows its detail with variants', async ({ page }) => {
    await page.click('.entry-card:has-text("Riviera Lounge Armchair")');
    await expect(page.locator('.entry-detail h4')).toHaveText('Riviera Lounge Armchair');
    const variants = page.locator('.variant-btn');
    expect(await variants.count()).toBe(4);
    await expect(page.locator('.entry-detail .dim-row')).toBeVisible();
  });

  test('switching variants rebuilds the displayed model', async ({ page }) => {
    await expectNoErrors(page, async () => {
      await page.evaluate(() => (window as unknown as { __RESORT__: { switchVariant(m: string, v: string): void } }).__RESORT__.switchVariant('lounge_armchair', 'ivory'));
      await page.waitForTimeout(300);
      const stats = await page.evaluate(() => (window as unknown as { __RESORT__: { stats(): { meshes: number } } }).__RESORT__.stats());
      expect(stats.meshes).toBeGreaterThan(5);
    });
  });

  test('variant buttons switch via DOM clicks', async ({ page }) => {
    await page.click('.entry-card:has-text("Sanctuary King Bed")');
    const variantBtn = page.locator('.variant-btn', { hasText: 'Emerald Velvet & Wenge' });
    await variantBtn.click();
    await expect(variantBtn).toHaveClass(/active/);
    await page.waitForTimeout(200);
  });

  test('search-free browsing across categories shows models', async ({ page }) => {
    await page.click('.cat-tabs .chip:has-text("Plants")');
    const cards = page.locator('.entry-card');
    expect(await cards.count()).toBeGreaterThanOrEqual(5);
    await expect(cards.first()).toContainText(/Palm|Monstera|Ficus|Olive|Greenery|Pothos|Bamboo/i);
  });
});

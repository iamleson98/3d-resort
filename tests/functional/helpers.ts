/** Shared helpers for browser tests — waits, API access, console guards. */
import { expect, type Page, type ConsoleMessage } from '@playwright/test';

export interface ResortApi {
  ready(): boolean;
  backend(): string;
  mode(): string;
  setMode(m: string): void;
  activeSuite(): string;
  loadSuite(id: string): Promise<void>;
  zones(): Array<{ id: string; label: string }>;
  flyToZone(zoneId: string, instant?: boolean): boolean;
  catalog(): { count: number; categories: Array<{ name: string; count: number }> };
  selectCategory(c: string): number;
  libraryEntries(): Array<{ id: string; label: string; variants: number }>;
  switchVariant(modelId: string, variantId: string): void;
  place(modelId: string, variantId: string, x: number, z: number, rotation?: number): string | null;
  placements(): Array<{ id: string; modelId: string; variantId: string; x: number; z: number; rotation: number }>;
  select(placementId: string): void;
  rotate(placementId: string, degrees?: number): void;
  move(placementId: string, x: number, z: number): boolean;
  remove(placementId: string): boolean;
  undo(): boolean;
  redo(): boolean;
  spec(): { lines: unknown[]; itemCount: number; subtotal: number; total: number };
  setQuantity(modelId: string, variantId: string, qty: number): boolean;
  clearManual(modelId: string, variantId: string): boolean;
  exportSpec(): object;
  stats(): { meshes: number; drawCalls: number; triangles: number };
  frameCount(): number;
}

export async function waitForReady(page: Page): Promise<string> {
  await page.waitForFunction(() => {
    const a = (window as unknown as { __RESORT__?: { ready(): boolean } }).__RESORT__;
    return a ? a.ready() : false;
  }, undefined, { timeout: 60_000 });
  return page.evaluate(() => (window as unknown as { __RESORT__: { backend(): string } }).__RESORT__.backend());
}

export async function waitForFrames(page: Page, n: number): Promise<void> {
  const deadline = Date.now() + 30_000;
  for (;;) {
    const frames = await page.evaluate(
      () => (window as unknown as { __RESORT__?: { frameCount(): number } }).__RESORT__?.frameCount() ?? 0,
    );
    if (frames >= n) return;
    if (Date.now() > deadline) throw new Error(`waitForFrames(${n}) timed out at ${frames} frames`);
    await page.waitForTimeout(250);
  }
}

/** Collect console errors / page errors while running a callback. */
export async function captureErrors(page: Page, fn: () => Promise<void>): Promise<string[]> {
  const errors: string[] = [];
  const onConsole = (msg: ConsoleMessage): void => {
    if (msg.type() === 'error') errors.push(msg.text());
  };
  const onPageError = (err: Error): void => {
    errors.push(err.message);
  };
  page.on('console', onConsole);
  page.on('pageerror', onPageError);
  try {
    await fn();
  } finally {
    page.off('console', onConsole);
    page.off('pageerror', onPageError);
  }
  // WebGL info messages are tolerated
  return errors.filter((e) => !e.includes('WEBGL') && !e.includes('Fallback to WebGL'));
}

export async function expectNoErrors(page: Page, fn: () => Promise<void>): Promise<void> {
  const errors = await captureErrors(page, fn);
  expect(errors, `console errors: ${errors.join(' | ')}`).toEqual([]);
}

/** Probe: time app boot + first frames in headless SwiftShader Chromium. */
import { chromium } from '@playwright/test';

const URL = process.env.RESORT_URL ?? 'http://localhost:5173';

async function main(): Promise<void> {
  const browser = await chromium.launch({
    args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'],
  });
  const page = await browser.newPage();
  page.on('console', (m) => { if (m.type() === 'error') console.log('[console.error]', m.text().slice(0, 300)); });
  page.on('pageerror', (e) => console.log('[pageerror]', e.message.slice(0, 300)));

  const t0 = Date.now();
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  console.log('domcontentloaded', Date.now() - t0, 'ms');

  await page.waitForFunction(() => {
    const a = (window as unknown as { __RESORT__?: { ready(): boolean } }).__RESORT__;
    return a ? a.ready() : false;
  }, undefined, { timeout: 120_000 });
  console.log('app ready', Date.now() - t0, 'ms');

  const backend = await page.evaluate(() => (window as unknown as { __RESORT__: { backend(): string } }).__RESORT__.backend());
  console.log('backend =', backend);

  const t1 = Date.now();
  await page.waitForFunction(() => {
    const a = (window as unknown as { __RESORT__?: { frameCount(): number } }).__RESORT__;
    return a ? a.frameCount() >= 3 : false;
  }, undefined, { timeout: 120_000 });
  console.log('3 frames in', Date.now() - t1, 'ms');

  const stats = await page.evaluate(() => (window as unknown as { __RESORT__: { stats(): unknown } }).__RESORT__.stats());
  console.log('stats =', JSON.stringify(stats));

  await page.screenshot({ path: 'tests/.artifacts/probe-boot.png' });
  console.log('total', Date.now() - t0, 'ms');
  await browser.close();
}

main().catch((e) => { console.error('PROBE FAILED:', e); process.exit(1); });

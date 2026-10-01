/** Entry point — boot the app, expose the test API, dismiss splash. */
import { App } from './bootstrap';

async function main(): Promise<void> {
  const app = document.getElementById('app')!;
  const host = document.createElement('div');
  host.id = 'stage-host';
  const canvas = document.createElement('canvas');
  canvas.id = 'stage';
  host.append(canvas);
  app.prepend(host);

  const splash = document.getElementById('splash')!;
  const statusEl = document.getElementById('splash-status')!;

  const appInstance = new App({ canvas, splash, statusEl });
  try {
    statusEl.textContent = 'Compiling materials…';
    await appInstance.start();
    statusEl.textContent = 'Welcome';
    splash.classList.add('done');
  } catch (err) {
    statusEl.textContent = 'Renderer failed to start — please use a modern browser.';
    console.error('[boot]', err);
    return;
  }

  // test harness (functional tests drive the app through this API)
  (window as unknown as { __RESORT__: unknown }).__RESORT__ = appInstance.testApi();
}

void main();

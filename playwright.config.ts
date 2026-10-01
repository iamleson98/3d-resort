import { defineConfig, devices } from '@playwright/test';

const SERVER = process.env.RESORT_URL ?? 'http://localhost:5173';

export default defineConfig({
  testDir: '.',
  outputDir: 'tests/.artifacts',
  timeout: 300_000,
  retries: 0,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: SERVER,
    ...devices['Desktop Chrome'],
    launchOptions: {
      args: [
        '--enable-unsafe-swiftshader',
        '--use-angle=swiftshader',
        '--enable-webgl',
        '--ignore-gpu-blocklist',
      ],
    },
  },
  projects: [
    { name: 'functional', testMatch: 'tests/functional/**/*.spec.ts' },
    { name: 'visual', testMatch: 'tests/visual/**/*.spec.ts' },
  ],
});

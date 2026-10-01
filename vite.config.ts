import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  server: { host: true, port: 5173 },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 4096,
  },
});

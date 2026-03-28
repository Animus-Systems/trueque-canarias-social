import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiPort = env.PORT || '3737';
  const apiTarget = `http://localhost:${apiPort}`;

  return {
    plugins: [react()],
    root: './client',
    build: {
      outDir: '../dist/client',
      emptyOutDir: true,
    },
    server: {
      port: 5173,
      proxy: {
        '/trpc': apiTarget,
        '/api': apiTarget,
        '/health': apiTarget,
        '/openapi.json': apiTarget,
      },
    },
  };
});

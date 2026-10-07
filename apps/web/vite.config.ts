import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', 'VITE_');
  const apiUrl = new URL(env.VITE_API_URL || '/api', 'http://localhost:5000');

  return {
    plugins: [react()],
    server: {
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': {
          target: apiUrl.origin,
          changeOrigin: true,
          rewrite: (path) => `${apiUrl.pathname.replace(/\/$/, '')}${path.slice(4)}`,
        },
      },
    },
  };
});

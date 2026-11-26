import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxyTarget = env.VITE_DEV_PROXY_TARGET;

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    optimizeDeps: {
      include: ['jspdf', 'html2canvas'],
    },
    ...(proxyTarget
      ? {
          server: {
            proxy: {
              '/api': {
                target: proxyTarget,
                changeOrigin: true,
                secure: true,
                headers: {
                  origin: 'https://www.coisasdegaragem.com.br',
                },
              },
            },
          },
        }
      : {}),
  };
});

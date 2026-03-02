import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import type { Plugin } from 'vite'

// Plugin to handle Tailwind CSS v4 native modules
function tailwindOxidePlugin(): Plugin {
  return {
    name: 'tailwind-oxide-plugin',
    enforce: 'pre',
    resolveId(source: string) {
      if (source.includes('@tailwindcss/oxide') || 
          source.includes('tailwindcss-oxide') ||
          source.includes('../pkg') ||
          source.includes('.node')) {
        return { id: source, external: true }
      }
    },
    load(id: string) {
      if (id.includes('@tailwindcss/oxide') || 
          id.includes('tailwindcss-oxide') ||
          id.includes('../pkg') ||
          id.includes('.node')) {
        return `export default {};`
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindOxidePlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['jspdf', 'html2canvas'],
    exclude: ['@tailwindcss/oxide', '@tailwindcss/oxide-win32-x64-msvc', '@tailwindcss/oxide-darwin-x64', '@tailwindcss/oxide-darwin-arm64', '@tailwindcss/oxide-linux-x64', '@tailwindcss/oxide-linux-arm64'],
  },
  // Capacitor configuration
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      external: [
        '@tailwindcss/oxide', 
        '@tailwindcss/oxide-win32-x64-msvc', 
        '@tailwindcss/oxide-darwin-x64', 
        '@tailwindcss/oxide-darwin-arm64', 
        '@tailwindcss/oxide-linux-x64', 
        '@tailwindcss/oxide-linux-arm64',
        '../pkg',
        /.+\.node$/
      ],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['tailwindcss', '@tailwindcss/postcss'],
        },
      },
    },
  },
  server: {
    // Allow CORS for development
    cors: true,
    // Proxy API requests to backend
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://api.nuvemshop.com.br',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/scan/, '/v1'),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            const url = new URL(req.url, 'http://localhost');
            const token = url.searchParams.get('token');
            if (token) {
              proxyReq.setHeader('Authentication', `bearer ${token}`);
              proxyReq.setHeader('User-Agent', 'NuvemMigrationApp (parceiros@nuvemshop.com.br)');
            }
          });
        }
      }
    }
  }
})
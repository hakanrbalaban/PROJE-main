import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5180,
    proxy: {
      '/api': {
        target: 'http://localhost:5176',
        changeOrigin: true,
      },
      '/sitemap.xml': {
        target: 'http://localhost:5176',
        changeOrigin: true,
      },
      '/robots.txt': {
        target: 'http://localhost:5176',
        changeOrigin: true,
      },
    },
  },
})

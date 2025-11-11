import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  server: {
    port: 3000,
    open: '/index.html',
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        landing: './landing.html',
        main: './index.html',
        forecast: './forecast.html'
      }
    }
  }
})

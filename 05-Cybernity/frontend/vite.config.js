import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // base: '/cybernity/',
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://47.116.173.33:8120',
        // target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      'hls.js': 'hls.js/dist/hls.js',
    },
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // base: '/cybernity/',
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://cybernity.brizen.top',
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

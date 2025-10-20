import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: '../backend/pb_public'
  }, 
  plugins: [react()],
  css: {
    postcss: './postcss.config.js',
  }, 
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8090',
        changeOrigin: true,
      }, 
      '/_': {
        target: 'http://localhost:8090',
        changeOrigin: true,
      }
    }
  }
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true
  },
  optimizeDeps: {
    exclude: ['mongodb']
  },
  build: {
    rollupOptions: {
      external: ['mongodb', 'crypto', 'util']
    }
  }
})

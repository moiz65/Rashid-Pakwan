import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://lightsteelblue-skunk-406358.hostingersite.com',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'https://lightsteelblue-skunk-406358.hostingersite.com',
        changeOrigin: true,
      },
    },
  },
})

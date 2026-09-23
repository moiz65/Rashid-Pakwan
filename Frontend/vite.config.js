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
        target: 'https://red-yak-928925.hostingersite.com',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'https://red-yak-928925.hostingersite.com',
        changeOrigin: true,
      },
    },
  },
})

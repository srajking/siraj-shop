import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/shop/' : '/',      // built files live under /shop/ on the shop server
  plugins: [react()],
  server: {
    port: 5180, strictPort: true,                 // busy? stop, never move
    proxy: { '/api': 'http://localhost:4000' },   // npm run api — the shop server
  },
  test: {
    environment: 'jsdom',                         // a browser made of JavaScript, inside Node
    setupFiles: './src/test/setup.js',
  },
}))

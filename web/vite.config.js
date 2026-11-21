import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5180, strictPort: true,                 // busy? stop, never move
    proxy: { '/api': 'http://localhost:4000' },   // npm run api — the shop server
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Base path is set via env var during GitHub Pages builds (e.g. /repo-name/)
  // Falls back to '/' for local dev
  base: process.env.VITE_BASE_PATH ?? '/',
  server: {
    port: 5173,
  },
})

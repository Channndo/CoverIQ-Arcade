import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/CoverIQ-Arcade/',
  plugins: [react()],
  server: {
    port: 5175,
    strictPort: true,
  },
})

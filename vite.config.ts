import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/CoverIQ-Arcade/',
  plugins: [react()],
  build: {
    target: ['es2020', 'safari14', 'chrome87', 'firefox78', 'edge88'],
  },
  server: {
    port: 5175,
    strictPort: true,
  },
})

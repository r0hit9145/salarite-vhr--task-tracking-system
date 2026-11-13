import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // In dev, forward /api calls to FastAPI. No CORS setup needed.
    proxy: { '/api': 'http://127.0.0.1:8000' },
  },
})
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: { port: 3000, strictPort: true },
  test: { environment: 'jsdom', setupFiles: ['./src/test/setupTests.js'], restoreMocks: true, clearMocks: true, maxWorkers: 2, minWorkers: 1 },
})

import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Test-only config — extends/overrides vite.config.js via vitest's `test` key.
// Run: `npm test`
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: true,
    exclude: ['node_modules', 'dist', '.git'],
  },
})

import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright config for end-to-end testing of roupadegala production.
 *
 * Run:  npx playwright test
 * UI:   npx playwright test --ui
 *
 * Test isolation: each test uses a fresh storageState from auth.setup.js
 * (written to tests/.auth/admin.json on the first run).
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false, // serialize to be gentle on prod backend
  forbidOnly: !!process.env.CI,
  retries: 1, // one retry for flaky Railway DNS / cold starts
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: process.env.FRONTEND_URL || 'https://frontendrg-production.up.railway.app',
    extraHTTPHeaders: {},
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.js/,
    },
    {
      name: 'api',
      testMatch: /api\/.*\.spec\.js/,
      dependencies: ['setup'],
    },
    {
      name: 'ui',
      testMatch: /ui\/.*\.spec\.js/,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.auth/admin.json',
      },
    },
  ],
})

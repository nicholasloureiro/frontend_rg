import { test, expect } from '@playwright/test'

/**
 * UI smoke test — verifies the auth state works and key pages are reachable.
 */

test.describe('UI smoke', () => {
  test('dashboard loads when authenticated', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/.*dashboard/)
    // Dashboard should render sidebar or a heading — check for anything admin-only visible
    await page.waitForLoadState('domcontentloaded')
    // Give React a moment to hydrate
    await page.waitForTimeout(2000)
  })

  test('login redirects an unauthed user to /login', async ({ browser, baseURL }) => {
    // Fresh context with NO storage state — clean slate
    const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } })
    const page = await ctx.newPage()
    await page.goto(`${baseURL}/dashboard`)
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
    await ctx.close()
  })
})

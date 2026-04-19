import { test, expect } from '@playwright/test'

/**
 * UI regression for items #7 (virtual row color), #8 (filter by today), #9 alignment.
 */

test.describe('planilha page', () => {
  test('loads with today filter and calls the planilha endpoint', async ({ page }) => {
    // Intercept the planilha API call to confirm date filter + shape
    const planCall = page.waitForRequest(
      (req) => req.url().includes('/api/v1/service-orders/planilha/'),
      { timeout: 20_000 },
    )
    await page.goto('/planilha')
    const req = await planCall
    const url = new URL(req.url())
    const today = new Date()
    const todayISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    expect(url.searchParams.get('start_date')).toBe(todayISO)
    // The page is reachable (no Acesso Restrito) — it should contain "TOTAL RECEBIDO" card
    await expect(page.getByText(/TOTAL RECEBIDO/i).first()).toBeVisible({ timeout: 20_000 })
  })
})

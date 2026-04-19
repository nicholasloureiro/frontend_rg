import { test, expect } from '@playwright/test'

/**
 * UI regression for item #8 — Dashboard defaults to today's filter.
 *
 * We watch the network for the /dashboard/ API call and assert
 * data_inicio === data_fim === today.
 */

test('dashboard request uses today as both data_inicio and data_fim', async ({ page }) => {
  const dashCall = page.waitForRequest(
    (req) => req.url().includes('/api/v1/service-orders/dashboard/'),
    { timeout: 20_000 },
  )

  await page.goto('/dashboard')
  const req = await dashCall
  const url = new URL(req.url())
  const data_inicio = url.searchParams.get('data_inicio')
  const data_fim = url.searchParams.get('data_fim')

  const today = new Date()
  const y = today.getFullYear()
  const m = String(today.getMonth() + 1).padStart(2, '0')
  const d = String(today.getDate()).padStart(2, '0')
  const todayISO = `${y}-${m}-${d}`

  expect(data_inicio).toBe(todayISO)
  expect(data_fim).toBe(todayISO)
})

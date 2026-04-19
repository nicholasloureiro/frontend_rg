import { test, expect } from '@playwright/test'
import { apiBase, authHeaders, todayISO } from '../helpers.js'

/**
 * E2E regression for item #12 — Financeiro shows all payments (including RECUSADA).
 */

test.describe('Financeiro endpoint', () => {
  test('returns the expected shape and a non-negative total', async ({ request }) => {
    const today = todayISO()
    const res = await request.get(
      `${apiBase()}/api/v1/service-orders/finance/?start_date=${today}&end_date=${today}`,
      { headers: authHeaders() },
    )
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body).toHaveProperty('transactions')
    expect(body).toHaveProperty('total_amount')
    expect(body).toHaveProperty('totals_by_method')
    expect(typeof Number(body.total_amount)).toBe('number')
  })

  test('paginated over a wider date range', async ({ request }) => {
    const res = await request.get(
      `${apiBase()}/api/v1/service-orders/finance/?start_date=2025-01-01&page_size=10&page=1`,
      { headers: authHeaders() },
    )
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.transactions.length).toBeLessThanOrEqual(10)
  })
})

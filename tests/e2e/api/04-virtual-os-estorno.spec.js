import { test, expect } from '@playwright/test'
import { apiBase, authHeaders, todayISO } from '../helpers.js'

/**
 * E2E regression for item #5 — Estorno from Financeiro (virtual OS).
 * Also covers item #12 indirectly (payments preserved / shown).
 *
 * We create a virtual OS with an estorno, confirm it shows as NEGATIVE in
 * Financeiro, then delete it to keep prod clean.
 */

test.describe('virtual OS — estorno flow', () => {
  test('create + retrieve + delete virtual estorno', async ({ request }) => {
    const today = todayISO()
    const uniqueName = `E2E ESTORNO ${Date.now()}`
    const amount = 1.23 // a tiny value that won't affect real totals

    // 1. Create virtual OS with estorno
    const create = await request.post(`${apiBase()}/api/v1/service-orders/virtual/`, {
      headers: authHeaders(),
      data: {
        client_name: uniqueName,
        total_value: 0,
        estorno: { amount, forma_pagamento: 'PIX' },
        observations: 'playwright e2e estorno — safe to delete',
      },
    })
    expect(create.status(), await create.text()).toBe(201)
    const { service_order_id } = await create.json()
    expect(service_order_id).toBeTruthy()

    try {
      // 2. Confirm it appears in Financeiro as a NEGATIVE amount
      const fin = await request.get(
        `${apiBase()}/api/v1/service-orders/finance/?start_date=${today}&end_date=${today}&page_size=200`,
        { headers: authHeaders() },
      )
      expect(fin.ok()).toBeTruthy()
      const { transactions } = await fin.json()
      const ours = transactions.find(
        (t) => t.order_id === service_order_id && t.transaction_type === 'estorno',
      )
      expect(ours, 'estorno transaction not found in Financeiro').toBeTruthy()
      expect(Number(ours.amount)).toBeLessThan(0)
      expect(Math.abs(Number(ours.amount))).toBeCloseTo(amount, 2)
    } finally {
      // 3. Clean up — delete the virtual OS so prod stays clean
      const del = await request.delete(
        `${apiBase()}/api/v1/service-orders/virtual/${service_order_id}/`,
        { headers: authHeaders() },
      )
      expect([200, 204, 404]).toContain(del.status())
    }
  })
})

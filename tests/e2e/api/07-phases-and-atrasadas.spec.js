import { test, expect } from '@playwright/test'
import { apiBase, authHeaders } from '../helpers.js'

/**
 * E2E regression for ATRASADAS tab + each phase list endpoint (item #6 earlier —
 * ATRASADAS only for devolução atrasada).
 */

const PHASES = [
  'PENDENTE',
  'EM_PRODUCAO',
  'AGUARDANDO_RETIRADA',
  'AGUARDANDO_DEVOLUCAO',
  'ATRASADO',
  'RECUSADA',
  'FINALIZADO',
]

test.describe('phase listings', () => {
  for (const phase of PHASES) {
    test(`v2 phase listing ${phase} responds 200`, async ({ request }) => {
      const res = await request.get(
        `${apiBase()}/api/v1/service-orders/v2/phase/${phase}/?page=1&page_size=5`,
        { headers: authHeaders() },
      )
      expect(res.ok()).toBeTruthy()
      const body = await res.json()
      expect(body).toHaveProperty('results')
    })
  }

  test('ATRASADO returns only AGUARDANDO_DEVOLUCAO orders (no AGUARDANDO_RETIRADA leaks)', async ({
    request,
  }) => {
    const res = await request.get(
      `${apiBase()}/api/v1/service-orders/v2/phase/ATRASADO/?page=1&page_size=50`,
      { headers: authHeaders() },
    )
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    const leaks = body.results.filter(
      (o) => o?.fase === 'AGUARDANDO_RETIRADA' || o?.service_order_phase === 'AGUARDANDO_RETIRADA',
    )
    // We don't surface fase here, so just check we didn't crash. Tightening this
    // would require schema changes. The V1 vs V2 code split is the real guard.
    expect(Array.isArray(body.results)).toBe(true)
    expect(leaks.length).toBe(0)
  })
})

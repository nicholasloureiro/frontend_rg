import { test, expect } from '@playwright/test'
import { apiBase, authHeaders } from '../helpers.js'

/**
 * E2E regression for item #3 — CPF validation.
 * We expect the backend to reject invalid CPFs at client/register with a clear 400.
 */

test.describe('CPF validation', () => {
  test('rejects invalid CPF (all-same-digits)', async ({ request }) => {
    const res = await request.post(`${apiBase()}/api/v1/clients/register/`, {
      headers: authHeaders(),
      data: {
        nome: 'TEST INVALID CPF',
        cpf: '00000000000',
        telefone: '11999999999',
      },
    })
    expect(res.status()).toBe(400)
    const body = await res.json()
    expect(JSON.stringify(body).toLowerCase()).toContain('cpf')
  })

  test('rejects CPF with wrong check digits', async ({ request }) => {
    const res = await request.post(`${apiBase()}/api/v1/clients/register/`, {
      headers: authHeaders(),
      data: {
        nome: 'TEST WRONG DIGIT',
        cpf: '12345678900', // wrong check digit
        telefone: '11999999999',
      },
    })
    expect(res.status()).toBe(400)
  })
})

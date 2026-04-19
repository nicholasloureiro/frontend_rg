import { test, expect } from '@playwright/test'
import { apiBase, authHeaders } from '../helpers.js'

test.describe('auth', () => {
  test('GET /auth/me/ returns the authenticated admin', async ({ request }) => {
    const res = await request.get(`${apiBase()}/api/v1/auth/me/`, {
      headers: authHeaders(),
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body?.user?.person?.person_type?.type || body?.user?.person_type).toBe('ADMINISTRADOR')
  })

  test('GET without token is 401', async ({ request }) => {
    const res = await request.get(`${apiBase()}/api/v1/auth/me/`)
    expect(res.status()).toBe(401)
  })
})

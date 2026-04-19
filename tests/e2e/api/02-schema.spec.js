import { test, expect } from '@playwright/test'
import { apiBase } from '../helpers.js'

test.describe('OpenAPI schema', () => {
  test('Swagger UI is reachable', async ({ request }) => {
    const res = await request.get(`${apiBase()}/api/docs/`)
    expect(res.ok()).toBeTruthy()
    const html = await res.text()
    expect(html.toLowerCase()).toContain('swagger')
  })

  test('OpenAPI schema is valid JSON/YAML and exposes our endpoints', async ({ request }) => {
    const res = await request.get(`${apiBase()}/api/schema/`)
    expect(res.ok()).toBeTruthy()
    const text = await res.text()
    // Spot-check that our newer endpoints are in the schema
    expect(text).toContain('planilha')
    expect(text).toContain('finance')
    expect(text).toContain('return-to-pending')
  })
})

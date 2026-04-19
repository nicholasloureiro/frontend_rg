import { test as setup, expect } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

const BACKEND_URL = process.env.BACKEND_URL || 'https://backendrg-production.up.railway.app'
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://frontendrg-production.up.railway.app'
const USERNAME = process.env.TEST_USERNAME || '10484917650'
const PASSWORD = process.env.TEST_PASSWORD || 'degalaroupa@2025'

const authDir = path.resolve('tests/e2e/.auth')
if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true })

setup('authenticate admin', async ({ request, browser }) => {
  // 1. Get tokens via the backend login endpoint
  const loginRes = await request.post(`${BACKEND_URL}/api/v1/auth/login/`, {
    data: { username: USERNAME, password: PASSWORD },
  })
  expect(loginRes.ok()).toBeTruthy()
  const { access, refresh } = await loginRes.json()
  expect(access).toBeTruthy()

  // 2. Fetch the full user object (nested person.person_type.type) via /auth/me/.
  // The frontend sidebar/Financeiro checks `user.person.person_type.type` — which
  // is the shape returned by /me/, NOT the flat shape from /login/.
  const meRes = await request.get(`${BACKEND_URL}/api/v1/auth/me/`, {
    headers: { Authorization: `Bearer ${access}` },
  })
  expect(meRes.ok()).toBeTruthy()
  const meBody = await meRes.json()
  const user = meBody.user || meBody
  expect(user?.person?.person_type?.type).toBe('ADMINISTRADOR')

  // 3. Save tokens for API spec consumption
  fs.writeFileSync(
    path.join(authDir, 'tokens.json'),
    JSON.stringify({ access, refresh, user, backend: BACKEND_URL }, null, 2),
  )

  // 3. Build a browser storageState with localStorage tokens so UI specs start logged in.
  // The frontend reads access_token / refresh_token / user from localStorage.
  const context = await browser.newContext()
  const page = await context.newPage()
  // First land on the origin with a lightweight page so we can write to its localStorage.
  // /login is always reachable without auth.
  await page.goto(FRONTEND_URL + '/login', { waitUntil: 'domcontentloaded' })
  await page.evaluate(
    ({ acc, ref, u }) => {
      // Frontend uses camelCase keys — see src/store/slices/userSlice.js
      window.localStorage.setItem('accessToken', acc)
      window.localStorage.setItem('refreshToken', ref)
      window.localStorage.setItem('userData', JSON.stringify(u))
    },
    { acc: access, ref: refresh, u: user },
  )
  // Verify the tokens were written and the app treats us as authenticated.
  await page.goto(FRONTEND_URL + '/dashboard', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(1500)
  await context.storageState({ path: path.join(authDir, 'admin.json') })
  await context.close()
})

import { test, expect } from '@playwright/test'

/**
 * UI navigation — each sidebar destination should load its route
 * with no unhandled errors.
 */

const ROUTES = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/triagem', label: 'Triagem' },
  { path: '/ordens', label: 'OS' },
  { path: '/eventos', label: 'Eventos' },
  { path: '/clientes', label: 'Clientes' },
  { path: '/funcionarios', label: 'Funcionarios' },
  { path: '/produtos', label: 'Produtos' },
  { path: '/planilha', label: 'Planilha' },
  { path: '/financeiro', label: 'Financeiro' },
]

test.describe('sidebar navigation (admin)', () => {
  for (const { path, label } of ROUTES) {
    test(`route ${path} loads without client-side error`, async ({ page }) => {
      const errors = []
      page.on('pageerror', (err) => errors.push(err.message))
      await page.goto(path)
      await page.waitForLoadState('domcontentloaded')
      await page.waitForTimeout(1500)
      // Should stay on the target route (not get redirected to /login)
      expect(page.url()).toContain(path)
      // No uncaught JS errors
      expect(errors, `Client-side errors on ${label}: ${errors.join('\n')}`).toEqual([])
    })
  }
})

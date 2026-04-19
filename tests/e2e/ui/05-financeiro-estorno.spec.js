import { test, expect } from '@playwright/test'

/**
 * UI regression for item #5 — "Estorno" option visible in Financeiro's
 * Lançar Pagamento Manual modal.
 */

test('Financeiro modal exposes Estorno as a payment type', async ({ page }) => {
  await page.goto('/financeiro')
  await page.waitForLoadState('domcontentloaded')

  // Open the manual payment modal
  const launchBtn = page.getByRole('button', { name: /Lançar Pagamento Manual/i })
  await expect(launchBtn).toBeVisible({ timeout: 15_000 })
  await launchBtn.click()

  // Find the Tipo de Pagamento dropdown and verify Estorno is one of the options.
  // The CustomSelect renders options after a click; we search for the label text.
  const tipoLabel = page.getByText(/Tipo de Pagamento/i).first()
  await expect(tipoLabel).toBeVisible()

  // Click the select near the label
  const select = tipoLabel.locator('..').locator('xpath=following-sibling::*[1]').first()
  await select.click({ trial: false }).catch(() => {})

  // Expect the Estorno option to be present in the DOM (visible or in an open dropdown).
  await expect(page.getByText(/Estorno/, { exact: false }).first()).toBeVisible({
    timeout: 5_000,
  })
})

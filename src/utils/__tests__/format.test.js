import { describe, it, expect } from 'vitest'
import { formatCurrency } from '../format'

describe('formatCurrency', () => {
  it('formats a positive number as BRL', () => {
    // NBSP between R$ and number comes from pt-BR locale
    expect(formatCurrency(270).replace(/\s/g, ' ')).toBe('R$ 270,00')
  })

  it('formats zero', () => {
    expect(formatCurrency(0).replace(/\s/g, ' ')).toBe('R$ 0,00')
  })

  it('handles decimals', () => {
    expect(formatCurrency(1234.5).replace(/\s/g, ' ')).toBe('R$ 1.234,50')
  })

  it('returns R$ 0,00 for null', () => {
    expect(formatCurrency(null)).toBe('R$ 0,00')
  })

  it('returns R$ 0,00 for undefined', () => {
    expect(formatCurrency(undefined)).toBe('R$ 0,00')
  })

  it('returns R$ 0,00 for string input (type-guarded)', () => {
    expect(formatCurrency('270')).toBe('R$ 0,00')
  })
})

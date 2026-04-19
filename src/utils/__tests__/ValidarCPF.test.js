import { describe, it, expect } from 'vitest'
import validarCPF from '../ValidarCPF'

describe('validarCPF', () => {
  describe('valid CPFs', () => {
    it.each([
      '529.982.247-25',
      '52998224725',
      '111.444.777-35',
      '123.456.789-09',
    ])('accepts %s', (cpf) => {
      expect(validarCPF(cpf)).toBe(true)
    })
  })

  describe('invalid CPFs', () => {
    it.each([
      '000.000.000-00',
      '111.111.111-11',
      '999.999.999-99',
    ])('rejects all-same-digit pattern %s', (cpf) => {
      expect(validarCPF(cpf)).toBe(false)
    })

    it.each([
      '123.456.789-00',  // wrong check digits
      '529.982.247-24',  // off by one
    ])('rejects wrong check digits %s', (cpf) => {
      expect(validarCPF(cpf)).toBe(false)
    })

    it.each([
      '',
      '123',
      '12345',
      '1234567890',    // 10 digits
      '123456789012',  // 12 digits
    ])('rejects wrong length %s', (cpf) => {
      expect(validarCPF(cpf)).toBe(false)
    })
  })

  describe('formatting tolerance', () => {
    it('accepts formatted and unformatted CPFs interchangeably', () => {
      expect(validarCPF('52998224725')).toBe(true)
      expect(validarCPF('529.982.247-25')).toBe(true)
      expect(validarCPF('529 982 247 25')).toBe(true)
    })
  })
})

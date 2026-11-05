import { describe, it, expect } from 'vitest'
import { orderHasPayment } from '../orderHasPayment'

describe('orderHasPayment', () => {
  it.each([['0.00'], [0], [null], [undefined], [''], ['abc'], ['-50.00']])(
    'é falso quando advance_payment é %s',
    (advance_payment) => {
      expect(orderHasPayment({ advance_payment })).toBe(false)
    },
  )

  it.each([['100.00'], [100], ['0.01']])(
    'é verdadeiro quando advance_payment é %s',
    (advance_payment) => {
      expect(orderHasPayment({ advance_payment })).toBe(true)
    },
  )
})

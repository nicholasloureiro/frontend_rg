// advance_payment é o valor que o card da OS mostra como "Pago"; a API pode enviá-lo como string ("0.00").
export function orderHasPayment(order) {
  return Number(order?.advance_payment) > 0;
}

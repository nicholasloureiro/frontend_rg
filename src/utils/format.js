export function formatCurrency(value) {
  if (value === null || value === undefined || typeof value !== 'number') {
    return 'R$ 0,00';
  }
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
} 
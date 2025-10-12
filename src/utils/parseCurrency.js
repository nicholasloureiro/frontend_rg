export function parseCurrency(value) {
  if (!value) return 0;
  // Remove tudo que não for número ou vírgula
  let clean = value.replace(/[^\d,]/g, '').replace(/\./g, '');
  // Troca vírgula por ponto para parseFloat
  clean = clean.replace(',', '.');
  return parseFloat(clean) || 0;
} 
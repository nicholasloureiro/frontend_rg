const FERIADOS_FIXOS = [
  '01-01', // Ano Novo
  '04-18', // Paixão de Cristo
  '04-21', // Tiradentes
  '05-01', // Dia do Trabalho
  '06-19', // Corpus Christi
  '08-15', // Nsa. da  Abadia
  '08-31', // Niver udi
  '09-07', // Independência
  '10-12', // Nossa Senhora Aparecida
  '11-02', // Finados
  '11-15', // Proclamação da República
  '11-20', // Consciencia negra
  '12-25', // Natal
];

function isHoliday(date) {
  const mmdd = date.toISOString().slice(5, 10);
  return FERIADOS_FIXOS.includes(mmdd);
}

export function addBusinessDays(startDate, businessDays) {
  let date = new Date(startDate);
  let added = 0;
  while (added < businessDays) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6 && !isHoliday(date)) {
      added++;
    }
  }
  return date;
} 
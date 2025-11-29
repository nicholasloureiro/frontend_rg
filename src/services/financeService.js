import api from './api';

/**
 * Serviço financeiro - funções para consumo pelo frontend.
 * Observação: os endpoints abaixo são SUGESTÕES para o backend; ajuste conforme sua API.
 */

/**
 * Busca resumo das vendas de um dia, agrupadas por forma de pagamento.
 * Endpoint sugerido: GET /api/v1/finance/sales-summary/daily?date=YYYY-MM-DD
 * Retorno esperado (exemplo):
 * {
 *   date: "2025-11-20",
 *   totals: { cash: 1000.5, pix: 500, credit: 300, debit: 120, other: 0 },
 *   transactions_count: 42,
 *   total_amount: 1920.5
 * }
 */
export async function getDailySalesSummary(date) {
  const resp = await api.get(`/api/v1/finance/sales-summary/daily`, { params: { date } });
  return resp.data;
}

/**
 * Busca resumo mensal (por mês e ano).
 * Endpoint sugerido: GET /api/v1/finance/sales-summary/monthly?month=MM&year=YYYY
 * Retorno similar ao diário, com agregações por dia opcionalmente.
 */
export async function getMonthlySalesSummary(month, year) {
  const resp = await api.get(`/api/v1/finance/sales-summary/monthly`, { params: { month, year } });
  return resp.data;
}

/**
 * Ação de "fechar caixa" — registra um fechamento de caixa no backend.
 * Endpoint sugerido: POST /api/v1/finance/close-cash
 * Payload sugerido:
 * {
 *   date: "2025-11-20",            // data do fechamento (opcional se mensal)
 *   period: "daily" | "monthly",
 *   month: "2025-11" | null,
 *   cashier_id: 123,
 *   totals: { cash: 1000, pix: 500, credit: 300, debit: 120, other: 0 },
 *   transactions_count: 42,
 *   closed_by: 45
 * }
 */
export async function postCloseCash(payload) {
  const resp = await api.post(`/api/v1/finance/close-cash`, payload);
  return resp.data;
}

export default {
  getDailySalesSummary,
  getMonthlySalesSummary,
  postCloseCash,
};






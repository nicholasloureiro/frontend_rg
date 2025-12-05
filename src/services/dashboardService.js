import api from './api';

export const dashboardService = {
  /**
   * Busca todos os dados do dashboard principal
   * @param {string} periodo - Período para filtrar os dados (dia, semana, mes, ano, custom)
   * @param {string} customDate - Data customizada (formato YYYY-MM-DD)
   * @param {string} customType - Tipo de período customizado (month, year)
   * @param {number|string} atendente - ID do atendente para filtrar
   * @param {string} tipoCliente - Tipo de cliente para filtrar
   * @param {string} formaPagamento - Forma de pagamento para filtrar
   * @param {string} canalOrigem - Canal de origem para filtrar
   * @returns {Promise<Object>} Dados completos do dashboard
   */
  async getDashboardData(periodo = 'mes', customDate = null, customType = null, atendente = null, tipoCliente = null, formaPagamento = null, canalOrigem = null, dataInicio = null, dataFim = null) {
    try {
      let url = `/api/v1/service-orders/dashboard/?periodo=${periodo}`;
      
      if (customDate) {
        url += `&data_customizada=${customDate}`;
      }
      
      if (customType) {
        url += `&tipo_customizado=${customType}`;
      }

      if (atendente) {
        url += `&atendente_id=${atendente}`;
      }

      if (tipoCliente) {
        url += `&tipo_cliente=${tipoCliente}`;
      }

      if (formaPagamento) {
        url += `&forma_pagamento=${formaPagamento}`;
      }

      if (canalOrigem) {
        url += `&canal_origem=${canalOrigem}`;
      }

      if (dataInicio) {
        url += `&data_inicio=${dataInicio}`;
      }

      if (dataFim) {
        url += `&data_fim=${dataFim}`;
      }

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      throw error;
    }
  },

  /**
   * Busca métricas de atendentes
   * @param {string} periodo - Período para filtrar os dados (dia, semana, mes)
   * @returns {Promise<Object>} Dados de métricas dos atendentes
   */
  async getAttendantMetrics(periodo = 'mes') {
    try {
      let url = `/api/v1/service-orders/attendant-metrics/`;
      
      if (periodo) {
        url += `?periodo=${periodo}`;
      }

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar métricas de atendentes:', error);
      throw error;
    }
  }
};

export default dashboardService; 
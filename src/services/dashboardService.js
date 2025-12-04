import api from './api';

export const dashboardService = {
  /**
   * Busca todos os dados do dashboard principal
   * @param {string} periodo - Período para filtrar os dados (dia, semana, mes, ano, custom)
   * @param {string} customDate - Data customizada (formato YYYY-MM-DD)
   * @param {string} customType - Tipo de período customizado (month, year)
   * @returns {Promise<Object>} Dados completos do dashboard
   */
  async getDashboardData(periodo = 'mes', customDate = null, customType = null) {
    try {
      let url = `/api/v1/service-orders/dashboard/?periodo=${periodo}`;
      
      if (customDate) {
        url += `&data_customizada=${customDate}`;
      }
      
      if (customType) {
        url += `&tipo_customizado=${customType}`;
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
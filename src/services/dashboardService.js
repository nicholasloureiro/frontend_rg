import api from './api';

export const dashboardService = {
  /**
   * Busca todos os dados do dashboard principal
   * @returns {Promise<Object>} Dados completos do dashboard
   */
  async getDashboardData() {
    try {
      const response = await api.get('/api/v1/products/dashboard/');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      throw error;
    }
  }
};

export default dashboardService; 
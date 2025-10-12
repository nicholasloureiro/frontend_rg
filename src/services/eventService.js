import api from './api';

const eventService = {
  // Listar eventos em aberto
   listarEventosAbertos: async () => {
    try {
      const response = await api.get('/api/v1/events/list-with-status/');
      return response.data;
    } catch (error) {
      console.error('Erro ao listar eventos abertos:', error);
      throw error;
    }
  },

  // Buscar evento por ID
  buscarEventoPorId: async (id) => {
    try {
      const response = await api.get(`/api/v1/events/${id}/detail/`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar evento por ID:', error);
      throw error;
    }
  },

  // Criar novo evento
  criarEvento: async (eventoData) => {
    try {
      const response = await api.post('/api/v1/events/create/', eventoData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      throw error;
    }
  },

  // Atualizar evento
  atualizarEvento: async (id, eventoData) => {
    try {
      const response = await api.put(`/api/v1/events/${id}/update/`, eventoData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      throw error;
    }
  },

  // Deletar evento
  deletarEvento: async (id) => {
    try {
      const response = await api.delete(`/api/v1/events/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Erro ao deletar evento:', error);
      throw error;
    }
  }
};

export default eventService;

import api from './api';
import eventosMock from '../mock/eventos';
import ordensServicoMock from '../mock/ordensServico';

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
    // Simula um delay da API
    await new Promise(resolve => setTimeout(resolve, 800));
    const evento = eventosMock.find(e => e.id === parseInt(id));
    if (!evento) {
      throw new Error('Evento não encontrado');
    }
    
    // Adiciona as ordens de serviço completas ao evento
    const ordensCompletas = evento.ordens_servico.map(ordemId => 
      ordensServicoMock.find(ordem => ordem.id === ordemId)
    ).filter(ordem => ordem); // Remove undefined
    
    return {
      ...evento,
      ordens_servico_detalhadas: ordensCompletas
    };
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
      const response = await api.put(`/api/v1/events/${id}/`, eventoData);
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

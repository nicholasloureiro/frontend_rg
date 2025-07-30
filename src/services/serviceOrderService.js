import api from './api';

export const serviceOrderService = {
    // Buscar ordens de serviço por fase
    getServiceOrdersByPhase: async (phaseName) => {
        try {
            const response = await api.get(`/api/v1/service-orders/phase/${phaseName}/`);
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar ordens de serviço:', error);
            throw error;
        }
    },

    // Buscar uma ordem de serviço específica por ID
    getServiceOrderById: async (id) => {
        try {
            const response = await api.get(`/api/v1/service-orders/${id}/`);
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar ordem de serviço:', error);
            throw error;
        }
    },

    // Criar nova ordem de serviço
    createServiceOrder: async (orderData) => {
        try {
            const response = await api.post('/api/v1/service-orders/', orderData);
            return response.data;
        } catch (error) {
            console.error('Erro ao criar ordem de serviço:', error);
            throw error;
        }
    },

    // Atualizar ordem de serviço
    updateServiceOrder: async (id, orderData) => {
        try {
            const response = await api.put(`/api/v1/service-orders/${id}/update/`, orderData);
            return response.data;
        } catch (error) {
            console.error('Erro ao atualizar ordem de serviço:', error);
            throw error;
        }
    },

    // Deletar ordem de serviço
    deleteServiceOrder: async (id) => {
        try {
            const response = await api.delete(`/api/v1/service-orders/${id}/`);
            return response.data;
        } catch (error) {
            console.error('Erro ao deletar ordem de serviço:', error);
            throw error;
        }
    }
}; 
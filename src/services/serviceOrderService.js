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
    },

    // Finalizar ordem de serviço (marcar como devolvida)
    finishServiceOrder: async (id) => {
        try {
            const response = await api.post(`/api/v1/service-orders/${id}/mark-paid/`);
            return response.data;
        } catch (error) {
            console.error('Erro ao finalizar ordem de serviço:', error);
            throw error;
        }
    },

    // Marcar ordem de serviço como retirada
    pickUpServiceOrder: async (id) => {
        try {
            const response = await api.post(`/api/v1/service-orders/${id}/mark-retrieved/`);
            return response.data;
        } catch (error) {
            console.error('Erro ao marcar ordem como retirada:', error);
            throw error;
        }
    },

    // Cancelar ordem de serviço
    refuseServiceOrder: async (id, justification) => {
        try {
            const response = await api.post(`/api/v1/service-orders/${id}/refuse/`, {
                justification_refusal: justification
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao cancelar ordem de serviço:', error);
            throw error;
        }
    },

    // Buscar ordens de serviço com filtros
    searchServiceOrders: async (phase, filters = {}) => {
        try {
            const params = new URLSearchParams();
            
            // Adiciona filtros se fornecidos
            if (filters.search) {
                params.append('search', filters.search);
            }
            if (filters.initial_date) {
                params.append('initial_date', filters.initial_date);
            }
            if (filters.end_date) {
                params.append('end_date', filters.end_date);
            }

            const queryString = params.toString();
            const url = `/api/v1/service-orders/phase/${phase}/${queryString ? `?${queryString}` : ''}`;
            
            const response = await api.get(url);
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar ordens de serviço:', error);
            throw error;
        }
    }
}; 
import api from './api';

export const serviceOrderService = {
    // Buscar ordens de serviço por fase
    getServiceOrdersByPhase: async (phaseName) => {
        try {
            const response = await api.get(`/api/v1/service-orders/v2/phase/${phaseName}/?page_size=2   `);
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
    pickUpServiceOrder: async (id, paymentData = null) => {
        try {
            const requestData = {};
            
            // Se há dados de pagamento, inclui no request
            if (paymentData && paymentData.receiveRemainingPayment) {
                requestData.receive_remaining_payment = true;
                requestData.remaining_amount = paymentData.remainingAmount;
                
                // Enviar array de formas de pagamento
                requestData.payment_forms = paymentData.paymentForms.map(form => ({
                    amount: form.amount,
                    forma_pagamento: form.forma_pagamento
                }));
            }
            
            const response = await api.post(`/api/v1/service-orders/${id}/mark-retrieved/`, requestData);
            return response.data;
        } catch (error) {
            console.error('Erro ao marcar ordem como retirada:', error);
            throw error;
        }
    },

    // Cancelar ordem de serviço
    refuseServiceOrder: async (id, justification, justificationReasonId) => {
        try {
            const requestData = {
                justification_refusal: justification
            };
            
            if (justificationReasonId) {
                requestData.justification_reason_id = justificationReasonId;
            }
            
            const response = await api.post(`/api/v1/service-orders/${id}/refuse/`, requestData);
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
            // paginação
            if (filters.page) {
                params.append('page', filters.page);
            }
            if (filters.page_size) {
                params.append('page_size', filters.page_size);
            }
            // ordenação
            if (filters.ordering) {
                params.append('ordering', filters.ordering);
            }
            // filtro de data
            if (filters.filter_date) {
                params.append('filter_date', filters.filter_date);
            }

            const queryString = params.toString();
            const url = `/api/v1/service-orders/v2/phase/${phase}/${queryString ? `?${queryString}` : ''}`;

            const response = await api.get(url);
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar ordens de serviço:', error);
            throw error;
        }
    },

    // Buscar ordens de serviço por cliente (locatário)
    getServiceOrdersByRenter: async (renterId) => {
        try {
            const response = await api.get(`/api/v1/service-orders/renter/${renterId}/`);
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar ordens de serviço do cliente:', error);
            throw error;
        }
    },

    // Buscar motivos de recusa
    getRefusalReasons: async () => {
        try {
            const response = await api.get('/api/v1/service-orders/refusal-reasons/');
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar motivos de recusa:', error);
            throw error;
        }
    },

    // Marcar ordem como produzida (pronta)
    markAsReady: async (id) => {
        try {
            const response = await api.post(`/api/v1/service-orders/${id}/mark-ready/`);
            return response.data;
        } catch (error) {
            console.error('Erro ao marcar ordem como produzida:', error);
            throw error;
        }
    },

    // Retornar ordem recusada para pendente
    returnToPending: async (id) => {
        try {
            const response = await api.post(`/api/v1/service-orders/${id}/return-to-pending/`);
            return response.data;
        } catch (error) {
            console.error('Erro ao retornar ordem para pendente:', error);
            throw error;
        }
    },

    // Deletar lançamento (ordem de serviço virtual)
    deleteVirtualServiceOrder: async (id) => {
        try {
            const response = await api.delete(`/api/v1/service-orders/virtual/${id}/`);
            return response.data;
        } catch (error) {
            console.error('Erro ao deletar lançamento:', error);
            throw error;
        }
    }
}; 
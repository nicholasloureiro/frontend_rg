import api from './api';

export const clientService = {
    // Buscar cliente por CPF
    buscarPorCPF: async (cpf) => {
        try {
            const response = await api.get(`/api/v1/clients/search/?cpf=${cpf}`);
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar cliente por CPF:', error);
            throw error;
        }
    },

    // Buscar cliente por ID
    buscarPorId: async (id) => {
        try {
            const response = await api.get(`/api/v1/clients/${id}/`);
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar cliente por ID:', error);
            throw error;
        }
    },

    // Listar todos os clientes com paginação e busca
    listarTodos: async (params = {}) => {
        try {
            const queryParams = new URLSearchParams();
            if (params.page) queryParams.append('page', params.page);
            if (params.page_size) queryParams.append('page_size', params.page_size);
            if (params.search) queryParams.append('search', params.search);
            
            const queryString = queryParams.toString();
            const url = `/api/v1/clients/list/${queryString ? `?${queryString}` : ''}`;
            const response = await api.get(url);
            return response.data;
        } catch (error) {
            console.error('Erro ao listar clientes:', error);
            throw error.response?.data || error;
        }
    },

    // Criar novo cliente
    criar: async (dadosCliente) => {
        try {
            const response = await api.post('/api/v1/clients/register/', dadosCliente);
            return response.data;
        } catch (error) {
            console.error('Erro ao criar cliente:', error);
            throw error;
        }
    },

    // Atualizar cliente (usando o mesmo endpoint de registro)
    atualizar: async (id, dadosCliente) => {
        try {
            const response = await api.post('/api/v1/clients/register/', dadosCliente);
            return response.data;
        } catch (error) {
            console.error('Erro ao atualizar cliente:', error);
            throw error;
        }
    },

    // Excluir cliente (admin only)
    excluir: async (personId) => {
        try {
            const response = await api.delete(`/api/v1/clients/${personId}/delete/`);
            return response.data;
        } catch (error) {
            console.error('Erro ao excluir cliente:', error);
            throw error;
        }
    },

    // Atualizar CPF do cliente (admin only)
    atualizarCPF: async (personId, cpf) => {
        try {
            const response = await api.put(`/api/v1/clients/${personId}/update-cpf/`, { cpf });
            return response.data;
        } catch (error) {
            console.error('Erro ao atualizar CPF:', error);
            throw error;
        }
    },
};
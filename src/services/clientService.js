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

    // Listar todos os clientes
    listarTodos: async () => {
        try {
            const response = await api.get('/api/v1/clients/list/');
            console.log(response.data);
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
    }
}; 
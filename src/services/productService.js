import api from './api';

export const productService = {
    // Buscar cores
    buscarCores: async () => {
        try {
            const response = await api.get('/api/v1/colors/');
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar cores:', error);
            throw error;
        }
    },

    // Buscar marcas
    buscarMarcas: async () => {
        try {
            const response = await api.get('/api/v1/brands/');
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar marcas:', error);
            throw error;
        }
    },

    // Buscar produtos com paginação e filtros
    buscarProdutos: async (page = 1, search = '', tipo = '', marca = '') => {
        try {
            const params = new URLSearchParams();
            
            if (page > 1) {
                params.append('page', page);
            }
            
            if (search) {
                params.append('search', search);
            }
            
            if (tipo) {
                params.append('tipo', tipo);
            }
            
            if (marca) {
                params.append('marca', marca);
            }

            const response = await api.get(`/api/v1/products/?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
            throw error;
        }
    },

    // Importar produtos via arquivo
    importarProdutos: async (formData) => {
        try {
            const response = await api.post('/api/v1/products/stock/update/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao importar produtos:', error);
            throw error;
        }
    }
}; 
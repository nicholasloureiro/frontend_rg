import api from './api';

/**
 * Service para operações relacionadas a Marcas (Brands)
 */
const brandService = {
  /**
   * Lista marcas com paginação
   * @param {number} pageIndex - Índice da página (começa em 0)
   * @param {number} pageSize - Tamanho da página
   * @returns {Promise<{count: number, next: string|null, previous: string|null, results: Array<{id: number, description: string}>}>}
   */
  async getBrands(pageIndex = 0, pageSize = 10, search = '') {
    const page = pageIndex + 1; // API espera página começando em 1
    let url = `/api/v1/brands/?page=${page}&page_size=${pageSize}`;
    if (search && search.trim()) {
      url += `&search=${encodeURIComponent(search.trim())}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Cria uma nova marca
   * @param {string} description - Descrição da marca
   * @returns {Promise<{id: number, description: string}>}
   */
  async createBrand(description) {
    const response = await api.post('/api/v1/brands/', { description });
    return response.data;
  },

  /**
   * Atualiza uma marca existente
   * @param {number} id - ID da marca
   * @param {string} description - Nova descrição da marca
   * @returns {Promise<{id: number, description: string}>}
   */
  async updateBrand(id, description) {
    const response = await api.patch(`/api/v1/brands/${id}/`, { description });
    return response.data;
  },

  /**
   * Deleta uma marca
   * @param {number} id - ID da marca
   * @returns {Promise<void>}
   */
  async deleteBrand(id) {
    await api.delete(`/api/v1/brands/${id}/`);
  },
};

export default brandService;

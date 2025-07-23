// src/services/authService.js
import api from './api';

// Função para fazer login
export const login = async (username, password) => {
  try {
    const response = await api.post('/api/v1/auth/login/', {
      username,
      password
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Função para buscar informações do usuário logado
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/api/v1/auth/me/');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Função para renovar tokens
export const refreshTokens = async (refreshToken) => {
  try {
    const response = await api.post('/api/v1/auth/refresh/', {
      refresh: refreshToken
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Função para fazer logout
export const logout = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      await api.post('/api/v1/auth/logout/', {
        refresh: refreshToken
      });
    }
  } catch (error) {
    // Mesmo se falhar, continua com o logout local
    console.error('Erro ao fazer logout no servidor:', error);
  }
};

// Função para atualizar informações do usuário
export const updateProfile = async (formData) => {
  try {
    const response = await api.put('/api/v1/auth/me/update/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}; 

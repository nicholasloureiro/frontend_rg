import axios from 'axios';
import { store } from '../store';
import { updateTokens, logout } from '../store/slices/userSlice';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Criando uma instância do axios com configuração base
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag para evitar múltiplas tentativas de refresh simultâneas
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Se o erro for 401 (não autorizado) e não for uma tentativa de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Se já está tentando renovar, adiciona à fila
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        // Se não há refresh token, faz logout
        store.dispatch(logout());
        return Promise.reject(error);
      }

      try {
        // Tenta renovar o token
        const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh/`, {
          refresh: refreshToken
        });

        const { access, refresh } = response.data;
        
        // Atualiza os tokens no store e localStorage
        store.dispatch(updateTokens({ access, refresh }));
        
        // Processa a fila de requisições pendentes
        processQueue(null, access);
        
        // Atualiza o header da requisição original
        originalRequest.headers.Authorization = `Bearer ${access}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        // Se falhar ao renovar, faz logout
        processQueue(refreshError, null);
        store.dispatch(logout());
        
        // Redireciona para login se não estiver na página de login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api; 
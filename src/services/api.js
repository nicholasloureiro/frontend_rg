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
    'ngrok-skip-browser-warning': 'true',
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
    // Adiciona header para pular aviso do ngrok
    config.headers['ngrok-skip-browser-warning'] = 'true';
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
    const errorStatus = error.response?.status;
    const errorMessage = error.response?.data?.message || error.message;

    console.log('🔍 [API INTERCEPTOR] Erro capturado:', {
      status: errorStatus,
      message: errorMessage,
      url: originalRequest.url,
      method: originalRequest.method,
      isRetry: originalRequest._retry,
      timestamp: new Date().toISOString()
    });

    // Se o erro for 401 (não autorizado) e não for uma tentativa de refresh
    if (errorStatus === 401 && !originalRequest._retry) {
      console.log('🚨 [LOGOUT DEBUG] Erro 401 detectado - iniciando processo de refresh');
      
      if (isRefreshing) {
        console.log('⏳ [LOGOUT DEBUG] Refresh já em andamento - adicionando à fila');
        // Se já está tentando renovar, adiciona à fila
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          console.log('✅ [LOGOUT DEBUG] Token renovado da fila - reprocessando requisição');
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          console.log('❌ [LOGOUT DEBUG] Erro ao processar da fila:', err);
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      
      console.log('🔑 [LOGOUT DEBUG] Verificando refresh token:', {
        hasRefreshToken: !!refreshToken,
        refreshTokenLength: refreshToken?.length || 0
      });
      
      if (!refreshToken) {
        console.log('❌ [LOGOUT DEBUG] Sem refresh token - fazendo logout imediato');
        // Se não há refresh token, faz logout
        store.dispatch(logout());
        return Promise.reject(error);
      }

      try {
        console.log('🔄 [LOGOUT DEBUG] Tentando renovar token...');
        // Tenta renovar o token
        const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh/`, {
          refresh: refreshToken
        });

        const { access, refresh } = response.data;
        
        console.log('✅ [LOGOUT DEBUG] Token renovado com sucesso:', {
          hasNewAccess: !!access,
          hasNewRefresh: !!refresh,
          accessLength: access?.length || 0,
          refreshLength: refresh?.length || 0
        });
        
        // Atualiza os tokens no store e localStorage
        store.dispatch(updateTokens({ access, refresh }));
        
        // Processa a fila de requisições pendentes
        processQueue(null, access);
        
        // Atualiza o header da requisição original
        originalRequest.headers.Authorization = `Bearer ${access}`;
        
        console.log('🔄 [LOGOUT DEBUG] Reprocessando requisição original com novo token');
        return api(originalRequest);
      } catch (refreshError) {
        console.log('❌ [LOGOUT DEBUG] Falha ao renovar token - fazendo logout:', {
          status: refreshError.response?.status,
          message: refreshError.response?.data?.message || refreshError.message,
          data: refreshError.response?.data
        });
        
        // Se falhar ao renovar, faz logout
        processQueue(refreshError, null);
        store.dispatch(logout());
        
        // Redireciona para login se não estiver na página de login
        if (window.location.pathname !== '/login') {
          console.log('🔄 [LOGOUT DEBUG] Redirecionando para login');
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
        console.log('🏁 [LOGOUT DEBUG] Processo de refresh finalizado');
      }
    }

    console.log('⚠️ [API INTERCEPTOR] Erro não tratado pelo interceptor:', errorStatus);
    return Promise.reject(error);
  }
);

export default api; 
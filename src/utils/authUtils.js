import { store } from '../store';
import { logout } from '../store/slices/userSlice';

// Função para fazer logout automático
export const handleLogout = (navigate = null) => {
  console.log('🚪 [LOGOUT UTILS] Função handleLogout chamada:', {
    timestamp: new Date().toISOString(),
    hasNavigate: !!navigate,
    currentPath: window.location?.pathname,
    stackTrace: new Error().stack
  });
  
  store.dispatch(logout());
  
  // Se uma função de navegação foi fornecida, use-a (React Router)
  if (navigate && typeof navigate === 'function') {
    console.log('🔄 [LOGOUT UTILS] Redirecionando via navigate function');
    navigate('/login');
  } else {
    // Fallback para window.location.href se não houver router disponível
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      console.log('🔄 [LOGOUT UTILS] Redirecionando via window.location.href');
      window.location.href = '/login';
    }
  }
};

// Função para verificar se os tokens existem
export const hasTokens = () => {
  return !!(localStorage.getItem('accessToken') && localStorage.getItem('refreshToken'));
};

// Função para verificar se o access token existe
export const hasToken = () => {
  return !!localStorage.getItem('accessToken');
};

// Função para obter o access token
export const getAccessToken = () => {
  return localStorage.getItem('accessToken');
};

// Função para obter o refresh token
export const getRefreshToken = () => {
  return localStorage.getItem('refreshToken');
};

// Função para obter o token (mantida para compatibilidade)
export const getToken = () => {
  return localStorage.getItem('accessToken');
};

// Função para limpar dados de autenticação
export const clearAuthData = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  store.dispatch(logout());
}; 
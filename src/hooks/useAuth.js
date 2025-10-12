import { useSelector, useDispatch } from 'react-redux';
import { loginSuccess, logout, updateUser, updateTokens, setLoading } from '../store/slices/userSlice';
import { getCurrentUser as getCurrentUserService } from '../services/authService';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, accessToken, refreshToken, isAuthenticated, isLoading } = useSelector((state) => state.user);
  

  const login = (userData, access, refresh) => {
    dispatch(loginSuccess({ user: userData, access, refresh }));
  };

  const logoutUser = () => {
    dispatch(logout());
  };

  const updateUserData = (userData) => {
    dispatch(updateUser(userData));
  };

  const updateUserTokens = (access, refresh) => {
    dispatch(updateTokens({ access, refresh }));
  };

  const getCurrentUser = async () => {
    try {
      dispatch(setLoading(true));
      console.log('Buscando dados do usuário atual...');
      const response = await getCurrentUserService();
      console.log('Resposta do servidor:', response);
      
      if (response.success && response.user) {
        console.log('Atualizando dados do usuário no estado:', response.user);
        dispatch(updateUser(response.user));
        return response.user;
      } else if (response.user) {
        // Se não há campo 'success', mas há dados do usuário
        console.log('Atualizando dados do usuário no estado (sem campo success):', response.user);
        dispatch(updateUser(response.user));
        return response.user;
      }
      
      throw new Error('Resposta inválida do servidor');
    } catch (error) {
      console.error('Erro ao buscar informações do usuário:', error);
      dispatch(setLoading(false));
      throw error;
    }
  };

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    isLoading,
    login,
    logout: logoutUser,
    updateUser: updateUserData,
    updateTokens: updateUserTokens,
    getCurrentUser,
  };
}; 
import { createSlice } from '@reduxjs/toolkit';

// Função para obter dados do usuário do localStorage
const getUserFromStorage = () => {
  try {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Erro ao carregar dados do usuário do localStorage:', error);
    return null;
  }
};

const initialState = {
  user: getUserFromStorage(),
  accessToken: localStorage.getItem('accessToken') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
  isAuthenticated: !!(localStorage.getItem('accessToken') && localStorage.getItem('refreshToken')),
  isLoading: false,
};

console.log('userSlice - Estado inicial:', initialState);

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      const { user, access, refresh } = action.payload;
      console.log('LoginSuccess - Dados recebidos:', { user, access, refresh });
      state.user = user;
      state.accessToken = access;
      state.refreshToken = refresh;
      state.isAuthenticated = true;
      state.isLoading = false;
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      localStorage.setItem('userData', JSON.stringify(user));
      console.log('LoginSuccess - Estado atualizado:', state);
    },
    logout: (state) => {
      console.log('🚪 [LOGOUT DEBUG] Executando logout no userSlice:', {
        timestamp: new Date().toISOString(),
        hadUser: !!state.user,
        hadAccessToken: !!state.accessToken,
        hadRefreshToken: !!state.refreshToken,
        wasAuthenticated: state.isAuthenticated,
        stackTrace: new Error().stack
      });
      
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userData');
      
      console.log('✅ [LOGOUT DEBUG] Logout concluído - estado limpo');
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      state.isLoading = false;
      localStorage.setItem('userData', JSON.stringify(state.user));
    },
    updateTokens: (state, action) => {
      const { access, refresh } = action.payload;
      
      console.log('🔄 [TOKEN DEBUG] Atualizando tokens:', {
        timestamp: new Date().toISOString(),
        hasAccess: !!access,
        hasRefresh: !!refresh,
        accessLength: access?.length || 0,
        refreshLength: refresh?.length || 0,
        previousAccessLength: state.accessToken?.length || 0,
        previousRefreshLength: state.refreshToken?.length || 0
      });
      
      state.accessToken = access;
      state.refreshToken = refresh;
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      
      console.log('✅ [TOKEN DEBUG] Tokens atualizados com sucesso');
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const { loginSuccess, logout, updateUser, updateTokens, setLoading } = userSlice.actions;
export default userSlice.reducer; 
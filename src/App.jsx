import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Login from './pages/Login'
import Home from './pages/Home'
import Funcionarios from './pages/Funcionarios'
import Clientes from './pages/Clientes'
import Sidebar from './components/Sidebar'
import ProtectedRoute from './components/ProtectedRoute'
import { useTheme } from './hooks/useTheme'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { setSidebarState } from './store/slices/sidebarSlice'
import { useAuth } from './hooks/useAuth'
import 'react-phone-number-input/style.css';
import './App.css'
import Triagem from './pages/Triagem'
import OrdemServico from './pages/OrdemServico'
import Produtos from './pages/Produtos'
import Eventos from './pages/Eventos'
import EventoDetalhes from './pages/EventoDetalhes'
import ClienteHistorico from './pages/ClienteHistorico'
import Financeiro from './pages/Financeiro'

function AppContent() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, getCurrentUser, isLoading } = useAuth();
  const isSidebarCollapsed = useSelector((state) => state.sidebar.isSidebarCollapsed);
  const location = useLocation();
  
  // Verifica se está na rota de login
  const isLoginPage = location.pathname === '/login';

  // Carrega os dados do usuário quando a aplicação inicia
  useEffect(() => {
    const initializeApp = async () => {
      // Verifica se há tokens no localStorage
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (accessToken && refreshToken && !isAuthenticated) {
        try {
          await getCurrentUser();
        } catch (error) {
          // Se falhar ao carregar dados do usuário, limpa os tokens inválidos
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userData');
          navigate('/login', { replace: true });
        }
      } else {
      }
    };

    initializeApp();
  }, []); // Executa apenas uma vez quando o componente monta

  useEffect(() => {
    // Se estiver autenticado e na rota raiz, redireciona para dashboard
    if (isAuthenticated && location.pathname === '/') {
      navigate('/dashboard');
    }
  }, [location.pathname, isAuthenticated, navigate]);

  // Mostra loading enquanto carrega os dados do usuário
  if (isLoading) {
    return (
      <div className="App d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem', color: 'var(--color-accent)'}}>
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="mt-3">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {!isLoginPage && <Sidebar setSideOpen={(c) => dispatch(setSidebarState(c))} />}
      <main className={`main-content ${isSidebarCollapsed && !isLoginPage ? 'collapsed' : ''} ${isLoginPage ? 'no-sidebar' : ''}`} id='main'>
        <Routes>
          {/* Rota raiz - redireciona para dashboard se autenticado, senão para login */}
          <Route path="/" element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
          } />
          
          {/* Rota de login - se já estiver autenticado, redireciona para dashboard */}
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
          } />
          
          {/* Rotas protegidas */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          
          <Route path="/funcionarios" element={
            <ProtectedRoute>
              <Funcionarios />
            </ProtectedRoute>
          } />
          
          <Route path="/clientes" element={
            <ProtectedRoute>
              <Clientes />
            </ProtectedRoute>
          } />
          
          <Route path="/clientes/:id/historico" element={
            <ProtectedRoute>
              <ClienteHistorico />
            </ProtectedRoute>
          } />
          
          <Route path="/triagem" element={
            <ProtectedRoute>
              <Triagem />
            </ProtectedRoute>
          } />
          
          <Route path="/ordens" element={
            <ProtectedRoute>
              <OrdemServico />
            </ProtectedRoute>
          } />
          
          <Route path="/ordens/:id" element={
            <ProtectedRoute>
              <OrdemServico />
            </ProtectedRoute>
          } />

          <Route path="/eventos" element={
            <ProtectedRoute>
              <Eventos />
            </ProtectedRoute>
          } />
          
          <Route path="/eventos/:id" element={
            <ProtectedRoute>
              <EventoDetalhes />
            </ProtectedRoute>
          } />
          
          <Route path="/produtos" element={
            <ProtectedRoute>
              <Produtos />
            </ProtectedRoute>
          } />
          
          <Route path="/financeiro" element={
            <ProtectedRoute>
              <Financeiro />
            </ProtectedRoute>
          } />
          
          {/* Rota para qualquer caminho não encontrado */}
          <Route path="*" element={
            <ProtectedRoute>
              <Navigate to="/dashboard" replace />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App

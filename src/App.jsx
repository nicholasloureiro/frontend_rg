import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Login from './pages/Login'
import Home from './pages/Home'
import Funcionarios from './pages/Funcionarios'
import Sidebar from './components/Sidebar'
import { useTheme } from './hooks/useTheme'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { setSidebarState } from './store/slices/sidebarSlice'
import 'react-phone-number-input/style.css';
import './App.css'
import Triagem from './pages/Triagem'
import OrdemServico from './pages/OrdemServico'

function AppContent() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isSidebarCollapsed = useSelector((state) => state.sidebar.isSidebarCollapsed);
  const location = useLocation();
  
  // Verifica se está na rota de login
  const isLoginPage = location.pathname === '/login';

  useEffect(() => {
    if (['/'].includes(location.pathname)) {
      navigate('/dashboard');
    }
  }, [location.pathname]);

  return (
    <div className="App">
      {!isLoginPage && <Sidebar setSideOpen={(c) => dispatch(setSidebarState(c))} />}
      <main className={`main-content ${isSidebarCollapsed && !isLoginPage ? 'collapsed' : ''} ${isLoginPage ? 'no-sidebar' : ''}`} id='main'>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/funcionarios" element={<Funcionarios />} />
          <Route path="/triagem" element={<Triagem />} />
          <Route path="/ordens" element={<OrdemServico />} />
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

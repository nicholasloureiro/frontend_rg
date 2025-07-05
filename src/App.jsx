import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Login from './pages/Login'
import Home from './pages/Home'
import Sidebar from './components/Sidebar'
import { useTheme } from './hooks/useTheme'
import { setSidebarState } from './store/slices/sidebarSlice'
import './App.css'

function AppContent() {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const isSidebarCollapsed = useSelector((state) => state.sidebar.isSidebarCollapsed);
  const location = useLocation();
  
  // Verifica se está na rota de login
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="App">
      {!isLoginPage && <Sidebar setSideOpen={(c) => dispatch(setSidebarState(c))} />}
      <main className={`main-content ${isSidebarCollapsed && !isLoginPage ? 'collapsed' : ''} ${isLoginPage ? 'no-sidebar' : ''}`} id='main'>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
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

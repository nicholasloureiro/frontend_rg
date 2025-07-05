import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Login from './pages/Login'
import Home from './pages/Home'
import Sidebar from './components/Sidebar'
import { useTheme } from './hooks/useTheme'
import { setSidebarState } from './store/slices/sidebarSlice'
import './App.css'

function App() {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const isSidebarCollapsed = useSelector((state) => state.sidebar.isSidebarCollapsed);

  return (
    <div className="App" data-theme={theme}>
      <Router>
        <Sidebar setSideOpen={(c) => dispatch(setSidebarState(c))} />
        <main className={`main-content ${isSidebarCollapsed ? 'collapsed' : ''}`} id='main'>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </Router>
    </div>
  )
}

export default App

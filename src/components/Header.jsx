import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import '../styles/Header.css';
import { useTheme } from '../hooks/useTheme';
import { setSidebarState } from '../store/slices/sidebarSlice';

const Header = ({ nomeHeader }) => {
  const dispatch = useDispatch();
  const { isSidebarCollapsed } = useSelector(state => state.sidebar);
  const { theme, toggleTheme, isLight, isDark } = useTheme();

  const [openCollapse, setOpenCollapse] = React.useState({});

  const toggleSidebar = () => {
    dispatch(setSidebarState(!isSidebarCollapsed));
    localStorage.setItem('sidebarCollapsed', JSON.stringify(!isSidebarCollapsed));
  };

  const handleToggleCollapse = (index) => {
    setOpenCollapse((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  return (
    <div className={`header-container ${isDark ? 'dark' : ''}`}>
      <button 
        id="toggleSidebarButtonHeader" 
        type="button"
        style={{ 
          background: 'none', 
          fontSize: '28px', 
          display: 'flex', 
          color: 'var(--color-text-primary)', 
          justifyContent: 'flex-start', 
          padding: '5px 10px', 
          alignItems: 'center', 
          zIndex: '9999',
          border: 'none',
          cursor: 'pointer'
        }}
        onClick={toggleSidebar}
      >
        <i className="bi bi-list"></i>
      </button>
      <div className="titulo">
        <h1 className="mb-2">{nomeHeader}</h1>
      </div>
      <div className="actions">
        <div className="form-check form-switch">
          <input 
            className="form-check-input" 
            style={{ cursor: 'pointer' }} 
            type="checkbox" 
            role="switch" 
            checked={isDark} 
            id="theme" 
            onChange={toggleTheme} 
          />
        </div>
      </div>
    </div>
  );
};

export default Header;

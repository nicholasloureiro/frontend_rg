import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import '../styles/Sidebar.css';

const SidebarLink = ({ to, label, onClick, iconBoot }) => {
  const location = useLocation();

  const handleClick = () => {
    if (window.innerWidth < 1000 && typeof onClick === 'function') {
      setTimeout(() => {
        onClick();
      }, 300);
    }
  };

  return (
    <Link
      to={to}
      onClick={handleClick}
      className={`sidebar-link text-decoration-none p-3 ${location.pathname.includes(to) ? 'active' : ''
        }`}
    >
      {iconBoot && <i className={`bi bi-${iconBoot}`}></i>}
      <span className="hide-on-collapse">{label}</span>
    </Link>
  );
};

const Sidebar = ({ setSideOpen }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [displayName, setDisplayName] = useState('Usuário');

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(!isCollapsed));
    if (setSideOpen) {
      setSideOpen(!isCollapsed);
    }
  };

  const handleLogout = () => {
    console.log('Logout clicked');
    // Implementar logout aqui
  };

  return (
    <nav className={`sidebar d-flex flex-column position-fixed ${isCollapsed ? 'collapsed' : ''}`} id="sidebar">
      <button
        className="btn btn-secondary"
        style={{ background: 'none', fontSize: '28px', alignSelf: 'flex-end', border: 'none', color: 'white' }}
        onClick={toggleSidebar}
      >
        <i className="bi bi-list"></i>
      </button>

      {/* logo */}
      <div className="d-flex px-4 pb-2" style={{ justifyContent: 'center' }}>
        <img src="/src/assets/logo.png" alt="Logo" style={{ width: !isCollapsed ? '50%' : '100%', margin: '0 auto', marginTop: '10px', transition: 'width 0.3s ease-in-out' }} />
      </div>

      {/* perfil */}
      <div className="profile-section mt-2 mb-2 px-3 py-2 dropdown">
        <div
          className="d-flex align-items-center dropdown-toggle"
          data-bs-toggle="dropdown"
          aria-expanded="false"
          style={{ height: '45px', cursor: 'pointer' }}
        >
          <div className='profile-image-container' style={{ width: '45px', height: '45px' }}>
            <img
              src="/src/assets/user-default.png"
              className="rounded-circle"
              alt="Perfil"
              id="profile-image"
              style={{ width: '100%', height: '45px', objectFit: 'cover' }}
            />
          </div>
          <div className="ms-3 profile-info" style={{ width: '100%' }}>
            <h6 className="text-white mb-0" style={{ whiteSpace: 'normal' }}>
              {displayName}
            </h6>
          </div>
        </div>

        <ul className="dropdown-menu">
          <li className='dropdown-item' onClick={handleLogout} style={{ borderTop: '1px solid #ccdc' }}>
            <span className="sair" style={{ padding: '0px 5px' }}>
              <i className="bi bi-box-arrow-right"></i> Sair
            </span>
          </li>
        </ul>
      </div>

      {/* links */}
      <div className="nav flex-column" style={{ height: '100%' }}>
        <SidebarLink to="/home" iconBoot={'house'} label="Home" onClick={toggleSidebar} />        
        <div className="mt-auto mb-3" style={{ width: '100%', justifyContent: 'center', display: 'flex' }}>
          <span className="version" style=
            {{ color: 'white', fontSize: '12px', textAlign: 'center', cursor: 'default' }} >Roupa de Gala® - 2025</span>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;

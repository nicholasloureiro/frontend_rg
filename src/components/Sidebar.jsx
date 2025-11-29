import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Modal from './Modal';
import ChangePassword from './ChangePassword';
import EditingProfile from './EditingProfile';
import { useAuth } from '../hooks/useAuth';
import { logout as logoutService } from '../services/authService';
import { capitalizeText } from '../utils/capitalizeText';
import logo from '../assets/logo.png';

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
  const [showModal, setShowModal] = useState(false);
  const [showModalPassword, setShowModalPassword] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1000);
  const [isSmallMobile, setIsSmallMobile] = useState(window.innerWidth < 650);
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Links de navegação
  const navLinks = [
    { to: "/dashboard", iconBoot: "graph-up", label: "Dashboard" },
    { to: "/triagem", iconBoot: "clipboard-check", label: "Triagem" },
    { to: "/ordens", iconBoot: "list-check", label: "Ordens de serviço" },
    { to: "/eventos", iconBoot: "calendar2-event", label: "Eventos" },
    { to: "/clientes", iconBoot: "people", label: "Clientes" },
    { to: "/funcionarios", iconBoot: "person-lines-fill", label: "Funcionários" },
    { to: "/produtos", iconBoot: "box", label: "Produtos" },
    // Financeiro: visualização de vendas por tipo e fechamento de caixa
    { to: "/financeiro", iconBoot: "currency-dollar", label: "Financeiro" },
  ];

  // Número de links visíveis em telas pequenas
  const getVisibleLinksCount = () => {
    if (window.innerWidth < 380) return 2;
    if (window.innerWidth < 450) return 3;
    if (window.innerWidth < 520) return 4;
    if (window.innerWidth < 610) return 5;
    if (window.innerWidth < 650) return 6;
    return navLinks.length;
  };

  const [visibleLinksCount, setVisibleLinksCount] = useState(getVisibleLinksCount());

  // Detecta mudanças no tamanho da tela
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1000;
      const smallMobile = window.innerWidth < 650;
      setIsMobile(mobile);
      setIsSmallMobile(smallMobile);
      setVisibleLinksCount(getVisibleLinksCount());
      if (mobile && isCollapsed) {
        setIsCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [isCollapsed]);

  const handleCloseModal = () => setShowModal(false);
  const handleCloseModalPassword = () => setShowModalPassword(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(!isCollapsed));
    if (setSideOpen) {
      setSideOpen(!isCollapsed);
    }
  };

  const handleLogout = async () => {
    try {
      // Chama o serviço de logout para invalidar o refresh token no servidor
      await logoutService();
    } catch (error) {
      console.error('Erro ao fazer logout no servidor:', error);
    } finally {
      // Faz logout local independente do resultado do servidor
      logout();
      // Redireciona para login
      navigate('/login', { replace: true });
    }
  };

  // Obtém o nome do usuário para exibir (primeiro nome + último sobrenome)
  // Prioriza: user.person.name > user.first_name + user.last_name > user.first_name > user.username
  const getUserDisplayName = () => {
    if (isLoading || !user) {
      return 'Carregando...';
    }
    
    // Prioriza o nome da pessoa (mais completo)
    if (user?.person?.name) {
      const nameParts = user.person.name.trim().split(' ').filter(part => part.length > 0);
      if (nameParts.length >= 2) {
        // Primeiro nome + último sobrenome
        const firstName = nameParts[0];
        const lastName = nameParts[nameParts.length - 1];
        return capitalizeText(`${firstName} ${lastName}`);
      } else if (nameParts.length === 1) {
        return capitalizeText(nameParts[0]);
      }
    }
    
    // Fallback para first_name + last_name do usuário
    if (user?.first_name && user?.last_name) {
      return capitalizeText(`${user.first_name} ${user.last_name}`);
    }
    
    // Fallback para apenas first_name
    if (user?.first_name) {
      return capitalizeText(user.first_name);
    }
    
    // Fallback para username
    if (user?.username) {
      return 'Usuário';
    }
    
    return 'Usuário';
  };

  // Obtém o nome completo do usuário
  const getFullUserName = () => {
    if (isLoading || !user) {
      return 'Carregando...';
    }
    
    if (user?.person?.name) {
      return capitalizeText(user.person.name);
    }
    
    if (user?.first_name && user?.last_name) {
      return capitalizeText(`${user.first_name} ${user.last_name}`);
    }
    
    if (user?.first_name) {
      return capitalizeText(user.first_name);
    }
    
    return 'Usuário';
  };

  // Obtém o tipo de pessoa (ATENDENTE, etc.)
  const getPersonType = () => {
    if (isLoading || !user) {
      return null;
    }
    
    if (user?.person?.person_type?.type) {
      return user.person.person_type.type;
    }
    return null;
  };

  // Obtém as iniciais do nome do usuário (primeira letra do nome + primeira letra do sobrenome)
  const getUserInitials = () => {
    if (isLoading || !user) {
      return 'U';
    }
    
    let firstName = '';
    let lastName = '';
    
    // Prioriza o nome da pessoa (mais completo)
    if (user?.person?.name) {
      const nameParts = user.person.name.trim().split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts[1] || '';
    } else if (user?.first_name && user?.last_name) {
      firstName = user.first_name;
      lastName = user.last_name;
    } else if (user?.first_name) {
      firstName = user.first_name;
    } else if (user?.username) {
      firstName = user.username;
    }
    
    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();
    
    return firstInitial + lastInitial;
  };

  return (
    <>
      <nav className={`sidebar d-flex flex-column position-fixed ${isCollapsed ? 'collapsed' : ''} ${isMobile ? 'mobile-footer' : ''}`} id="sidebar">
        {!isMobile && (
          <button
            className={`btn toggle-sidebar ${isCollapsed ? 'collapsed' : ''}`}
            style={{ background: 'none', fontSize: '28px', alignSelf: 'flex-end', border: 'none', color: 'white' }}
            onClick={toggleSidebar}
          >
            <i className="bi bi-list"></i>
          </button>
        )}

        {/* logo - oculto em mobile */}
        {!isMobile && (
          <div className="d-flex px-4 pb-2" style={{ justifyContent: 'center' }}>
            <img src={logo} alt="Logo" style={{ width: !isCollapsed ? '50%' : '100%', margin: '0 auto', marginTop: '10px', transition: 'width 0.3s ease-in-out' }} />
          </div>
        )}

        {/* perfil - oculto em mobile */}
        {!isMobile && (
          <div className="profile-section mt-2 mb-2 px-3 py-2 dropdown">
            <div
              className="d-flex align-items-center dropdown-toggle"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              style={{ height: '45px', cursor: 'pointer' }}
            >
              {isCollapsed && (
                <div className="user-initials-circle">
                  {getUserInitials()}
                </div>
              )}

              <div className="ms-3 profile-info" style={{ width: '100%' }}>
                <h6 className="text-white mb-0" style={{ whiteSpace: 'normal' }}>
                  Olá, {capitalizeText(getUserDisplayName())}.
                </h6>
                {getPersonType() && (
                  <small className="text-white-50" style={{ fontSize: '11px' }}>
                    {getPersonType()}
                  </small>
                )}
              </div>
            </div>

            <ul className="dropdown-menu">
              <li className='dropdown-item' onClick={() => setShowModal(true)} style={{ borderTop: '1px solid #ccdc' }}>
                <span className='edit-profile'>
                  <i className="bi bi-pencil-square"></i> Editar perfil
                </span>
              </li>
              <li className='dropdown-item' onClick={() => setShowModalPassword(true)} style={{ borderTop: '1px solid #ccdc' }}>
                <span className="sair" style={{ padding: '0px 5px' }}>
                  <i className="bi bi-key"></i> Alterar senha
                </span>
              </li>
              <li className='dropdown-item' onClick={handleLogout} style={{ borderTop: '1px solid #ccdc' }}>
                <span className="sair" style={{ padding: '0px 5px' }}>
                  <i className="bi bi-box-arrow-right"></i> Sair
                </span>
              </li>
            </ul>
          </div>
        )}

        {/* links */}
        <div className={`nav ${isMobile ? 'flex-row' : 'flex-column'}`} style={{ height: isMobile ? 'auto' : '100%' }}>
          {isSmallMobile ? (
            <>
              {navLinks.slice(0, visibleLinksCount).map((link) => (
                <SidebarLink
                  key={link.to}
                  to={link.to}
                  iconBoot={link.iconBoot}
                  label={link.label}
                  onClick={toggleSidebar}
                />
              ))}
              
              {visibleLinksCount < navLinks.length && (
                <div id="sidebar-more-dropdown" className="sidebar-more-container dropdown">
                  <div
                    id="sidebar-more-toggle"
                    className="sidebar-more-toggle dropdown-toggle"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <div className="sidebar-more-button">
                      <i className="bi bi-three-dots"></i>
                      <span>Mais</span>
                    </div>
                  </div>

                  <ul id="sidebar-more-menu" className="sidebar-more-menu dropdown-menu dropdown-menu-end">
                    {navLinks.slice(visibleLinksCount).map((link) => {
                      const isActive = location.pathname.includes(link.to);
                      return (
                        <li 
                          key={link.to} 
                          className="sidebar-more-item dropdown-item"
                          onClick={() => {
                            if (window.innerWidth < 1000 && typeof toggleSidebar === 'function') {
                              setTimeout(() => {
                                toggleSidebar();
                              }, 300);
                            }
                          }}
                        >
                          <Link
                            to={link.to}
                            className={`sidebar-more-link text-decoration-none ${isActive ? 'active' : ''}`}
                          >
                            <i className={`bi bi-${link.iconBoot}`}></i>
                            {link.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <>
              {navLinks.map((link) => (
                <SidebarLink
                  key={link.to}
                  to={link.to}
                  iconBoot={link.iconBoot}
                  label={link.label}
                  onClick={toggleSidebar}
                />
              ))}
            </>
          )}
          
          {!isMobile && (
            <div className="mt-auto mb-3" style={{ width: '100%', justifyContent: 'center', display: 'flex' }}>
              <span className="version" style=
                {{ color: 'white', fontSize: '12px', textAlign: 'center', cursor: 'default' }} >Roupa de Gala® - 2025</span>
            </div>
          )}
        </div>

        {/* Perfil em mobile */}
        {isMobile && (
          <div className="mobile-profile-section dropdown">
            <div
              className="d-flex align-items-center justify-content-center dropdown-toggle"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              style={{ cursor: 'pointer', padding: '8px' }}
            >
              <div className="user-initials-circle">
                {getUserInitials()}
              </div>
            </div>

            <ul className="dropdown-menu dropdown-menu-end">
              <li className='dropdown-item' onClick={() => setShowModal(true)} style={{ borderTop: '1px solid #ccdc' }}>
                <span className='edit-profile'>
                  <i className="bi bi-pencil-square"></i> Editar perfil
                </span>
              </li>
              <li className='dropdown-item' onClick={() => setShowModalPassword(true)} style={{ borderTop: '1px solid #ccdc' }}>
                <span className="sair" style={{ padding: '0px 5px' }}>
                  <i className="bi bi-key"></i> Alterar senha
                </span>
              </li>
              <li className='dropdown-item' onClick={handleLogout} style={{ borderTop: '1px solid #ccdc' }}>
                <span className="sair" style={{ padding: '0px 5px' }}>
                  <i className="bi bi-box-arrow-right"></i> Sair
                </span>
              </li>
            </ul>
          </div>
        )}
      </nav>
      {/* modal de edição de perfil */}
      <Modal
        show={showModal}
        onClose={handleCloseModal}
        onCloseX={handleCloseModal}
        title="Editar Perfil"
        bodyContent={<EditingProfile handleCloseModal={handleCloseModal} />}
      />
      {/* modal de alteração de senha */}
      <Modal
        show={showModalPassword}
        onClose={handleCloseModalPassword}
        onCloseX={handleCloseModalPassword}
        title=""
        bodyContent={<ChangePassword handleCloseModalPassword={handleCloseModalPassword} />}
      />
    </>
  );
};

export default Sidebar;

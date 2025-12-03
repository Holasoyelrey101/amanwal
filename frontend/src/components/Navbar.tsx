import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './navbar.css';

export const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <nav className={`navbar-premium ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-content">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🏠</span>
          <span className="logo-text">Amanwal</span>
        </Link>

        {/* Navigation Links */}
        <div className="navbar-links">
          <Link to="/cabins" className="nav-link-premium">
            <i className="fa fa-home"></i>
            <span>Cabañas</span>
          </Link>

          {isAuthenticated && (
            <Link to="/my-bookings" className="nav-link-premium">
              <i className="fa fa-calendar"></i>
              <span>Mis Reservas</span>
            </Link>
          )}
        </div>

        {/* User Section */}
        <div className="navbar-user-section">
          {isAuthenticated ? (
            <div className="user-dropdown-wrapper">
              <button 
                className="user-profile-btn"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <div className="user-avatar">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="user-name">{user?.name}</span>
                <i className={`fa fa-chevron-down ${showDropdown ? 'open' : ''}`}></i>
              </button>

              {showDropdown && (
                <div className="user-dropdown-menu">
                  {isAdmin && (
                    <>
                      <Link 
                        to="/admin" 
                        className="dropdown-item admin-item"
                        onClick={() => setShowDropdown(false)}
                      >
                        <i className="fa fa-cog"></i>
                        <span>Panel de Admin</span>
                      </Link>
                      <div className="dropdown-divider"></div>
                    </>
                  )}
                  <Link 
                    to="/profile" 
                    className="dropdown-item"
                    onClick={() => setShowDropdown(false)}
                  >
                    <i className="fa fa-user"></i>
                    <span>Ver Perfil</span>
                  </Link>
                  <div className="dropdown-divider"></div>
                  <button 
                    className="dropdown-item logout-item"
                    onClick={() => {
                      setShowDropdown(false);
                      handleLogout();
                    }}
                  >
                    <i className="fa fa-sign-out"></i>
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-login">
                <i className="fa fa-sign-in"></i>
                Iniciar Sesión
              </Link>
              <Link to="/register" className="btn-register">
                <i className="fa fa-user-plus"></i>
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

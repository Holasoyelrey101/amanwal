import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './navbar.css';

export const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <a className="navbar-brand fw-bold" href="/">
          🏠 Amanwal
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <a className="nav-link" href="/cabins">
                Cabañas
              </a>
            </li>
            {isAuthenticated ? (
              <>
                <li className="nav-item">
                  <a className="nav-link" href="/my-bookings">
                    Mis Reservas
                  </a>
                </li>
                {/* Dropdown para perfil y opciones */}
                <li className="nav-item dropdown">
                  <button
                    className="nav-link dropdown-toggle border-0 bg-transparent"
                    onClick={toggleDropdown}
                    style={{ cursor: 'pointer' }}
                  >
                    👤 {user?.name}
                  </button>
                  <ul className={`dropdown-menu dropdown-menu-end ${showDropdown ? 'show' : ''}`}>
                    {isAdmin && (
                      <>
                        <li>
                          <a className="dropdown-item text-warning fw-bold" href="/admin" onClick={() => setShowDropdown(false)}>
                            📊 Panel de Admin
                          </a>
                        </li>
                        <li>
                          <hr className="dropdown-divider" />
                        </li>
                      </>
                    )}
                    <li>
                      <a className="dropdown-item" href="/profile" onClick={() => setShowDropdown(false)}>
                        👤 Ver Perfil
                      </a>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={handleLogout}
                      >
                        🚪 Cerrar Sesión
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <a className="nav-link" href="/login">
                    Iniciar Sesión
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/register">
                    Registrarse
                  </a>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

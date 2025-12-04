import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import { ThemeSelector } from '../components/ThemeSelector';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faHome, faCalendar, faStar, faShield, faKey } from '@fortawesome/free-solid-svg-icons';
import './admin.css';
import './admin-dashboard.css';

interface DashboardStats {
  totalUsers: number;
  totalCabins: number;
  totalBookings: number;
  totalReviews: number;
  recentBookings: number;
}

export const AdminDashboard: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    fetchStats();
  }, [isAdmin, navigate]);

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/admin/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="admin-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="loading-spinner"></div>
    </div>
  );

  if (!stats) return (
    <div className="admin-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="empty-state">
        <div className="empty-state-icon">⚠️</div>
        <h3>Error al cargar estadísticas</h3>
        <p>No se pudieron obtener los datos. Intenta más tarde.</p>
      </div>
    </div>
  );

  return (
    <div className="admin-dashboard-container">
      <ThemeSelector />
      
      <div className="admin-dashboard-content">
        <div className="admin-dashboard-header">
          <div>
            <h1><FontAwesomeIcon icon={faUsers} style={{ marginRight: '12px' }} />Panel de Administración</h1>
            <p>Bienvenido al panel administrativo de Amanwal</p>
          </div>
          <button className="admin-btn primary" onClick={() => navigate('/admin/users')}>
            <FontAwesomeIcon icon={faUsers} /> Usuarios
          </button>
        </div>

        {/* Stats Cards */}
        <div className="admin-dashboard-stats">
          <div className="stat-card" style={{ animationDelay: '0s' }}>
            <div className="stat-icon"><FontAwesomeIcon icon={faUsers} /></div>
            <div className="stat-content">
              <h3>{stats.totalUsers}</h3>
              <p>Usuarios Totales</p>
              <small>Registrados en el sistema</small>
            </div>
          </div>

          <div className="stat-card" style={{ animationDelay: '0.1s' }}>
            <div className="stat-icon"><FontAwesomeIcon icon={faHome} /></div>
            <div className="stat-content">
              <h3>{stats.totalCabins}</h3>
              <p>Cabañas</p>
              <small>Disponibles en el sistema</small>
            </div>
          </div>

          <div className="stat-card" style={{ animationDelay: '0.2s' }}>
            <div className="stat-icon"><FontAwesomeIcon icon={faCalendar} /></div>
            <div className="stat-content">
              <h3>{stats.totalBookings}</h3>
              <p>Reservas</p>
              <small>Total de reservas</small>
            </div>
          </div>

          <div className="stat-card" style={{ animationDelay: '0.3s' }}>
            <div className="stat-icon"><FontAwesomeIcon icon={faStar} /></div>
            <div className="stat-content">
              <h3>{stats.totalReviews}</h3>
              <p>Reseñas</p>
              <small>Calificaciones totales</small>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="admin-dashboard-panel">
          <h2>⚡ Acciones Rápidas</h2>
          <div className="admin-dashboard-actions">
            <button
              className="action-btn"
              onClick={() => navigate('/admin/users')}
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              }}
            >
              <FontAwesomeIcon icon={faUsers} />
              <span>Gestión de Usuarios</span>
            </button>

            <button
              className="action-btn"
              onClick={() => navigate('/admin/users')}
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              }}
              title="Asignar y gestionar rangos de usuarios"
            >
              <FontAwesomeIcon icon={faShield} />
              <span>Gestión de Rangos</span>
            </button>

            <button
              className="action-btn"
              onClick={() => navigate('/admin/cabins')}
              style={{
                background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
              }}
            >
              <FontAwesomeIcon icon={faHome} />
              <span>Gestión de Cabañas</span>
            </button>

            <button
              className="action-btn"
              onClick={() => navigate('/admin/bookings')}
              style={{
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              }}
            >
              <FontAwesomeIcon icon={faCalendar} />
              <span>Gestión de Reservas</span>
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="admin-dashboard-panel">
          <h2>Información del Sistema</h2>
          <div className="admin-dashboard-info">
            <div className="info-box">
              <strong style={{ color: '#3b82f6' }}>📊 Actividad Reciente</strong>
              <p>
                Nuevas reservas (últimos 7 días): <strong>{stats.recentBookings}</strong>
              </p>
            </div>

            <div className="info-box">
              <strong style={{ color: '#3b82f6' }}>🌐 URLs del Sistema</strong>
              <ul>
                <li>Frontend: <code>http://localhost:5173</code></li>
                <li>API: <code>http://localhost:3000/api</code></li>
              </ul>
            </div>

            <div className="info-box">
              <strong style={{ color: '#22c55e' }}>✅ Estado del Sistema</strong>
              <p>
                Todos los servicios están <strong style={{ color: '#22c55e' }}>operativos</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

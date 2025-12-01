import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeSelector } from '../components/ThemeSelector';
import '../styles/admin-themes.css';

interface DashboardStats {
  totalUsers: number;
  totalCabins: number;
  totalBookings: number;
  totalReviews: number;
  recentBookings: number;
}

const API_URL = 'http://localhost:3000/api';

export const AdminDashboard: React.FC = () => {
  const { token, isAdmin } = useAuth();
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
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${API_URL}/admin/dashboard`, { headers });
      setStats(response.data);
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-5">Cargando panel de administración...</div>;

  if (!stats) return <div className="text-center py-5">Error al cargar las estadísticas</div>;

  return (
    <div className="admin-container">
      <ThemeSelector />
      <div className="admin-header">
        <h1>Panel de Administración</h1>
        <p className="text-muted">Bienvenido al panel administrativo de Amanwal</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon users-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.totalUsers}</h3>
            <p>Usuarios Totales</p>
            <button
              className="btn btn-sm btn-primary mt-2"
              onClick={() => navigate('/admin/users')}
            >
              Ver Usuarios →
            </button>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon cabins-icon">🏠</div>
          <div className="stat-content">
            <h3>{stats.totalCabins}</h3>
            <p>Cabañas Registradas</p>
            <button
              className="btn btn-sm btn-primary mt-2"
              onClick={() => navigate('/admin/cabins')}
            >
              Ver Cabañas →
            </button>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bookings-icon">📅</div>
          <div className="stat-content">
            <h3>{stats.totalBookings}</h3>
            <p>Reservas Totales</p>
            <button
              className="btn btn-sm btn-primary mt-2"
              onClick={() => navigate('/admin/bookings')}
            >
              Ver Reservas →
            </button>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon reviews-icon">⭐</div>
          <div className="stat-content">
            <h3>{stats.totalReviews}</h3>
            <p>Reseñas Totales</p>
            <button className="btn btn-sm btn-secondary mt-2" disabled>
              Próximamente
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2>Acciones Rápidas</h2>
        <div className="actions-grid">
          <button
            className="action-card"
            onClick={() => navigate('/admin/users')}
          >
            <span className="action-icon">👥</span>
            <h4>Gestión de Usuarios</h4>
            <p>Ver y administrar usuarios del sistema</p>
          </button>

          <button
            className="action-card"
            onClick={() => navigate('/admin/cabins')}
          >
            <span className="action-icon">🏠</span>
            <h4>Gestión de Cabañas</h4>
            <p>Agregar, editar y eliminar cabañas</p>
          </button>

          <button
            className="action-card"
            onClick={() => navigate('/admin/bookings')}
          >
            <span className="action-icon">📅</span>
            <h4>Gestión de Reservas</h4>
            <p>Ver y administrar las reservas</p>
          </button>
        </div>
      </div>

      {/* Info Section */}
      <div className="admin-info-section">
        <h3>Información del Sistema</h3>
        <ul>
          <li>
            <strong>Nuevas Reservas (últimos 7 días):</strong> {stats.recentBookings}
          </li>
          <li>
            <strong>URL del sitio:</strong> <code>http://localhost:5173</code>
          </li>
          <li>
            <strong>API Backend:</strong> <code>http://localhost:3000/api</code>
          </li>
        </ul>
      </div>
    </div>
  );
};

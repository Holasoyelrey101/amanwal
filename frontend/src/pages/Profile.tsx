import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './profile.css';

interface Booking {
  id: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: string;
  cabin: {
    id: string;
    title: string;
    location: string;
    price: number;
  };
}

interface ProfileData {
  id: string;
  email: string;
  name: string;
  phone?: string;
  birthDate?: string;
  role: string;
  createdAt: string;
  bookings: Booking[];
}

const API_URL = 'http://localhost:3000/api';

export const Profile: React.FC = () => {
  const { token, user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'bookings' | 'password'>('info');
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/profile`, { headers });
      setProfile(response.data);
      setEditName(response.data.name);
      setEditPhone(response.data.phone || '');
    } catch (error) {
      console.error('Error al cargar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      await axios.patch(
        `${API_URL}/auth/profile`,
        { name: editName, phone: editPhone },
        { headers }
      );
      setSuccessMessage('Perfil actualizado correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
      loadProfile();
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
    }
  };

  const changePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    try {
      await axios.post(
        `${API_URL}/auth/change-password`,
        {
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
          confirmPassword: passwords.confirmPassword,
        },
        { headers }
      );
      setSuccessMessage('Contraseña actualizada exitosamente');
      setTimeout(() => setSuccessMessage(''), 3000);
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
    } catch (error: any) {
      console.error('Error al cambiar contraseña:', error);
      alert(error.response?.data?.error || 'Error al cambiar contraseña');
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>Cargando perfil...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-error">
        <i className="fa fa-exclamation-circle"></i>
        <h3>Error al cargar perfil</h3>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { icon: 'fa-check-circle', label: 'Confirmada', class: 'confirmed' };
      case 'pending':
        return { icon: 'fa-clock-o', label: 'Pendiente', class: 'pending' };
      case 'cancelled':
        return { icon: 'fa-times-circle', label: 'Cancelada', class: 'cancelled' };
      default:
        return { icon: 'fa-info-circle', label: status, class: 'default' };
    }
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <div className="profile-container">
      {/* Header */}
      <div className="profile-header">
        <div className="header-content">
          <h1>Mi Perfil</h1>
          <p>Gestiona tu información personal y reservas</p>
        </div>
      </div>

      <div className="profile-wrapper">
        {/* Success Message */}
        {successMessage && (
          <div className="success-alert">
            <i className="fa fa-check-circle"></i>
            <span>{successMessage}</span>
          </div>
        )}

        <div className="profile-layout">
          {/* Sidebar Card */}
          <div className="profile-sidebar">
            <div className="profile-card">
              <div className="avatar">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <h3 className="profile-name">{profile.name}</h3>
              <p className="profile-email">{profile.email}</p>
              <div className={`role-badge ${profile.role === 'admin' ? 'admin' : 'user'}`}>
                <i className={`fa ${profile.role === 'admin' ? 'fa-shield' : 'fa-user-circle'}`}></i>
                <span>{profile.role === 'admin' ? 'Administrador' : 'Usuario'}</span>
              </div>
              <p className="profile-date">
                <i className="fa fa-calendar"></i>
                Miembro desde {new Date(profile.createdAt).toLocaleDateString('es-ES')}
              </p>
            </div>

            <div className="profile-stats">
              <div className="stat">
                <span className="stat-icon">
                  <i className="fa fa-calendar-check-o"></i>
                </span>
                <div>
                  <span className="stat-value">{profile.bookings.length}</span>
                  <span className="stat-label">Reservas</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="profile-content">
            {/* Tabs */}
            <div className="profile-tabs">
              <button
                className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
                onClick={() => setActiveTab('info')}
              >
                <i className="fa fa-user"></i>
                <span>Información Personal</span>
              </button>
              <button
                className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
                onClick={() => setActiveTab('bookings')}
              >
                <i className="fa fa-calendar-check-o"></i>
                <span>Mis Reservas</span>
                <span className="tab-count">{profile.bookings.length}</span>
              </button>
              <button
                className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
                onClick={() => setActiveTab('password')}
              >
                <i className="fa fa-lock"></i>
                <span>Seguridad</span>
              </button>
            </div>

            {/* Info Tab */}
            {activeTab === 'info' && (
              <div className="tab-content">
                <div className="form-section">
                  <h3>Información Personal</h3>
                  
                  <div className="form-group">
                    <label>Nombre Completo</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Tu nombre completo"
                    />
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      className="form-input"
                      value={profile.email}
                      disabled
                      placeholder="Tu email"
                    />
                    <small>El email no puede ser cambiado</small>
                  </div>

                  <div className="form-group">
                    <label>Teléfono</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="Tu teléfono (opcional)"
                    />
                  </div>

                  <div className="form-group">
                    <label>Fecha de Nacimiento</label>
                    <input
                      type="date"
                      className="form-input"
                      value={profile.birthDate ? new Date(profile.birthDate).toISOString().split('T')[0] : ''}
                      disabled
                      placeholder="Tu fecha de nacimiento"
                    />
                    <small>La fecha de nacimiento no puede ser cambiada</small>
                  </div>

                  {profile.birthDate && (
                    <div className="form-group">
                      <label>Edad</label>
                      <div className="age-display">
                        <i className="fa fa-calendar-o"></i>
                        <span>{calculateAge(profile.birthDate)} años</span>
                      </div>
                    </div>
                  )}

                  <button className="btn-save" onClick={updateProfile}>
                    <i className="fa fa-save"></i>
                    Guardar Cambios
                  </button>
                </div>
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <div className="tab-content">
                {profile.bookings.length > 0 ? (
                  <div className="bookings-list">
                    <h3>Tus Reservas</h3>
                    {profile.bookings.map((booking) => {
                      const statusBadge = getStatusBadge(booking.status);
                      return (
                        <div key={booking.id} className="booking-item">
                          <div className="booking-info">
                            <h4>{booking.cabin.title}</h4>
                            <div className="booking-location">
                              <i className="fa fa-map-marker"></i>
                              <span>{booking.cabin.location}</span>
                            </div>

                            <div className="booking-details">
                              <div className="detail">
                                <span className="label">Check-in</span>
                                <span className="value">
                                  {new Date(booking.checkIn).toLocaleDateString('es-ES')}
                                </span>
                              </div>
                              <div className="detail">
                                <span className="label">Check-out</span>
                                <span className="value">
                                  {new Date(booking.checkOut).toLocaleDateString('es-ES')}
                                </span>
                              </div>
                              <div className="detail">
                                <span className="label">Total</span>
                                <span className="value price">
                                  ${booking.totalPrice.toLocaleString('es-ES')}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className={`status-badge ${statusBadge.class}`}>
                            <i className={`fa ${statusBadge.icon}`}></i>
                            <span>{statusBadge.label}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="empty-bookings">
                    <i className="fa fa-inbox"></i>
                    <h4>No tienes reservas aún</h4>
                    <p>¡Comienza a explorar nuestras cabañas y haz tu primera reserva!</p>
                    <a href="/cabins" className="btn-explore">
                      <i className="fa fa-arrow-right"></i>
                      Explorar Cabañas
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <div className="tab-content">
                <div className="form-section">
                  <h3>Cambiar Contraseña</h3>
                  <p className="section-description">
                    Actualiza tu contraseña regularmente para mantener tu cuenta segura
                  </p>

                  {!showPasswordForm ? (
                    <button
                      className="btn-change-password"
                      onClick={() => setShowPasswordForm(true)}
                    >
                      <i className="fa fa-key"></i>
                      Cambiar Contraseña
                    </button>
                  ) : (
                    <div className="password-form">
                      <div className="form-group">
                        <label>Contraseña Actual</label>
                        <input
                          type="password"
                          className="form-input"
                          value={passwords.currentPassword}
                          onChange={(e) =>
                            setPasswords({ ...passwords, currentPassword: e.target.value })
                          }
                          placeholder="Tu contraseña actual"
                        />
                      </div>

                      <div className="form-group">
                        <label>Nueva Contraseña</label>
                        <input
                          type="password"
                          className="form-input"
                          value={passwords.newPassword}
                          onChange={(e) =>
                            setPasswords({ ...passwords, newPassword: e.target.value })
                          }
                          placeholder="Tu nueva contraseña"
                        />
                      </div>

                      <div className="form-group">
                        <label>Confirmar Contraseña</label>
                        <input
                          type="password"
                          className="form-input"
                          value={passwords.confirmPassword}
                          onChange={(e) =>
                            setPasswords({ ...passwords, confirmPassword: e.target.value })
                          }
                          placeholder="Confirma tu nueva contraseña"
                        />
                      </div>

                      <div className="form-actions">
                        <button className="btn-save" onClick={changePassword}>
                          <i className="fa fa-check"></i>
                          Cambiar Contraseña
                        </button>
                        <button
                          className="btn-cancel"
                          onClick={() => setShowPasswordForm(false)}
                        >
                          <i className="fa fa-times"></i>
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

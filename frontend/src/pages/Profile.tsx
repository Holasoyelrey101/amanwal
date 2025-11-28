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
      alert('Error al cargar perfil');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      const response = await axios.patch(
        `${API_URL}/auth/profile`,
        { name: editName, phone: editPhone },
        { headers }
      );
      alert('Perfil actualizado');
      loadProfile();
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      alert('Error al actualizar perfil');
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
      alert('Contraseña actualizada exitosamente');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
    } catch (error: any) {
      console.error('Error al cambiar contraseña:', error);
      alert(error.response?.data?.error || 'Error al cambiar contraseña');
    }
  };

  if (loading) {
    return <div className="container py-5 text-center">Cargando perfil...</div>;
  }

  if (!profile) {
    return <div className="container py-5 text-center">Error al cargar perfil</div>;
  }

  return (
    <div className="profile-container">
      <div className="container py-5">
        <div className="row">
          {/* Sidebar */}
          <div className="col-lg-3 mb-4">
            <div className="card profile-card text-center">
              <div className="card-body">
                <div className="avatar-placeholder">👤</div>
                <h4 className="mt-3">{profile.name}</h4>
                <p className="text-muted">{profile.email}</p>
                <span className={`badge bg-${profile.role === 'admin' ? 'danger' : 'primary'}`}>
                  {profile.role}
                </span>
                <p className="small text-muted mt-3">
                  Miembro desde {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-lg-9">
            {/* Tabs */}
            <ul className="nav nav-tabs mb-4" role="tablist">
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === 'info' ? 'active' : ''}`}
                  onClick={() => setActiveTab('info')}
                >
                  ℹ️ Información Personal
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === 'bookings' ? 'active' : ''}`}
                  onClick={() => setActiveTab('bookings')}
                >
                  🗓️ Mis Reservas ({profile.bookings.length})
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === 'password' ? 'active' : ''}`}
                  onClick={() => setActiveTab('password')}
                >
                  🔐 Seguridad
                </button>
              </li>
            </ul>

            {/* Info Tab */}
            {activeTab === 'info' && (
              <div className="card">
                <div className="card-header bg-light">
                  <h5 className="mb-0">Información Personal</h5>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label className="form-label">Nombre Completo</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={profile.email}
                      disabled
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Teléfono</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="Opcional"
                    />
                  </div>
                  <button className="btn btn-primary" onClick={updateProfile}>
                    💾 Guardar Cambios
                  </button>
                </div>
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <div>
                {profile.bookings.length > 0 ? (
                  <div className="row">
                    {profile.bookings.map((booking) => (
                      <div key={booking.id} className="col-md-6 mb-3">
                        <div className="card booking-card">
                          <div className="card-body">
                            <h5 className="card-title">{booking.cabin.title}</h5>
                            <p className="text-muted small">{booking.cabin.location}</p>

                            <div className="booking-dates">
                              <div className="date-item">
                                <span className="label">Check-in:</span>
                                <span>{new Date(booking.checkIn).toLocaleDateString()}</span>
                              </div>
                              <div className="date-item">
                                <span className="label">Check-out:</span>
                                <span>{new Date(booking.checkOut).toLocaleDateString()}</span>
                              </div>
                            </div>

                            <div className="booking-footer mt-3">
                              <div>
                                <strong className="price">${booking.totalPrice}</strong>
                              </div>
                              <span className={`badge bg-${booking.status === 'confirmed' ? 'success' : booking.status === 'pending' ? 'warning' : 'danger'}`}>
                                {booking.status === 'confirmed' ? '✓ Confirmada' : booking.status === 'pending' ? '⏳ Pendiente' : '✗ Cancelada'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="alert alert-info">
                    📭 No tienes reservas aún. <a href="/cabins">Explora nuestras cabañas</a>
                  </div>
                )}
              </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <div className="card">
                <div className="card-header bg-light">
                  <h5 className="mb-0">Cambiar Contraseña</h5>
                </div>
                <div className="card-body">
                  {!showPasswordForm ? (
                    <button
                      className="btn btn-warning"
                      onClick={() => setShowPasswordForm(true)}
                    >
                      🔐 Cambiar Contraseña
                    </button>
                  ) : (
                    <div>
                      <div className="mb-3">
                        <label className="form-label">Contraseña Actual</label>
                        <input
                          type="password"
                          className="form-control"
                          value={passwords.currentPassword}
                          onChange={(e) =>
                            setPasswords({ ...passwords, currentPassword: e.target.value })
                          }
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Nueva Contraseña</label>
                        <input
                          type="password"
                          className="form-control"
                          value={passwords.newPassword}
                          onChange={(e) =>
                            setPasswords({ ...passwords, newPassword: e.target.value })
                          }
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Confirmar Contraseña</label>
                        <input
                          type="password"
                          className="form-control"
                          value={passwords.confirmPassword}
                          onChange={(e) =>
                            setPasswords({ ...passwords, confirmPassword: e.target.value })
                          }
                        />
                      </div>
                      <div className="gap-2 d-flex">
                        <button className="btn btn-primary" onClick={changePassword}>
                          ✓ Cambiar Contraseña
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={() => setShowPasswordForm(false)}
                        >
                          ✗ Cancelar
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

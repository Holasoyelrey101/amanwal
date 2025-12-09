import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeSelector } from '../components/ThemeSelector';
import apiClient from '../api/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faEye, faXmark, faTrash, faMagnifyingGlass, faCalendarAlt, faUser, faHome, faDollarSign, faPlus } from '@fortawesome/free-solid-svg-icons';
import './admin.css';
import './admin-list.css';

interface Cabin {
  id: string;
  title: string;
}

interface Booking {
  id: string;
  bookingNumber: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: string;
  cabin: Cabin;
  user: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface ManualBookingForm {
  userId: string;
  cabinId: string;
  checkIn: string;
  checkOut: string;
  totalPrice: string;
  status: 'pending' | 'confirmed';
}

export const AdminBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);
  const [deletingBookingId, setDeletingBookingId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [cabins, setCabins] = useState<Cabin[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [creatingBooking, setCreatingBooking] = useState(false);
  const [createError, setCreateError] = useState('');
  const [formData, setFormData] = useState<ManualBookingForm>({
    userId: '',
    cabinId: '',
    checkIn: '',
    checkOut: '',
    totalPrice: '',
    status: 'confirmed'
  });
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
    fetchCabinsAndUsers();
  }, []);

  const fetchCabinsAndUsers = async () => {
    try {
      const [cabinsRes, usersRes] = await Promise.all([
        apiClient.get('/admin/cabins'),
        apiClient.get('/admin/users')
      ]);
      setCabins(cabinsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Error al obtener cabañas y usuarios:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await apiClient.get('/admin/bookings');
      setBookings(response.data);
    } catch (error) {
      console.error('Error al obtener reservas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBooking = async (id: string) => {
    setDeletingBookingId(id);
  };

  const confirmDelete = async () => {
    if (!deletingBookingId) return;
    try {
      await apiClient.delete(`/bookings/${deletingBookingId}`);
      setBookings(bookings.filter((b) => b.id !== deletingBookingId));
      setDeletingBookingId(null);
    } catch (error) {
      console.error('Error al eliminar reserva:', error);
      setDeletingBookingId(null);
    }
  };

  const handleCancelBooking = (booking: Booking) => {
    setCancellingBookingId(booking.id);
  };

  const confirmCancel = async () => {
    if (!cancellingBookingId) return;
    try {
      const response = await apiClient.patch(`/bookings/${cancellingBookingId}/cancel`, {});
      setBookings(bookings.map(b => b.id === cancellingBookingId ? response.data : b));
      setCancellingBookingId(null);
    } catch (error) {
      console.error('Error al cancelar reserva:', error);
      setCancellingBookingId(null);
    }
  };

  const handleCreateBooking = async () => {
    setCreateError('');
    
    if (!formData.userId || !formData.cabinId || !formData.checkIn || !formData.checkOut || !formData.totalPrice) {
      setCreateError('Por favor completa todos los campos');
      return;
    }

    // Validar que checkOut sea posterior a checkIn
    if (new Date(formData.checkOut) <= new Date(formData.checkIn)) {
      setCreateError('La fecha de salida debe ser posterior a la de entrada');
      return;
    }

    setCreatingBooking(true);
    try {
      const response = await apiClient.post('/admin/bookings', {
        userId: formData.userId,
        cabinId: formData.cabinId,
        checkIn: new Date(formData.checkIn).toISOString(),
        checkOut: new Date(formData.checkOut).toISOString(),
        totalPrice: parseFloat(formData.totalPrice),
        status: formData.status
      });

      setBookings([response.data.booking, ...bookings]);
      setShowCreateModal(false);
      setFormData({
        userId: '',
        cabinId: '',
        checkIn: '',
        checkOut: '',
        totalPrice: '',
        status: 'confirmed'
      });
    } catch (error: any) {
      console.error('Error al crear reserva:', error);
      setCreateError(error.response?.data?.error || 'Error al crear la reserva');
    } finally {
      setCreatingBooking(false);
    }
  };

  let filteredBookings = bookings.filter(
    (booking) =>
      booking.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.cabin.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filterStatus !== 'all') {
    filteredBookings = filteredBookings.filter((b) => b.status === filterStatus);
  }

  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  const getStatusBadge = (status: string) => {
    const statusClasses: { [key: string]: string } = {
      pending: 'pending',
      confirmed: 'confirmed',
      cancelled: 'cancelled',
      completed: 'success',
    };
    return statusClasses[status] || 'secondary';
  };

  if (loading) return (
    <div className="admin-list-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="admin-list-loading"></div>
    </div>
  );

  return (
    <div className="admin-list-container">
      <ThemeSelector />
      
      <div className="admin-list-content">
        <div className="admin-list-header">
          <div>
            <h1><FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '12px' }} />Gestión de Reservas</h1>
            <p>Administra todas las reservas del sistema</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="admin-btn primary" onClick={() => setShowCreateModal(true)}>
              <FontAwesomeIcon icon={faPlus} /> Agregar Reserva
            </button>
            <button className="admin-btn secondary" onClick={() => navigate('/admin')}>
              <FontAwesomeIcon icon={faArrowLeft} /> Volver
            </button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="admin-list-panel">
          <div className="admin-list-search-box">
            <div className="admin-list-search-input">
              <FontAwesomeIcon icon={faMagnifyingGlass} className="admin-list-search-icon" />
              <input
                type="text"
                placeholder="Buscar por número, usuario o cabaña..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="admin-list-search-filters">
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">📊 Todos los estados</option>
                <option value="pending">⏳ Pendiente</option>
                <option value="confirmed">✅ Confirmada</option>
                <option value="cancelled">❌ Cancelada</option>
                <option value="completed">🏁 Completada</option>
              </select>
            </div>
          </div>
          <p className="admin-list-results-info">
            📊 Total de reservas: <strong>{filteredBookings.length}</strong>
          </p>
        </div>

        {/* Bookings Table */}
        <div className="admin-list-table-container">
          <div className="table-responsive">
            <table className="admin-list-table">
              <thead>
                <tr>
                  <th>🔢 Número</th>
                  <th><FontAwesomeIcon icon={faUser} /> Usuario</th>
                  <th><FontAwesomeIcon icon={faHome} /> Cabaña</th>
                  <th>📍 Check-in</th>
                  <th>📍 Check-out</th>
                  <th><FontAwesomeIcon icon={faDollarSign} /> Total</th>
                  <th>📊 Estado</th>
                  <th><FontAwesomeIcon icon={faCalendarAlt} /> Reserva</th>
                  <th>⚙️ Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBookings.length > 0 ? (
                  paginatedBookings.map((booking) => (
                    <tr key={booking.id} className="admin-list-table-row">
                      <td><strong>{booking.bookingNumber}</strong></td>
                      <td>
                        <div className="owner-info">
                          <strong>{booking.user.name}</strong>
                          <small>{booking.user.email}</small>
                        </div>
                      </td>
                      <td>{booking.cabin.title}</td>
                      <td>{new Date(booking.checkIn).toLocaleDateString()}</td>
                      <td>{new Date(booking.checkOut).toLocaleDateString()}</td>
                      <td className="price-cell">${booking.totalPrice.toLocaleString()}</td>
                      <td>
                        <span className={`admin-list-badge ${getStatusBadge(booking.status)}`}>
                          {booking.status === 'pending' && '⏳ Pendiente'}
                          {booking.status === 'confirmed' && '✅ Confirmada'}
                          {booking.status === 'cancelled' && '❌ Cancelada'}
                          {booking.status === 'completed' && '🏁 Completada'}
                        </span>
                      </td>
                      <td>{new Date(booking.createdAt).toLocaleDateString()}</td>
                      <td className="actions-cell">
                        {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                          <>
                            <button
                              className="admin-btn primary sm"
                              onClick={() => setEditingBooking(booking)}
                            >
                              <FontAwesomeIcon icon={faEye} /> Ver
                            </button>
                            <button
                              className="admin-btn secondary sm"
                              onClick={() => handleCancelBooking(booking)}
                            >
                              <FontAwesomeIcon icon={faXmark} /> Cancelar
                            </button>
                          </>
                        )}
                        {booking.status === 'cancelled' && (
                          <button
                            className="admin-btn danger sm"
                            onClick={() => handleDeleteBooking(booking.id)}
                          >
                            <FontAwesomeIcon icon={faTrash} /> Eliminar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '30px' }}>
                      <div className="admin-list-empty-state">
                        <div className="empty-state-icon">📅</div>
                        <h3>No hay reservas</h3>
                        <p>No se encontraron reservas con esos criterios de búsqueda</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="admin-list-pagination">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="admin-list-pagination-btn"
            >
              ← Anterior
            </button>
            <span className="admin-list-pagination-info">
              Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="admin-list-pagination-btn"
            >
              Siguiente →
            </button>
          </div>
        )}

        {/* View Booking Modal */}
        {editingBooking && (
          <div className="admin-list-modal-overlay" onClick={() => setEditingBooking(null)}>
            <div className="admin-list-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="admin-list-modal-header">
                <h2 className="admin-list-modal-title">📋 Detalles de la Reserva</h2>
                <button className="admin-list-modal-close" onClick={() => setEditingBooking(null)}>×</button>
              </div>
              
              <div className="admin-list-modal-body">
                <div style={{ display: 'grid', gap: '16px' }}>
                  <div>
                    <label>Número de Reserva</label>
                    <input type="text" value={editingBooking.bookingNumber} disabled className="admin-form-control" />
                  </div>
                  <div>
                    <label>Usuario</label>
                    <input type="text" value={`${editingBooking.user.name} (${editingBooking.user.email})`} disabled className="admin-form-control" />
                  </div>
                  <div>
                    <label>Cabaña</label>
                    <input type="text" value={editingBooking.cabin.title} disabled className="admin-form-control" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label>Check-in</label>
                      <input 
                        type="text" 
                        value={new Date(editingBooking.checkIn).toLocaleDateString()}
                        disabled 
                        className="admin-form-control"
                      />
                    </div>
                    <div>
                      <label>Check-out</label>
                      <input 
                        type="text" 
                        value={new Date(editingBooking.checkOut).toLocaleDateString()}
                        disabled 
                        className="admin-form-control"
                      />
                    </div>
                  </div>
                  <div>
                    <label>Precio Total</label>
                    <input type="text" value={`$${editingBooking.totalPrice.toLocaleString()}`} disabled className="admin-form-control" />
                  </div>
                </div>
              </div>

              <div className="admin-list-modal-footer">
                <button className="admin-btn secondary" onClick={() => setEditingBooking(null)}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Booking Modal */}
        {cancellingBookingId && (
          <div className="admin-list-modal-overlay" onClick={() => setCancellingBookingId(null)}>
            <div className="admin-list-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="admin-list-modal-header">
                <h2 className="admin-list-modal-title">⚠️ Cancelar Reserva</h2>
                <button className="admin-list-modal-close" onClick={() => setCancellingBookingId(null)}>×</button>
              </div>
              <div className="admin-list-modal-body">
                <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '0' }}>
                  ¿Estás seguro de que quieres cancelar esta reserva? El usuario será <strong>notificado por correo</strong> sobre la cancelación.
                </p>
              </div>
              <div className="admin-list-modal-footer">
                <button className="admin-btn secondary" onClick={() => setCancellingBookingId(null)}>
                  No, mantener
                </button>
                <button className="admin-btn danger" onClick={confirmCancel}>
                  Sí, cancelar reserva
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Booking Modal */}
        {deletingBookingId && (
          <div className="admin-list-modal-overlay" onClick={() => setDeletingBookingId(null)}>
            <div className="admin-list-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="admin-list-modal-header">
                <h2 className="admin-list-modal-title">🗑️ Eliminar Reserva</h2>
                <button className="admin-list-modal-close" onClick={() => setDeletingBookingId(null)}>×</button>
              </div>
              <div className="admin-list-modal-body">
                <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '0' }}>
                  ⚠️ ¿Estás seguro de que quieres eliminar esta reserva? Esta acción <strong>no se puede deshacer</strong>.
                </p>
              </div>
              <div className="admin-list-modal-footer">
                <button className="admin-btn secondary" onClick={() => setDeletingBookingId(null)}>
                  Cancelar
                </button>
                <button className="admin-btn danger" onClick={confirmDelete}>
                  Confirmar Eliminación
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Manual Booking Modal */}
        {showCreateModal && (
          <div className="admin-list-modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="admin-list-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="admin-list-modal-header">
                <h2 className="admin-list-modal-title">➕ Crear Reserva Manual</h2>
                <button className="admin-list-modal-close" onClick={() => setShowCreateModal(false)}>×</button>
              </div>
              
              <div className="admin-list-modal-body">
                {createError && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid #ef4444',
                    color: '#ef4444',
                    padding: '12px',
                    borderRadius: '6px',
                    marginBottom: '16px',
                    fontSize: '14px'
                  }}>
                    ⚠️ {createError}
                  </div>
                )}
                
                <div style={{ display: 'grid', gap: '16px' }}>
                  <div>
                    <label>👤 Usuario *</label>
                    <select
                      value={formData.userId}
                      onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                      className="admin-form-control"
                    >
                      <option value="">Seleccionar usuario...</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label>🏠 Cabaña *</label>
                    <select
                      value={formData.cabinId}
                      onChange={(e) => setFormData({ ...formData, cabinId: e.target.value })}
                      className="admin-form-control"
                    >
                      <option value="">Seleccionar cabaña...</option>
                      {cabins.map(cabin => (
                        <option key={cabin.id} value={cabin.id}>
                          {cabin.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label>📍 Check-in *</label>
                      <input
                        type="date"
                        value={formData.checkIn}
                        onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                        className="admin-form-control"
                      />
                    </div>
                    <div>
                      <label>📍 Check-out *</label>
                      <input
                        type="date"
                        value={formData.checkOut}
                        onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                        className="admin-form-control"
                      />
                    </div>
                  </div>

                  <div>
                    <label>💰 Precio Total (CLP) *</label>
                    <input
                      type="number"
                      value={formData.totalPrice}
                      onChange={(e) => setFormData({ ...formData, totalPrice: e.target.value })}
                      placeholder="0"
                      className="admin-form-control"
                      min="0"
                      step="1000"
                    />
                  </div>

                  <div>
                    <label>📊 Estado *</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'pending' | 'confirmed' })}
                      className="admin-form-control"
                    >
                      <option value="pending">⏳ Pendiente</option>
                      <option value="confirmed">✅ Confirmada</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="admin-list-modal-footer">
                <button 
                  className="admin-btn secondary" 
                  onClick={() => setShowCreateModal(false)}
                  disabled={creatingBooking}
                >
                  Cancelar
                </button>
                <button 
                  className="admin-btn primary" 
                  onClick={handleCreateBooking}
                  disabled={creatingBooking}
                >
                  {creatingBooking ? '⏳ Creando...' : '✅ Crear Reserva'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

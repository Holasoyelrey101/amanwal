import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ThemeSelector } from '../components/ThemeSelector';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faEye, faXmark, faTrash, faMagnifyingGlass, faCalendarAlt, faUser, faHome, faDollarSign } from '@fortawesome/free-solid-svg-icons';
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

export const AdminBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);
  const [deletingBookingId, setDeletingBookingId] = useState<string | null>(null);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/admin/bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/api/bookings/${deletingBookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      const token = localStorage.getItem('token');
      const response = await axios.patch(`http://localhost:3000/api/bookings/${cancellingBookingId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(bookings.map(b => b.id === cancellingBookingId ? response.data : b));
      setCancellingBookingId(null);
    } catch (error) {
      console.error('Error al cancelar reserva:', error);
      setCancellingBookingId(null);
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
          <button className="admin-btn secondary" onClick={() => navigate('/admin')}>
            <FontAwesomeIcon icon={faArrowLeft} /> Volver
          </button>
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
      </div>
    </div>
  );
};

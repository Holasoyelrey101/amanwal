import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ThemeSelector } from '../components/ThemeSelector';
import '../styles/admin-themes.css';

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
      pending: 'bg-warning',
      confirmed: 'bg-success',
      cancelled: 'bg-danger',
      completed: 'bg-info',
    };
    return statusClasses[status] || 'bg-secondary';
  };

  if (loading) return <div className="text-center py-5">Cargando reservas...</div>;

  return (
    <div className="admin-container">
      <ThemeSelector />
      <div className="admin-header">
        <h2>Gestión de Reservas</h2>
        <div className="header-buttons">
          <button className="btn btn-secondary" onClick={() => navigate('/admin')}>
            ← Volver al Dashboard
          </button>
        </div>
      </div>

      <div className="search-section">
        <div className="search-filters">
          <input
            type="text"
            placeholder="Buscar por número, usuario o cabaña..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="form-control search-input"
          />
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="form-select"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="confirmed">Confirmada</option>
            <option value="cancelled">Cancelada</option>
            <option value="completed">Completada</option>
          </select>
        </div>
        <p className="results-info">
          Total de reservas: <strong>{filteredBookings.length}</strong>
        </p>
      </div>

      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Número</th>
              <th>Usuario</th>
              <th>Cabaña</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Fecha de Reserva</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedBookings.map((booking) => (
              <tr key={booking.id}>
                <td className="booking-number">{booking.bookingNumber}</td>
                <td>
                  <div className="user-info">
                    <p className="mb-0">{booking.user.name}</p>
                    <small>{booking.user.email}</small>
                  </div>
                </td>
                <td>{booking.cabin.title}</td>
                <td>{new Date(booking.checkIn).toLocaleDateString()}</td>
                <td>{new Date(booking.checkOut).toLocaleDateString()}</td>
                <td>${booking.totalPrice.toLocaleString()}</td>
                <td>
                  <span className={`badge ${getStatusBadge(booking.status)}`}>
                    {booking.status}
                  </span>
                </td>
                <td>{new Date(booking.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                      <>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => setEditingBooking(booking)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-sm btn-warning"
                          onClick={() => handleCancelBooking(booking)}
                        >
                          Cancelar
                        </button>
                      </>
                    )}
                    {booking.status === 'cancelled' && (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteBooking(booking.id)}
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          <span>
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </button>
        </div>
      )}

      {editingBooking && (
        <div className="modal-overlay" onClick={() => setEditingBooking(null)}>
          <div className="modal-edit-booking" onClick={(e) => e.stopPropagation()}>
            <h3>✏️ Editar Reserva</h3>
            <div className="booking-edit-form">
              <div className="form-group">
                <label>Número de Reserva:</label>
                <input type="text" value={editingBooking.bookingNumber} disabled />
              </div>
              <div className="form-group">
                <label>Check-in:</label>
                <input 
                  type="date" 
                  value={new Date(editingBooking.checkIn).toISOString().split('T')[0]}
                  disabled 
                />
              </div>
              <div className="form-group">
                <label>Check-out:</label>
                <input 
                  type="date" 
                  value={new Date(editingBooking.checkOut).toISOString().split('T')[0]}
                  disabled 
                />
              </div>
              <div className="form-group">
                <label>Total:</label>
                <input type="number" value={editingBooking.totalPrice} disabled />
              </div>
              <div className="modal-buttons">
                <button className="btn btn-secondary" onClick={() => setEditingBooking(null)}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {cancellingBookingId && (
        <div className="modal-overlay" onClick={() => setCancellingBookingId(null)}>
          <div className="modal-delete" onClick={(e) => e.stopPropagation()}>
            <h3>⚠️ Cancelar Reserva</h3>
            <p>¿Estás seguro de que quieres cancelar esta reserva? El usuario será notificado por correo.</p>
            <div className="modal-delete-buttons">
              <button className="btn btn-secondary" onClick={() => setCancellingBookingId(null)}>
                No, mantener
              </button>
              <button className="btn btn-warning" onClick={confirmCancel}>
                Sí, cancelar reserva
              </button>
            </div>
          </div>
        </div>
      )}

      {deletingBookingId && (
        <div className="modal-overlay" onClick={() => setDeletingBookingId(null)}>
          <div className="modal-delete" onClick={(e) => e.stopPropagation()}>
            <h3>⚠️ Eliminar Reserva</h3>
            <p>¿Estás seguro de que quieres eliminar esta reserva? Esta acción no se puede deshacer.</p>
            <div className="modal-delete-buttons">
              <button className="btn btn-secondary" onClick={() => setDeletingBookingId(null)}>
                Cancelar
              </button>
              <button className="btn btn-danger" onClick={confirmDelete}>
                Eliminar reserva
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

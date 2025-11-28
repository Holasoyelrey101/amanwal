import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import AddCabinModal from '../components/AddCabinModal';
import { EditCabinModal } from '../components/EditCabinModal';
import './admin.css';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  _count: {
    cabins: number;
    bookings: number;
  };
}

interface Cabin {
  id: string;
  title: string;
  location: string;
  price: number;
  description: string;
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string;
  images: string[];
  owner: {
    name: string;
    email: string;
  };
  _count: {
    bookings: number;
    reviews: number;
  };
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
}

interface DashboardStats {
  totalUsers: number;
  totalCabins: number;
  totalBookings: number;
  totalReviews: number;
}

const API_URL = 'http://localhost:3000/api';

export const AdminDashboard: React.FC = () => {
  const { token, isAdmin } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [cabins, setCabins] = useState<Cabin[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'cabins' | 'bookings'>('dashboard');
  const [loading, setLoading] = useState(false);
  const [showAddCabinModal, setShowAddCabinModal] = useState(false);
  const [selectedCabinForEdit, setSelectedCabinForEdit] = useState<Cabin | null>(null);
  const [selectedBookingForEdit, setSelectedBookingForEdit] = useState<Booking | null>(null);
  const [editBookingData, setEditBookingData] = useState({
    checkIn: '',
    checkOut: '',
    totalPrice: 0,
    status: 'confirmed'
  });

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!isAdmin) return;
    loadDashboard();
  }, [isAdmin]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/admin/stats`, { headers });
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
      alert('Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/admin/users`, { headers });
      setUsers(response.data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      alert('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const loadCabins = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/admin/cabins`, { headers });
      setCabins(response.data);
    } catch (error) {
      console.error('Error al cargar cabañas:', error);
      alert('Error al cargar cabañas');
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/admin/bookings`, { headers });
      setBookings(response.data);
    } catch (error) {
      console.error('Error al cargar reservas:', error);
      alert('Error al cargar reservas');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: 'dashboard' | 'users' | 'cabins' | 'bookings') => {
    setActiveTab(tab);
    if (tab === 'users') loadUsers();
    if (tab === 'cabins') loadCabins();
    if (tab === 'bookings') loadBookings();
    if (tab === 'dashboard') loadDashboard();
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      await axios.patch(
        `${API_URL}/admin/users/${userId}/role`,
        { userId, role: newRole },
        { headers }
      );
      alert('Rol actualizado exitosamente');
      loadUsers();
    } catch (error) {
      console.error('Error al actualizar rol:', error);
      alert('Error al actualizar rol');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) return;
    try {
      await axios.delete(`${API_URL}/admin/users/${userId}`, { headers });
      alert('Usuario eliminado');
      loadUsers();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      alert('Error al eliminar usuario');
    }
  };

  const deleteCabin = async (cabinId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta cabaña?')) return;
    try {
      await axios.delete(`${API_URL}/admin/cabins/${cabinId}`, { headers });
      alert('Cabaña eliminada');
      loadCabins();
    } catch (error) {
      console.error('Error al eliminar cabaña:', error);
      alert('Error al eliminar cabaña');
    }
  };

  const cancelBooking = async (bookingId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta reserva?')) return;
    try {
      await axios.patch(`${API_URL}/bookings/${bookingId}/cancel`, {}, { headers });
      alert('Reserva cancelada');
      loadBookings();
    } catch (error) {
      console.error('Error al cancelar reserva:', error);
      alert('Error al cancelar reserva');
    }
  };

  const confirmBooking = async (bookingId: string) => {
    try {
      await axios.patch(`${API_URL}/admin/bookings/${bookingId}/confirm`, {}, { headers });
      alert('Reserva confirmada');
      loadBookings();
    } catch (error) {
      console.error('Error al confirmar reserva:', error);
      alert('Error al confirmar reserva');
    }
  };

  const handleEditBooking = (booking: Booking) => {
    setSelectedBookingForEdit(booking);
    setEditBookingData({
      checkIn: booking.checkIn.split('T')[0],
      checkOut: booking.checkOut.split('T')[0],
      totalPrice: booking.totalPrice,
      status: booking.status
    });
  };

  const saveBookingChanges = async () => {
    if (!selectedBookingForEdit) return;

    try {
      await axios.patch(
        `${API_URL}/admin/bookings/${selectedBookingForEdit.id}`,
        editBookingData,
        { headers }
      );
      alert('Reserva actualizada');
      setSelectedBookingForEdit(null);
      loadBookings();
    } catch (error) {
      console.error('Error al actualizar reserva:', error);
      alert('Error al actualizar reserva');
    }
  };

  if (!isAdmin) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          ❌ No tienes permisos para acceder al panel de administración
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="container-fluid py-4">
        <h1 className="mb-4">📊 Panel de Administración</h1>

        {/* Tabs */}
        <ul className="nav nav-tabs mb-4" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => handleTabChange('dashboard')}
            >
              Dashboard
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => handleTabChange('users')}
            >
              Usuarios
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'cabins' ? 'active' : ''}`}
              onClick={() => handleTabChange('cabins')}
            >
              Cabañas
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'bookings' ? 'active' : ''}`}
              onClick={() => handleTabChange('bookings')}
            >
              Reservas
            </button>
          </li>
        </ul>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="tab-content">
            {loading ? (
              <div className="text-center">Cargando...</div>
            ) : stats ? (
              <div className="row">
                <div className="col-md-3 mb-3">
                  <div className="card bg-primary text-white">
                    <div className="card-body">
                      <h5 className="card-title">Usuarios</h5>
                      <p className="card-text display-4">{stats.totalUsers}</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="card bg-success text-white">
                    <div className="card-body">
                      <h5 className="card-title">Cabañas</h5>
                      <p className="card-text display-4">{stats.totalCabins}</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="card bg-info text-white">
                    <div className="card-body">
                      <h5 className="card-title">Reservas</h5>
                      <p className="card-text display-4">{stats.totalBookings}</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="card bg-warning text-white">
                    <div className="card-body">
                      <h5 className="card-title">Comentarios</h5>
                      <p className="card-text display-4">{stats.totalReviews}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="alert alert-danger">Error al cargar estadísticas</div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="tab-content">
            {loading ? (
              <div className="text-center">Cargando...</div>
            ) : users.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Rol</th>
                      <th>Cabañas</th>
                      <th>Reservas</th>
                      <th>Miembro desde</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`badge bg-${user.role === 'admin' ? 'danger' : 'secondary'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>{user._count.cabins}</td>
                        <td>{user._count.bookings}</td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-warning me-2"
                            onClick={() =>
                              updateUserRole(user.id, user.role === 'admin' ? 'user' : 'admin')
                            }
                          >
                            {user.role === 'admin' ? 'Quitar Admin' : 'Hacer Admin'}
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => deleteUser(user.id)}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="alert alert-info">No hay usuarios</div>
            )}
          </div>
        )}

        {/* Cabins Tab */}
        {activeTab === 'cabins' && (
          <div className="tab-content">
            <div className="mb-3">
              <button
                className="btn btn-primary"
                onClick={() => setShowAddCabinModal(true)}
              >
                ➕ Agregar Nueva Cabaña
              </button>
            </div>
            {loading ? (
              <div className="text-center">Cargando...</div>
            ) : cabins.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th>Título</th>
                      <th>Ubicación</th>
                      <th>Precio</th>
                      <th>Dueño</th>
                      <th>Reservas</th>
                      <th>Comentarios</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cabins.map((cabin) => (
                      <tr key={cabin.id}>
                        <td>{cabin.title}</td>
                        <td>{cabin.location}</td>
                        <td>${cabin.price}/noche</td>
                        <td>
                          {cabin.owner.name} ({cabin.owner.email})
                        </td>
                        <td>{cabin._count.bookings}</td>
                        <td>{cabin._count.reviews}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-warning me-2"
                            onClick={() => setSelectedCabinForEdit(cabin)}
                          >
                            Editar
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => deleteCabin(cabin.id)}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="alert alert-info">No hay cabañas</div>
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="tab-content">
            {loading ? (
              <div className="text-center">Cargando...</div>
            ) : bookings.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th>Nº Reserva</th>
                      <th>Cabaña</th>
                      <th>Huésped</th>
                      <th>Email</th>
                      <th>Entrada</th>
                      <th>Salida</th>
                      <th>Total</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id}>
                        <td><strong>{booking.bookingNumber}</strong></td>
                        <td>{booking.cabin.title}</td>
                        <td>{booking.user.name}</td>
                        <td>{booking.user.email}</td>
                        <td>{new Date(booking.checkIn).toLocaleDateString()}</td>
                        <td>{new Date(booking.checkOut).toLocaleDateString()}</td>
                        <td>${booking.totalPrice.toLocaleString()}</td>
                        <td>
                          <span className={`badge bg-${
                            booking.status === 'confirmed' ? 'success' : 
                            booking.status === 'pending' ? 'warning' : 'danger'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-warning me-2"
                            onClick={() => handleEditBooking(booking)}
                          >
                            Editar
                          </button>
                          {booking.status === 'pending' && (
                            <button
                              className="btn btn-sm btn-success me-2"
                              onClick={() => confirmBooking(booking.id)}
                            >
                              Confirmar
                            </button>
                          )}
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => cancelBooking(booking.id)}
                          >
                            Cancelar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="alert alert-info">No hay reservas</div>
            )}
          </div>
        )}

        <AddCabinModal
          isOpen={showAddCabinModal}
          onClose={() => setShowAddCabinModal(false)}
          onCabinCreated={loadCabins}
        />
        <EditCabinModal
          isOpen={selectedCabinForEdit !== null}
          onClose={() => setSelectedCabinForEdit(null)}
          onCabinUpdated={loadCabins}
          cabin={selectedCabinForEdit}
        />

        {/* Edit Booking Modal */}
        {selectedBookingForEdit && (
          <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Editar Reserva</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setSelectedBookingForEdit(null)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Nº de Reserva</label>
                    <input
                      type="text"
                      className="form-control"
                      value={selectedBookingForEdit.bookingNumber}
                      disabled
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">ID Interno</label>
                    <input
                      type="text"
                      className="form-control"
                      value={selectedBookingForEdit.id}
                      disabled
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Cabaña</label>
                    <input
                      type="text"
                      className="form-control"
                      value={selectedBookingForEdit.cabin.title}
                      disabled
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Huésped</label>
                    <input
                      type="text"
                      className="form-control"
                      value={selectedBookingForEdit.user.name}
                      disabled
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Fecha de Entrada</label>
                    <input
                      type="date"
                      className="form-control"
                      value={editBookingData.checkIn}
                      onChange={(e) =>
                        setEditBookingData({ ...editBookingData, checkIn: e.target.value })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Fecha de Salida</label>
                    <input
                      type="date"
                      className="form-control"
                      value={editBookingData.checkOut}
                      onChange={(e) =>
                        setEditBookingData({ ...editBookingData, checkOut: e.target.value })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Precio Total</label>
                    <input
                      type="number"
                      className="form-control"
                      value={editBookingData.totalPrice}
                      onChange={(e) =>
                        setEditBookingData({
                          ...editBookingData,
                          totalPrice: parseFloat(e.target.value)
                        })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Estado</label>
                    <select
                      className="form-control"
                      value={editBookingData.status}
                      onChange={(e) =>
                        setEditBookingData({ ...editBookingData, status: e.target.value })
                      }
                    >
                      <option value="pending">Pendiente</option>
                      <option value="confirmed">Confirmada</option>
                      <option value="cancelled">Cancelada</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setSelectedBookingForEdit(null)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={saveBookingChanges}
                  >
                    Guardar Cambios
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

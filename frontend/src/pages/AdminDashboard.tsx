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
  // Nuevos estados para búsqueda y paginación
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [bookingsPerPage] = useState(10);
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    show: false,
    title: '',
    message: '',
    onConfirm: () => {}
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
      // Ordenar de más nueva a más antigua
      const sortedBookings = response.data.sort((a: Booking, b: Booking) => {
        return new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime();
      });
      setBookings(sortedBookings);
      setCurrentPage(1); // Reset a la primera página
    } catch (error) {
      console.error('Error al cargar reservas:', error);
      alert('Error al cargar reservas');
    } finally {
      setLoading(false);
    }
  };

  // Función para filtrar reservas
  const getFilteredBookings = () => {
    if (!searchQuery.trim()) {
      return bookings;
    }

    const query = searchQuery.toLowerCase();
    return bookings.filter((booking) => {
      const bookingNumber = booking.bookingNumber.toLowerCase();
      const userName = booking.user.name.toLowerCase();
      const cabinTitle = booking.cabin.title.toLowerCase();
      const checkIn = new Date(booking.checkIn).toLocaleDateString('es-ES');

      return (
        bookingNumber.includes(query) ||
        userName.includes(query) ||
        cabinTitle.includes(query) ||
        checkIn.includes(query)
      );
    });
  };

  // Calcular paginación
  const filteredBookings = getFilteredBookings();
  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);
  const startIndex = (currentPage - 1) * bookingsPerPage;
  const endIndex = startIndex + bookingsPerPage;
  const currentBookings = filteredBookings.slice(startIndex, endIndex);

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
    setConfirmModal({
      show: true,
      title: '⚠️ Eliminar Usuario',
      message: '¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.',
      onConfirm: async () => {
        try {
          await axios.delete(`${API_URL}/admin/users/${userId}`, { headers });
          alert('Usuario eliminado');
          loadUsers();
          setConfirmModal({ ...confirmModal, show: false });
        } catch (error) {
          console.error('Error al eliminar usuario:', error);
          alert('Error al eliminar usuario');
        }
      }
    });
  };

  const deleteCabin = async (cabinId: string) => {
    setConfirmModal({
      show: true,
      title: '🗑️ Eliminar Cabaña',
      message: '¿Estás seguro de que deseas eliminar esta cabaña? Esta acción no se puede deshacer.',
      onConfirm: async () => {
        try {
          await axios.delete(`${API_URL}/admin/cabins/${cabinId}`, { headers });
          alert('Cabaña eliminada');
          loadCabins();
          setConfirmModal({ ...confirmModal, show: false });
        } catch (error) {
          console.error('Error al eliminar cabaña:', error);
          alert('Error al eliminar cabaña');
          setConfirmModal({ ...confirmModal, show: false });
        }
      }
    });
  };

  const cancelBooking = async (bookingId: string) => {
    setConfirmModal({
      show: true,
      title: '❌ Cancelar Reserva',
      message: '¿Estás seguro de que deseas cancelar esta reserva? Esta acción no se puede deshacer.',
      onConfirm: async () => {
        try {
          setLoading(true);
          await axios.patch(`${API_URL}/bookings/${bookingId}/cancel`, {}, { headers });
          setTimeout(() => {
            loadBookings();
          }, 500);
          alert('Reserva cancelada');
          setConfirmModal({ ...confirmModal, show: false });
        } catch (error) {
          console.error('Error al cancelar reserva:', error);
          alert('Error al cancelar reserva');
          setConfirmModal({ ...confirmModal, show: false });
          setLoading(false);
        }
      }
    });
  };

  const deleteBooking = async (bookingId: string) => {
    setConfirmModal({
      show: true,
      title: '🗑️ Eliminar Reserva',
      message: '¿Estás seguro de que deseas eliminar esta reserva cancelada? Esta acción no se puede deshacer.',
      onConfirm: async () => {
        try {
          setLoading(true);
          await axios.delete(`${API_URL}/bookings/${bookingId}`, { headers });
          setTimeout(() => {
            loadBookings();
          }, 500);
          alert('Reserva eliminada');
          setConfirmModal({ ...confirmModal, show: false });
        } catch (error) {
          console.error('Error al eliminar reserva:', error);
          alert('Error al eliminar reserva');
          setConfirmModal({ ...confirmModal, show: false });
          setLoading(false);
        }
      }
    });
  };

  const confirmBooking = async (bookingId: string) => {
    try {
      setLoading(true);
      await axios.patch(`${API_URL}/admin/bookings/${bookingId}/confirm`, {}, { headers });
      // Pequeño delay para asegurar que la BD se actualiza
      setTimeout(() => {
        loadBookings();
      }, 500);
      alert('Reserva confirmada');
    } catch (error) {
      console.error('Error al confirmar reserva:', error);
      alert('Error al confirmar reserva');
      setLoading(false);
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
              📈 Dashboard
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => handleTabChange('users')}
            >
              👥 Usuarios
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'cabins' ? 'active' : ''}`}
              onClick={() => handleTabChange('cabins')}
            >
              🏠 Cabañas
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'bookings' ? 'active' : ''}`}
              onClick={() => handleTabChange('bookings')}
            >
              📅 Reservas
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
                  <div className="card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none' }}>
                    <div className="card-body">
                      <h5 className="card-title">👥 Usuarios Registrados</h5>
                      <p className="card-text display-4">{stats.totalUsers}</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', border: 'none' }}>
                    <div className="card-body">
                      <h5 className="card-title">🏠 Cabañas Publicadas</h5>
                      <p className="card-text display-4">{stats.totalCabins}</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="card" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', border: 'none' }}>
                    <div className="card-body">
                      <h5 className="card-title">📅 Reservas Activas</h5>
                      <p className="card-text display-4">{stats.totalBookings}</p>
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
            {/* Barra de búsqueda y filtros */}
            <div className="mb-4">
              <div className="row">
                <div className="col-md-12">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="🔍 Buscar por número de reserva, nombre, cabaña o fecha..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1); // Reset a primera página cuando se busca
                    }}
                  />
                  {searchQuery && (
                    <small className="text-muted">
                      Se encontraron {filteredBookings.length} resultado(s)
                    </small>
                  )}
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center">Cargando...</div>
            ) : filteredBookings.length > 0 ? (
              <>
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
                      {currentBookings.map((booking) => (
                        <tr key={booking.id}>
                          <td><strong>{booking.bookingNumber}</strong></td>
                          <td>{booking.cabin.title}</td>
                          <td>{booking.user.name}</td>
                          <td>{booking.user.email}</td>
                          <td>{new Date(booking.checkIn).toLocaleDateString()}</td>
                          <td>{new Date(booking.checkOut).toLocaleDateString()}</td>
                          <td>${booking.totalPrice.toLocaleString('es-ES')}</td>
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
                            {booking.status !== 'cancelled' && (
                              <button
                                className="btn btn-sm btn-danger me-2"
                                onClick={() => cancelBooking(booking.id)}
                              >
                                Cancelar
                              </button>
                            )}
                            {booking.status === 'cancelled' && (
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => deleteBooking(booking.id)}
                              >
                                🗑️ Eliminar
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="d-flex justify-content-between align-items-center mt-4">
                    <div>
                      <small className="text-muted">
                        Mostrando {startIndex + 1} - {Math.min(endIndex, filteredBookings.length)} de {filteredBookings.length} reservas
                      </small>
                    </div>
                    <nav aria-label="Page navigation">
                      <ul className="pagination mb-0">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                          >
                            Primera
                          </button>
                        </li>
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                          >
                            Anterior
                          </button>
                        </li>

                        {/* Números de página */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                          // Mostrar solo páginas cercanas a la actual
                          if (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          ) {
                            return (
                              <li
                                key={page}
                                className={`page-item ${currentPage === page ? 'active' : ''}`}
                              >
                                <button
                                  className="page-link"
                                  onClick={() => setCurrentPage(page)}
                                >
                                  {page}
                                </button>
                              </li>
                            );
                          } else if (
                            (page === 2 && currentPage > 3) ||
                            (page === totalPages - 1 && currentPage < totalPages - 2)
                          ) {
                            return (
                              <li key={page} className="page-item disabled">
                                <span className="page-link">...</span>
                              </li>
                            );
                          }
                          return null;
                        })}

                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                          >
                            Siguiente
                          </button>
                        </li>
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                          >
                            Última
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                )}
              </>
            ) : (
              <div className="alert alert-info">No hay reservas {searchQuery && `que coincidan con "${searchQuery}"`}</div>
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

        {/* Confirmation Modal */}
        {confirmModal.show && (
          <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{confirmModal.title}</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setConfirmModal({ ...confirmModal, show: false })}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>{confirmModal.message}</p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setConfirmModal({ ...confirmModal, show: false })}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={confirmModal.onConfirm}
                  >
                    Eliminar
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

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ThemeSelector } from '../components/ThemeSelector';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faEdit, faTrash, faPlus, faMagnifyingGlass, faCrown, faUser, faEnvelope, faCalendarAlt, faHome, faClock, faChevronLeft, faChevronRight, faUsers, faLock } from '@fortawesome/free-solid-svg-icons';
import './admin.css';
import './admin-list.css';

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

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', password: '', makeAdmin: false });
  const [showEditModal, setShowEditModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ show: boolean; message: string; action: () => void } | null>(null);
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const itemsPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      password: '',
      makeAdmin: user.role === 'admin',
    });
    setShowEditModal(true);
  };

  const handleSaveChanges = async () => {
    if (!editingUser) return;

    try {
      const token = localStorage.getItem('token');
      const updateData: any = {
        name: editForm.name,
        email: editForm.email,
      };

      if (editForm.password) {
        updateData.password = editForm.password;
      }

      if (editForm.makeAdmin !== (editingUser.role === 'admin')) {
        updateData.role = editForm.makeAdmin ? 'admin' : 'user';
      }

      const response = await axios.patch(
        `http://localhost:3000/api/admin/users/${editingUser.id}`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers(users.map(u => u.id === editingUser.id ? response.data : u));
      
      const currentUser = localStorage.getItem('user');
      if (currentUser) {
        const parsedUser = JSON.parse(currentUser);
        if (parsedUser.id === editingUser.id && editForm.makeAdmin !== (editingUser.role === 'admin')) {
          if (refreshUser) {
            await refreshUser();
          }
          window.location.reload();
        }
      }

      setShowEditModal(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      alert('Error al actualizar usuario');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter(u => u.id !== userId));
      setConfirmModal(null);
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      alert('Error al eliminar usuario');
      setConfirmModal(null);
    }
  };

  const handleAdminChange = async (user: User, makeAdmin: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `http://localhost:3000/api/admin/users/${user.id}`,
        { role: makeAdmin ? 'admin' : 'user' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Asegurar que la respuesta tenga _count
      const updatedUser = response.data;
      if (!updatedUser._count) {
        updatedUser._count = user._count || { cabins: 0, bookings: 0 };
      }

      setUsers(users.map(u => u.id === user.id ? updatedUser : u));

      const currentUser = localStorage.getItem('user');
      if (currentUser) {
        const parsedUser = JSON.parse(currentUser);
        if (parsedUser.id === user.id) {
          if (refreshUser) {
            await refreshUser();
          }
          window.location.reload();
        }
      }
    } catch (error) {
      console.error('Error al actualizar rol:', error);
      alert('Error al actualizar rol del usuario');
      setConfirmModal(null);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

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
            <h1><FontAwesomeIcon icon={faUsers} style={{ marginRight: '12px' }} />Gestión de Usuarios</h1>
            <p>Administra todos los usuarios del sistema</p>
          </div>
          <button className="admin-btn secondary" onClick={() => navigate('/admin')}>
            <FontAwesomeIcon icon={faArrowLeft} /> Volver
          </button>
        </div>

        {/* Search & Filter Panel */}
        <div className="admin-list-panel">
          <div className="admin-list-search-box">
            <div className="admin-list-search-input">
              <FontAwesomeIcon icon={faMagnifyingGlass} className="admin-list-search-icon" />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.currentTarget.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
          <p className="admin-list-results-info">
            📊 Total de usuarios: <strong>{filteredUsers.length}</strong>
          </p>
        </div>

        {/* Users Table - Premium Style */}
        <div className="admin-list-table-container">
          <div className="table-responsive">
            <table className="admin-list-table">
              <thead>
                <tr>
                  <th><FontAwesomeIcon icon={faEnvelope} /> Email</th>
                  <th><FontAwesomeIcon icon={faUser} /> Nombre</th>
                  <th><FontAwesomeIcon icon={faCrown} /> Rol</th>
                  <th><FontAwesomeIcon icon={faCalendarAlt} /> Registro</th>
                  <th><FontAwesomeIcon icon={faHome} /> Cabañas</th>
                  <th><FontAwesomeIcon icon={faClock} /> Reservas</th>
                  <th>⚙️ Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <tr key={user.id} className="admin-list-table-row">
                    <td>{user.email}</td>
                    <td>{user.name}</td>
                    <td>
                      <span className={`admin-list-badge ${(user.role || 'user').toLowerCase()}`}>
                        <FontAwesomeIcon icon={user.role === 'admin' ? faCrown : faUser} />
                        {user.role === 'admin' ? 'Admin' : 'Usuario'}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="text-center">{user._count?.cabins || 0}</td>
                    <td className="text-center">{user._count?.bookings || 0}</td>
                    <td className="actions-cell">
                      <button
                        className="admin-btn primary sm"
                        onClick={() => handleEditClick(user)}
                      >
                        <FontAwesomeIcon icon={faEdit} /> Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {paginatedUsers.length === 0 && (
            <div className="admin-list-empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3>No hay usuarios</h3>
              <p>No se encontraron usuarios con esos criterios de búsqueda</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="admin-list-pagination">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="admin-list-pagination-btn"
            >
              <FontAwesomeIcon icon={faChevronLeft} /> Anterior
            </button>
            <span className="admin-list-pagination-info">
              Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="admin-list-pagination-btn"
            >
              Siguiente <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && editingUser && (
        <div className="admin-list-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="admin-list-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="admin-list-modal-header">
              <h2 className="admin-list-modal-title">✏️ Editar Usuario</h2>
              <button className="admin-list-modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            
            <div className="admin-list-modal-body">
              <div className="admin-form-group">
                <label><FontAwesomeIcon icon={faUser} /> Nombre</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.currentTarget.value })}
                  className="admin-form-control"
                />
              </div>

              <div className="admin-form-group">
                <label><FontAwesomeIcon icon={faEnvelope} /> Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.currentTarget.value })}
                  className="admin-form-control"
                />
              </div>

              <div className="admin-form-group">
                <label><FontAwesomeIcon icon={faLock} /> Nueva Contraseña</label>
                <input
                  type="password"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.currentTarget.value })}
                  className="admin-form-control"
                  placeholder="Dejar en blanco para no cambiar"
                />
              </div>
            </div>

            {/* Admin Controls */}
            <div className="admin-list-modal-admin-controls">
              <p className="admin-list-modal-controls-title">🛡️ Controles de Administrador</p>
              <div className="admin-list-modal-controls-buttons">
                {editingUser.role !== 'admin' ? (
                  <button
                    className="admin-btn success sm"
                    onClick={() => {
                      setConfirmModal({
                        show: true,
                        message: `¿Quieres hacer a <strong>${editingUser.name}</strong> administrador? Tendrá acceso total al sistema.`,
                        action: () => {
                          handleAdminChange(editingUser, true);
                          setShowEditModal(false);
                          setConfirmModal(null);
                        }
                      });
                    }}
                  >
                    👑 Hacer Admin
                  </button>
                ) : (
                  <button
                    className="admin-btn secondary sm"
                    onClick={() => {
                      setConfirmModal({
                        show: true,
                        message: `¿Quieres quitar los permisos de administrador de <strong>${editingUser.name}</strong>?`,
                        action: () => {
                          handleAdminChange(editingUser, false);
                          setShowEditModal(false);
                          setConfirmModal(null);
                        }
                      });
                    }}
                  >
                    ⭐ Quitar Admin
                  </button>
                )}
                <button
                  className="admin-btn danger sm"
                  onClick={() => {
                    setConfirmModal({
                      show: true,
                      message: `⚠️ <strong>ADVERTENCIA:</strong> ¿Estás SEGURO de que quieres ELIMINAR a <strong>${editingUser.name}</strong>? Esta acción NO se puede deshacer.`,
                      action: () => {
                        handleDeleteUser(editingUser.id);
                        setShowEditModal(false);
                        setConfirmModal(null);
                      }
                    });
                  }}
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>

            <div className="admin-list-modal-footer">
              <button
                className="admin-btn secondary"
                onClick={() => setShowEditModal(false)}
              >
                Cancelar
              </button>
              <button
                className="admin-btn primary"
                onClick={handleSaveChanges}
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal?.show && (
        <div className="admin-list-modal-overlay" onClick={() => setConfirmModal(null)}>
          <div className="admin-list-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="admin-list-modal-header">
              <h2 className="admin-list-modal-title">⚠️ Confirmación</h2>
              <button className="admin-list-modal-close" onClick={() => setConfirmModal(null)}>×</button>
            </div>
            <div className="admin-list-modal-body">
              <p 
                style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '20px' }}
                dangerouslySetInnerHTML={{ __html: confirmModal.message }}
              />
            </div>
            <div className="admin-list-modal-footer">
              <button
                className="admin-btn secondary"
                onClick={() => setConfirmModal(null)}
              >
                Cancelar
              </button>
              <button
                className="admin-btn danger"
                onClick={confirmModal.action}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


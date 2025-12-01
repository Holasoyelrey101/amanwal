import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ThemeSelector } from '../components/ThemeSelector';
import { useAuth } from '../context/AuthContext';
import '../styles/admin-themes.css';

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
    setShowMenu(null);
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

      // Actualizar la lista de usuarios
      setUsers(users.map(u => u.id === editingUser.id ? response.data : u));
      
      // Si estoy editando mi propio usuario y cambié el rol, recargar
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

      setUsers(users.map(u => u.id === user.id ? response.data : u));

      // Si estoy editando mi propio usuario y cambié el rol, recargar
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

  if (loading) return <div className="text-center py-5">Cargando usuarios...</div>;

  return (
    <div className="admin-container">
      <ThemeSelector />
      <div className="admin-header">
        <h2>Gestión de Usuarios</h2>
        <div className="header-buttons">
          <button className="btn btn-secondary" onClick={() => navigate('/admin')}>
            ← Volver al Dashboard
          </button>
        </div>
      </div>

      <div className="search-section">
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.currentTarget.value);
            setCurrentPage(1);
          }}
          className="form-control search-input"
        />
        <p className="results-info">
          Total de usuarios: <strong>{filteredUsers.length}</strong>
        </p>
      </div>

      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Nombre</th>
              <th>Rol</th>
              <th>Fecha de Registro</th>
              <th>Cabañas</th>
              <th>Reservas</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>{user.name}</td>
                <td>
                  <span className={`role-badge role-${user.role.toLowerCase()}`}>
                    {user.role}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="text-center">{user._count.cabins}</td>
                <td className="text-center">{user._count.bookings}</td>
                <td>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => handleEditClick(user)}
                  >
                    ✎ Editar
                  </button>
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

      {/* Modal para editar usuario */}
      {showEditModal && editingUser && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '20px', color: '#333' }}>Editar Usuario</h3>
            
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#555' }}>
                Nombre
              </label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.currentTarget.value })}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#555' }}>
                Email
              </label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.currentTarget.value })}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#555' }}>
                Nueva Contraseña (dejar en blanco para no cambiar)
              </label>
              <input
                type="password"
                value={editForm.password}
                onChange={(e) => setEditForm({ ...editForm, password: e.currentTarget.value })}
                className="form-control"
                placeholder="Nueva contraseña"
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginBottom: '20px' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setShowEditModal(false)}
              >
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSaveChanges}
              >
                Guardar Cambios
              </button>
            </div>

            <hr style={{ margin: '20px 0', borderColor: '#555' }} />

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-start', flexWrap: 'wrap' }}>
              {editingUser.role !== 'admin' ? (
                <button
                  className="btn btn-sm"
                  onClick={() => {
                    setConfirmModal({
                      show: true,
                      message: `¿Estás seguro de que quieres hacer a ${editingUser.name} administrador?`,
                      action: () => {
                        handleAdminChange(editingUser, true);
                        setShowEditModal(false);
                        setConfirmModal(null);
                      }
                    });
                  }}
                  style={{
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '6px 12px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '500'
                  }}
                >
                  👑 Hacer Admin
                </button>
              ) : (
                <button
                  className="btn btn-sm"
                  onClick={() => {
                    setConfirmModal({
                      show: true,
                      message: `¿Estás seguro de que quieres quitar los permisos de administrador de ${editingUser.name}?`,
                      action: () => {
                        handleAdminChange(editingUser, false);
                        setShowEditModal(false);
                        setConfirmModal(null);
                      }
                    });
                  }}
                  style={{
                    backgroundColor: '#ffc107',
                    color: '#333',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '6px 12px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '500'
                  }}
                >
                  ⭐ Quitar Admin
                </button>
              )}
              <button
                className="btn btn-sm"
                onClick={() => {
                  setConfirmModal({
                    show: true,
                    message: `¿Estás SEGURO de que quieres ELIMINAR a ${editingUser.name}? Esta acción NO se puede deshacer.`,
                    action: () => {
                      handleDeleteUser(editingUser.id);
                      setShowEditModal(false);
                      setConfirmModal(null);
                    }
                  });
                }}
                style={{
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500'
                }}
              >
                🗑️ Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación */}
      {confirmModal?.show && (
        <div className="modal-overlay" onClick={() => setConfirmModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '20px', color: '#333' }}>Confirmación</h3>
            <p style={{ marginBottom: '30px', color: '#666', fontSize: '16px', lineHeight: '1.5' }}>
              {confirmModal.message}
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setConfirmModal(null)}
              >
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={confirmModal.action}
                style={{
                  backgroundColor: '#dc3545',
                  borderColor: '#dc3545'
                }}
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

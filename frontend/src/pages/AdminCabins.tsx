import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AddCabinModal from '../components/AddCabinModal';
import { EditCabinModal } from '../components/EditCabinModal';
import { ThemeSelector } from '../components/ThemeSelector';
import apiClient from '../api/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faEdit, faTrash, faPlus, faMagnifyingGlass, faHome, faMapPin, faDollarSign } from '@fortawesome/free-solid-svg-icons';
import './admin.css';
import './admin-list.css';

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

export const AdminCabins: React.FC = () => {
  const [cabins, setCabins] = useState<Cabin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCabin, setEditingCabin] = useState<Cabin | null>(null);
  const [deletingCabinId, setDeletingCabinId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    fetchCabins();
  }, []);

  const fetchCabins = async () => {
    try {
      const response = await apiClient.get('/admin/cabins');
      setCabins(response.data);
    } catch (error) {
      console.error('Error al obtener cabañas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCabin = async (id: string) => {
    setDeletingCabinId(id);
  };

  const confirmDelete = async () => {
    if (!deletingCabinId) return;
    try {
      await apiClient.delete(`/admin/cabins/${deletingCabinId}`);
      setCabins(cabins.filter((c) => c.id !== deletingCabinId));
      setDeletingCabinId(null);
    } catch (error) {
      console.error('Error al eliminar cabaña:', error);
      setDeletingCabinId(null);
    }
  };

  const filteredCabins = cabins.filter(
    (cabin) =>
      cabin.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cabin.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedCabins = filteredCabins.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredCabins.length / itemsPerPage);

  if (loading) return (
    <div className="admin-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="loading-spinner"></div>
    </div>
  );

  return (
    <div className="admin-list-container">
      <ThemeSelector />
      
      <div className="admin-list-content">
        <div className="admin-list-header">
          <div>
            <h1><FontAwesomeIcon icon={faHome} style={{ marginRight: '12px' }} />Gestión de Cabañas</h1>
            <p>Administra todas las propiedades del sistema</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="admin-btn success" onClick={() => setShowAddModal(true)}>
              <FontAwesomeIcon icon={faPlus} /> Agregar Cabaña
            </button>
            <button className="admin-btn secondary" onClick={() => navigate('/admin')}>
              <FontAwesomeIcon icon={faArrowLeft} /> Volver
            </button>
          </div>
        </div>

        {/* Search Section */}
        <div className="admin-list-panel">
          <div className="admin-list-search-box">
            <div className="admin-list-search-input">
              <FontAwesomeIcon icon={faMagnifyingGlass} className="admin-list-search-icon" />
              <input
                type="text"
                placeholder="Buscar por título o ubicación..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
          <p className="admin-list-results-info">
            📊 Total de cabañas: <strong>{filteredCabins.length}</strong>
          </p>
        </div>

        {/* Cabins Table */}
        <div className="admin-list-table-container">
          <div className="table-responsive">
            <table className="admin-list-table">
              <thead>
                <tr>
                  <th><FontAwesomeIcon icon={faHome} /> Título</th>
                  <th><FontAwesomeIcon icon={faMapPin} /> Ubicación</th>
                  <th><FontAwesomeIcon icon={faDollarSign} /> Precio</th>
                  <th>👥 Capacidad</th>
                  <th>👤 Propietario</th>
                  <th>📅 Reservas</th>
                  <th>⭐ Reseñas</th>
                  <th>⚙️ Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCabins.length > 0 ? (
                  paginatedCabins.map((cabin) => (
                    <tr key={cabin.id} className="admin-list-table-row">
                      <td><strong>{cabin.title}</strong></td>
                      <td>{cabin.location}</td>
                      <td className="price-cell">${cabin.price.toLocaleString()}</td>
                      <td className="text-center">{cabin.capacity} personas</td>
                      <td>
                        <div className="owner-info">
                          <strong>{cabin.owner.name}</strong>
                          <small>{cabin.owner.email}</small>
                        </div>
                      </td>
                      <td className="text-center">{cabin._count.bookings}</td>
                      <td className="text-center">{cabin._count.reviews}</td>
                      <td className="actions-cell">
                        <button
                          className="admin-btn primary sm"
                          onClick={() => setEditingCabin(cabin)}
                        >
                          <FontAwesomeIcon icon={faEdit} /> Editar
                        </button>
                        <button
                          className="admin-btn danger sm"
                          onClick={() => handleDeleteCabin(cabin.id)}
                        >
                          <FontAwesomeIcon icon={faTrash} /> Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '30px' }}>
                      <div className="admin-list-empty-state">
                        <div className="empty-state-icon">🏠</div>
                        <h3>No hay cabañas</h3>
                        <p>No se encontraron cabañas con esos criterios de búsqueda</p>
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
      </div>

      {/* Add Cabin Modal */}
      {showAddModal && (
        <AddCabinModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onCabinCreated={() => {
            fetchCabins();
            setShowAddModal(false);
          }}
        />
      )}

      {/* Edit Cabin Modal */}
      {editingCabin && (
        <EditCabinModal
          isOpen={!!editingCabin}
          cabin={editingCabin}
          onClose={() => setEditingCabin(null)}
          onCabinUpdated={() => {
            fetchCabins();
            setEditingCabin(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingCabinId && (
        <div className="admin-list-modal-overlay" onClick={() => setDeletingCabinId(null)}>
          <div className="admin-list-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="admin-list-modal-header">
              <h2 className="admin-list-modal-title">🗑️ Confirmar eliminación</h2>
              <button className="admin-list-modal-close" onClick={() => setDeletingCabinId(null)}>×</button>
            </div>
            <div className="admin-list-modal-body">
              <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '0' }}>
                ⚠️ ¿Estás seguro de que quieres eliminar esta cabaña? Esta acción <strong>no se puede deshacer</strong>.
              </p>
            </div>
            <div className="admin-list-modal-footer">
              <button className="admin-btn secondary" onClick={() => setDeletingCabinId(null)}>
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
  );
};

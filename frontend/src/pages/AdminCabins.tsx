import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AddCabinModal from '../components/AddCabinModal';
import { EditCabinModal } from '../components/EditCabinModal';
import { ThemeSelector } from '../components/ThemeSelector';
import '../styles/admin-themes.css';

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
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/admin/cabins', {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/api/admin/cabins/${deletingCabinId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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

  if (loading) return <div className="text-center py-5">Cargando cabañas...</div>;

  return (
    <div className="admin-container">
      <ThemeSelector />
      <div className="admin-header">
        <h2>Gestión de Cabañas</h2>
        <div className="header-buttons">
          <button className="btn btn-success" onClick={() => setShowAddModal(true)}>
            + Agregar Cabaña
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/admin')}>
            ← Volver al Dashboard
          </button>
        </div>
      </div>

      <div className="search-section">
        <input
          type="text"
          placeholder="Buscar por título o ubicación..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="form-control search-input"
        />
        <p className="results-info">
          Total de cabañas: <strong>{filteredCabins.length}</strong>
        </p>
      </div>

      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Ubicación</th>
              <th>Precio</th>
              <th>Capacidad</th>
              <th>Propietario</th>
              <th>Reservas</th>
              <th>Reseñas</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCabins.map((cabin) => (
              <tr key={cabin.id}>
                <td className="cabin-title">{cabin.title}</td>
                <td>{cabin.location}</td>
                <td>${cabin.price.toLocaleString()}</td>
                <td>{cabin.capacity} personas</td>
                <td>
                  <div className="owner-info">
                    <p className="mb-0">{cabin.owner.name}</p>
                    <small>{cabin.owner.email}</small>
                  </div>
                </td>
                <td className="text-center">{cabin._count.bookings}</td>
                <td className="text-center">{cabin._count.reviews}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => setEditingCabin(cabin)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteCabin(cabin.id)}
                    >
                      Eliminar
                    </button>
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

      {deletingCabinId && (
        <div className="modal-overlay" onClick={() => setDeletingCabinId(null)}>
          <div className="modal-delete" onClick={(e) => e.stopPropagation()}>
            <h3>⚠️ Confirmar eliminación</h3>
            <p>¿Estás seguro de que quieres eliminar esta cabaña? Esta acción no se puede deshacer.</p>
            <div className="modal-delete-buttons">
              <button className="btn btn-secondary" onClick={() => setDeletingCabinId(null)}>
                Cancelar
              </button>
              <button className="btn btn-danger" onClick={confirmDelete}>
                Eliminar cabaña
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { cabinAPI } from '../api';
import './cabin-list.css';

interface Cabin {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  images: string[];
}

export const CabinList: React.FC = () => {
  const [cabins, setCabins] = useState<Cabin[]>([]);
  const [filteredCabins, setFilteredCabins] = useState<Cabin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [selectedCapacity, setSelectedCapacity] = useState(0);
  const [sortBy, setSortBy] = useState('popular');

  useEffect(() => {
    const fetchCabins = async () => {
      try {
        const response = await cabinAPI.getAll();
        const cabinsWithParsedImages = response.data.map((cabin: any) => ({
          ...cabin,
          images: typeof cabin.images === 'string' ? JSON.parse(cabin.images) : cabin.images || []
        }));
        setCabins(cabinsWithParsedImages);
        setFilteredCabins(cabinsWithParsedImages);
      } catch (err) {
        setError('Error al cargar las cabañas');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCabins();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    let result = cabins.filter(cabin => {
      const matchSearch = cabin.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cabin.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchPrice = cabin.price >= priceRange[0] && cabin.price <= priceRange[1];
      const matchCapacity = selectedCapacity === 0 || cabin.capacity >= selectedCapacity;
      return matchSearch && matchPrice && matchCapacity;
    });

    // Ordenar
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    setFilteredCabins(result);
  }, [searchTerm, priceRange, selectedCapacity, sortBy, cabins]);

  if (loading) {
    return (
      <div className="cabin-list-loading">
        <div className="spinner"></div>
        <p>Cargando cabañas...</p>
      </div>
    );
  }

  return (
    <div className="cabin-list-container">
      {/* Header Section */}
      <div className="cabin-list-header">
        <div className="header-content">
          <h1 className="header-title">Descubre Nuestras Cabañas</h1>
          <p className="header-subtitle">Encuentra tu refugio perfecto</p>
        </div>
      </div>

      <div className="cabin-list-wrapper">
        {/* Sidebar Filters */}
        <aside className="filters-sidebar">
          <div className="filters-header">
            <h3>Filtros</h3>
            <button 
              className="reset-filters"
              onClick={() => {
                setSearchTerm('');
                setPriceRange([0, 500000]);
                setSelectedCapacity(0);
                setSortBy('popular');
              }}
            >
              Limpiar
            </button>
          </div>

          {/* Search */}
          <div className="filter-group">
            <label className="filter-label">Buscar</label>
            <input
              type="text"
              className="search-input"
              placeholder="Nombre o ubicación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Price Range */}
          <div className="filter-group">
            <label className="filter-label">Precio por Noche</label>
            <div className="price-range-display">
              ${priceRange[0].toLocaleString('es-ES')} - ${priceRange[1].toLocaleString('es-ES')}
            </div>
            <input
              type="range"
              min="0"
              max="500000"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
              className="range-slider"
            />
          </div>

          {/* Capacity */}
          <div className="filter-group">
            <label className="filter-label">Capacidad Mínima</label>
            <div className="capacity-options">
              {[0, 2, 4, 6, 8].map(cap => (
                <button
                  key={cap}
                  className={`capacity-btn ${selectedCapacity === cap ? 'active' : ''}`}
                  onClick={() => setSelectedCapacity(cap)}
                >
                  {cap === 0 ? 'Todas' : `${cap}+ personas`}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div className="filter-group">
            <label className="filter-label">Ordenar Por</label>
            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="popular">Más Populares</option>
              <option value="price-low">Precio: Menor a Mayor</option>
              <option value="price-high">Precio: Mayor a Menor</option>
              <option value="name">Nombre A-Z</option>
            </select>
          </div>
        </aside>

        {/* Main Content */}
        <main className="cabins-main">
          {error && <div className="error-message">{error}</div>}

          <div className="results-info">
            <p>{filteredCabins.length} cabaña{filteredCabins.length !== 1 ? 's' : ''} encontrada{filteredCabins.length !== 1 ? 's' : ''}</p>
          </div>

          {filteredCabins.length === 0 ? (
            <div className="no-results">
              <i className="fa fa-search"></i>
              <h3>No se encontraron cabañas</h3>
              <p>Intenta ajustar tus filtros</p>
            </div>
          ) : (
            <div className="cabins-grid">
              {filteredCabins.map((cabin, index) => (
                <div key={cabin.id} className="cabin-card" style={{ animationDelay: `${index * 0.05}s` }}>
                  <div className="cabin-image-wrapper">
                    {cabin.images && cabin.images[0] ? (
                      <img
                        src={cabin.images[0]}
                        alt={cabin.title}
                        className="cabin-image"
                        onError={(e) => console.error('Error cargando imagen:', e)}
                      />
                    ) : (
                      <div className="cabin-image-placeholder">
                        <i className="fa fa-image"></i>
                      </div>
                    )}
                    <div className="cabin-price-badge">${cabin.price.toLocaleString('es-ES')}</div>
                    <div className="cabin-overlay">
                      <a href={`/cabins/${cabin.id}`} className="view-details-btn">
                        Ver Detalles
                      </a>
                    </div>
                  </div>

                  <div className="cabin-info">
                    <h3 className="cabin-title">{cabin.title}</h3>
                    
                    <div className="cabin-location">
                      <i className="fa fa-map-marker"></i>
                      <span>{cabin.location}</span>
                    </div>

                    <p className="cabin-description">
                      {cabin.description.substring(0, 80)}...
                    </p>

                    <div className="cabin-features">
                      <div className="feature">
                        <i className="fa fa-users"></i>
                        <span>{cabin.capacity} personas</span>
                      </div>
                      <div className="feature">
                        <i className="fa fa-bed"></i>
                        <span>{cabin.bedrooms} dorm.</span>
                      </div>
                      <div className="feature">
                        <i className="fa fa-shower"></i>
                        <span>{cabin.bathrooms} baños</span>
                      </div>
                    </div>

                    <a
                      href={`/cabins/${cabin.id}`}
                      className="btn-book-now"
                    >
                      <span>Reservar Ahora</span>
                      <i className="fa fa-arrow-right"></i>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

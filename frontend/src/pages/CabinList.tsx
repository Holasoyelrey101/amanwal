import React, { useEffect, useState } from 'react';
import { cabinAPI } from '../api';
import './CabinList.css';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCabins = async () => {
      try {
        const response = await cabinAPI.getAll();
        const cabinsWithParsedImages = response.data.map((cabin: any) => ({
          ...cabin,
          images: typeof cabin.images === 'string' ? JSON.parse(cabin.images) : cabin.images || []
        }));
        console.log('Cabinas cargadas:', cabinsWithParsedImages);
        console.log('Primera imagen:', cabinsWithParsedImages[0]?.images?.[0]?.substring(0, 50));
        setCabins(cabinsWithParsedImages);
      } catch (err) {
        setError('Error al cargar las cabañas');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCabins();
  }, []);

  if (loading) return <div className="container py-5 text-center">Cargando...</div>;
  if (error) return <div className="container py-5 alert alert-danger">{error}</div>;

  return (
    <div className="container py-5">
      <h1 className="mb-4">Nuestras Cabañas</h1>
      <div className="row g-4">
        {cabins.map(cabin => (
          <div key={cabin.id} className="col-md-6 col-lg-4">
            <div className="card h-100">
              {cabin.images && cabin.images[0] ? (
                <div className="cabin-card-image">
                  <img 
                    src={cabin.images[0]} 
                    alt={cabin.title}
                    className="cabin-card-img"
                    onError={(e) => console.error('Error cargando imagen:', e)}
                  />
                </div>
              ) : (
                <div className="cabin-card-image" style={{background: '#ddd'}}>
                  <span style={{color: '#999'}}>Sin imagen</span>
                </div>
              )}
              <div className="card-body">
                <h5 className="card-title">{cabin.title}</h5>
                <p className="card-text text-muted"><i className="fa fa-map-marker"></i> {cabin.location}</p>
                <div className="mb-3">
                  <small className="text-muted d-block">
                    <i className="fa fa-users"></i> Capacidad maxima: {cabin.capacity} personas
                  </small>
                  <small className="text-muted d-block">
                    <i className="fa fa-bed"></i> Dormitorios: {cabin.bedrooms}
                  </small>
                  <small className="text-muted d-block">
                    <i className="fa fa-shower"></i> Baños: {cabin.bathrooms}
                  </small>
                </div>
                <div className="cabin-card-footer">
                  <span className="price">${cabin.price.toLocaleString('es-ES')}/noche</span>
                </div>
                <a
                  href={`/cabins/${cabin.id}`}
                  className="btn btn-primary w-100 mt-3"
                >
                  Ver Detalles
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

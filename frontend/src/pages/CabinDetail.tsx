import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { cabinAPI, reviewAPI } from '../api';
import { BookingCalendar } from '../components/BookingCalendar';
import './cabin-detail.css';

interface Cabin {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  images: string;
  amenities: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  user: {
    name: string;
  };
}

export const CabinDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [cabin, setCabin] = useState<Cabin | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [showBookingCalendar, setShowBookingCalendar] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const cabinResponse = await cabinAPI.getById(id);
        const cabinData = cabinResponse.data;
        setCabin(cabinData);

        // Parsear las imágenes
        let parsedImages: string[] = [];
        if (typeof cabinData.images === 'string') {
          try {
            parsedImages = JSON.parse(cabinData.images);
          } catch (e) {
            parsedImages = [];
          }
        } else if (Array.isArray(cabinData.images)) {
          parsedImages = cabinData.images;
        }
        setImages(parsedImages);

        const reviewsResponse = await reviewAPI.getCabinReviews(id);
        setReviews(reviewsResponse.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <div className="container py-5 text-center">Cargando...</div>;
  if (!cabin) return <div className="container py-5 alert alert-danger">Cabaña no encontrada</div>;

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 'Sin reseñas';

  return (
    <div className="cabin-detail-container">
      {/* Header con título y ubicación */}
      <div className="cabin-header-top">
        <div className="cabin-header-info">
          <h1>{cabin.title}</h1>
          <div className="cabin-location-badge">📍 {cabin.location}</div>
        </div>
        <button className="cabin-share-btn">Compartir</button>
      </div>

      {/* Galería de imágenes estilo Booking */}
      <div className="cabin-gallery-grid">
        {images.length > 0 && (
          <>
            {/* Imagen principal grande */}
            <div className="gallery-main-large" onClick={() => setShowLightbox(true)}>
              <img src={images[0]} alt={cabin.title} />
              <span className="gallery-counter">1/{images.length}</span>
            </div>

            {/* Miniaturas al lado */}
            <div className="gallery-thumbnails-vertical">
              {images.slice(1, 5).map((img, idx) => (
                <div 
                  key={idx + 1} 
                  className="gallery-thumb-item"
                  onClick={() => setCurrentImageIndex(idx + 1)}
                >
                  <img src={img} alt={`Imagen ${idx + 2}`} />
                </div>
              ))}
              {images.length > 5 && (
                <div className="gallery-thumb-item see-all" onClick={() => setShowLightbox(true)}>
                  <div className="see-all-overlay">
                    <span>Ver todos ({images.length})</span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Contenido principal */}
      <div className="cabin-main-content">
        {/* Lado izquierdo - Descripción */}
        <div className="cabin-description-section">
          <h2>Descripción</h2>
          <p>{cabin.description}</p>

          <h2 style={{ marginTop: '24px' }}>Características</h2>
          <div className="cabin-features-grid">
            <div className="feature-item">
              <span className="feature-icon">👥</span>
              <div>
                <div className="feature-label">Capacidad</div>
                <div className="feature-value">{cabin.capacity} personas</div>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🛏️</span>
              <div>
                <div className="feature-label">Dormitorios</div>
                <div className="feature-value">{cabin.bedrooms}</div>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🚿</span>
              <div>
                <div className="feature-label">Baños</div>
                <div className="feature-value">{cabin.bathrooms}</div>
              </div>
            </div>
          </div>

          <h2 style={{ marginTop: '24px' }}>Comodidades</h2>
          <p>{cabin.amenities}</p>
        </div>

        {/* Lado derecho - Card de reserva */}
        <div className="cabin-booking-sidebar">
          <div className="booking-card">
            <div className="price-section">
              <div className="price-display">
                <span className="currency">$</span>
                <span className="amount">{cabin.price}</span>
              </div>
              <div className="price-period">por noche</div>
            </div>

            <button className="reserve-button" onClick={() => setShowBookingCalendar(true)}>Reservar</button>
            <p className="reserve-note">Paga solo al confirmar</p>

            <div className="booking-features">
              <div className="booking-feature">✓ Confirmación inmediata</div>
              <div className="booking-feature">✓ Sin costos adicionales</div>
              <div className="booking-feature">✓ Cancelación flexible</div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {showLightbox && images.length > 0 && (
        <div className="lightbox-overlay" onClick={() => setShowLightbox(false)}>
          <div className="lightbox-container" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setShowLightbox(false)}>
              ✕
            </button>

            <img
              src={images[currentImageIndex]}
              alt={`${cabin.title} ampliada`}
              className="lightbox-image"
            />

            {images.length > 1 && (
              <button
                className="lightbox-nav lightbox-nav-prev"
                onClick={() => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)}
              >
                ‹
              </button>
            )}

            {images.length > 1 && (
              <button
                className="lightbox-nav lightbox-nav-next"
                onClick={() => setCurrentImageIndex((prev) => (prev + 1) % images.length)}
              >
                ›
              </button>
            )}

            {images.length > 1 && (
              <div className="lightbox-counter">
                {currentImageIndex + 1} / {images.length}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Booking Calendar Modal */}
      {showBookingCalendar && cabin && (
        <BookingCalendar 
          cabinId={cabin.id} 
          price={cabin.price}
          onClose={() => setShowBookingCalendar(false)}
        />
      )}
    </div>
  );
};

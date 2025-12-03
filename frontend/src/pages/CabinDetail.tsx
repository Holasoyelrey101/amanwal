import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { cabinAPI, reviewAPI } from '../api';
import { BookingCalendar } from '../components/BookingCalendar';
import './cabin-detail-new.css';

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
  const navigate = useNavigate();
  const [cabin, setCabin] = useState<Cabin | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [activeTab, setActiveTab] = useState('resumen');
  const [showServicesModal, setShowServicesModal] = useState(false);
  const [checkInDate, setCheckInDate] = useState<string>('');
  const [checkOutDate, setCheckOutDate] = useState<string>('');
  const [numberOfGuests, setNumberOfGuests] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');
  const [showBookingCalendar, setShowBookingCalendar] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

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

  if (loading) {
    return (
      <div className="cabin-detail-loading">
        <div className="spinner"></div>
        <p>Cargando detalles de la cabaña...</p>
      </div>
    );
  }

  if (!cabin) {
    return (
      <div className="cabin-detail-container">
        <div className="cabin-not-found">
          <i className="fa fa-exclamation-circle"></i>
          <h2>Cabaña no encontrada</h2>
          <p>La cabaña que buscas no existe o ha sido eliminada.</p>
          <button className="back-button" onClick={() => navigate('/cabins')}>
            <i className="fa fa-arrow-left"></i> Volver a Cabañas
          </button>
        </div>
      </div>
    );
  }

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 'Sin reseñas';

  // Calcular total de noches y precio total
  const calculateTotal = () => {
    if (!checkInDate || !checkOutDate) return null;
    
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    
    if (nights <= 0) return null;
    
    const total = nights * (cabin?.price || 0);
    return { nights, total };
  };

  const totalInfo = calculateTotal();

  const handleSubmitReview = async () => {
    if (reviewRating === 0) {
      alert('Por favor selecciona una calificación');
      return;
    }
    if (reviewComment.trim() === '') {
      alert('Por favor escribe un comentario');
      return;
    }

    try {
      setSubmittingReview(true);
      await reviewAPI.create({
        cabinId: id,
        rating: reviewRating,
        comment: reviewComment
      });

      // Recargar las reseñas
      const reviewsResponse = await reviewAPI.getCabinReviews(id!);
      setReviews(reviewsResponse.data);

      // Limpiar el formulario
      setReviewRating(0);
      setReviewComment('');
      setShowReviewForm(false);
      alert('¡Reseña enviada correctamente!');
    } catch (error) {
      console.error('Error al enviar reseña:', error);
      alert('Error al enviar la reseña');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="cabin-detail-container">
      {/* ===== HERO GALLERY SECTION ===== */}
      <div className="cabin-hero-gallery">
        <div className="gallery-main-container">
          {images.length > 0 ? (
            <>
              <div className="gallery-main" onClick={() => setShowLightbox(true)}>
                <img src={images[0]} alt={cabin.title} className="main-image" />
                <div className="gallery-overlay">
                  <i className="fa fa-expand"></i>
                  <span>Ampliar galería</span>
                </div>
                <div className="image-counter">
                  <i className="fa fa-image"></i> {images.length}
                </div>
              </div>
              <div className="gallery-thumbnails">
                {images.slice(1, 5).map((img, idx) => (
                  <div
                    key={idx + 1}
                    className="gallery-thumb"
                    onClick={() => { setCurrentImageIndex(idx + 1); setShowLightbox(true); }}
                  >
                    <img src={img} alt={`Imagen ${idx + 2}`} />
                  </div>
                ))}
                {images.length > 5 && (
                  <div className="gallery-thumb see-more" onClick={() => setShowLightbox(true)}>
                    <div className="see-more-overlay">
                      <i className="fa fa-plus"></i>
                      <span>{images.length - 5}</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="no-images-placeholder">
              <i className="fa fa-image"></i>
              <p>No hay imágenes disponibles</p>
            </div>
          )}
        </div>
      </div>

      {/* ===== HEADER INFO ===== */}
      <div className="cabin-header-info">
        <div className="header-content">
          <h1 className="cabin-title">{cabin.title}</h1>
          <div className="cabin-meta">
            <div className="meta-item">
              <i className="fa fa-map-marker"></i>
              <span>{cabin.location}</span>
            </div>
            <div className="meta-item">
              <i className="fa fa-star"></i>
              <span>{averageRating} • {reviews.length} reseñas</span>
            </div>
          </div>
        </div>

        <div className="header-price-card">
          <div className="price-display">
            <span className="currency">$</span>
            <span className="amount">{cabin.price.toLocaleString('es-ES')}</span>
            <span className="period">/noche</span>
          </div>
        </div>
      </div>

      {/* ===== QUICK FEATURES ===== */}
      <div className="cabin-quick-stats">
        <div className="stat">
          <i className="fa fa-bed"></i>
          <div>
            <div className="stat-value">{cabin.bedrooms}</div>
            <div className="stat-label">Habitación{cabin.bedrooms !== 1 ? 'es' : ''}</div>
          </div>
        </div>
        <div className="stat">
          <i className="fa fa-shower"></i>
          <div>
            <div className="stat-value">{cabin.bathrooms}</div>
            <div className="stat-label">Baño{cabin.bathrooms !== 1 ? 's' : ''}</div>
          </div>
        </div>
        <div className="stat">
          <i className="fa fa-users"></i>
          <div>
            <div className="stat-value">{cabin.capacity}</div>
            <div className="stat-label">Huéspedes</div>
          </div>
        </div>
      </div>

      {/* ===== CONTENT WRAPPER ===== */}
      <div className="cabin-content-wrapper">
        {/* LEFT: Main Content */}
        <div className="cabin-main-content">
          {/* Tabs */}
          <div className="cabin-tabs-nav">
            <button
              className={`tab-nav-btn ${activeTab === 'resumen' ? 'active' : ''}`}
              onClick={() => setActiveTab('resumen')}
            >
              <i className="fa fa-info-circle"></i> Resumen
            </button>
            <button
              className={`tab-nav-btn ${activeTab === 'servicios' ? 'active' : ''}`}
              onClick={() => setActiveTab('servicios')}
            >
              <i className="fa fa-check-circle"></i> Servicios
            </button>
            <button
              className={`tab-nav-btn ${activeTab === 'politicas' ? 'active' : ''}`}
              onClick={() => setActiveTab('politicas')}
            >
              <i className="fa fa-file-text"></i> Políticas
            </button>
            <button
              className={`tab-nav-btn ${activeTab === 'resenas' ? 'active' : ''}`}
              onClick={() => setActiveTab('resenas')}
            >
              <i className="fa fa-comments"></i> Reseñas ({reviews.length})
            </button>
          </div>

          {/* Tab Content */}
          <div className="cabin-tab-panes">
            {activeTab === 'resumen' && (
              <div className="tab-pane-content">
                <h2>Descripción</h2>
                <p className="description-text">{cabin.description}</p>

                <h2>Características principales</h2>
                <div className="features-showcase">
                  <div className="feature-card">
                    <i className="fa fa-home"></i>
                    <h3>Espacio cómodo</h3>
                    <p>Amplio espacio diseñado para tu comodidad y relajación</p>
                  </div>
                  <div className="feature-card">
                    <i className="fa fa-wifi"></i>
                    <h3>Conectividad</h3>
                    <p>WiFi de alta velocidad en toda la propiedad</p>
                  </div>
                  <div className="feature-card">
                    <i className="fa fa-utensils"></i>
                    <h3>Cocina equipada</h3>
                    <p>Cocina moderna con todos los electrodomésticos</p>
                  </div>
                  <div className="feature-card">
                    <i className="fa fa-shield"></i>
                    <h3>Seguridad 24/7</h3>
                    <p>Vigilancia y cerco con sistema de seguridad</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'servicios' && (
              <div className="tab-pane-content">
                <h2>Servicios disponibles</h2>
                <div className="services-grid">
                  <div className="service-card">
                    <i className="fa fa-car"></i>
                    <h3>Estacionamiento</h3>
                    <p>En la propiedad</p>
                  </div>
                  <div className="service-card">
                    <i className="fa fa-fire"></i>
                    <h3>Quincho</h3>
                    <p>Área BBQ completa</p>
                  </div>
                  <div className="service-card">
                    <i className="fa fa-tree"></i>
                    <h3>Jardín</h3>
                    <p>Espacios verdes</p>
                  </div>
                  <div className="service-card">
                    <i className="fa fa-tv"></i>
                    <h3>Entretenimiento</h3>
                    <p>TV y sistemas</p>
                  </div>
                  <div className="service-card">
                    <i className="fa fa-bed"></i>
                    <h3>Ropa de cama</h3>
                    <p>Frazadas incluidas</p>
                  </div>
                  <div className="service-card">
                    <i className="fa fa-gavel"></i>
                    <h3>Equipamiento</h3>
                    <p>Completo y moderno</p>
                  </div>
                </div>
                <button className="view-all-services" onClick={() => setShowServicesModal(true)}>
                  <i className="fa fa-list"></i> Ver todos los servicios
                </button>
              </div>
            )}

            {activeTab === 'politicas' && (
              <div className="tab-pane-content">
                <h2>Políticas de reservación</h2>
                <div className="policies-section">
                  <div className="policy-card">
                    <h3><i className="fa fa-check"></i> Confirmación</h3>
                    <p>La reserva se confirma con el pago del 100% de la estadía</p>
                  </div>
                  <div className="policy-card">
                    <h3><i className="fa fa-calendar"></i> Cambios</h3>
                    <p>Cambios permitidos con 7 días de anticipación sin costo adicional</p>
                  </div>
                  <div className="policy-card">
                    <h3><i className="fa fa-undo"></i> Cancelación</h3>
                    <p>• Más de 7 días: 100% de reembolso<br/>• 7-3 días: 50% de reembolso<br/>• Menos de 72h: Sin reembolso</p>
                  </div>
                  <div className="policy-card">
                    <h3><i className="fa fa-clock"></i> Check-in/out</h3>
                    <p>Check-in: 13:00hrs | Check-out: 12:00hrs</p>
                  </div>
                  <div className="policy-card">
                    <h3><i className="fa fa-users"></i> Capacidad</h3>
                    <p>Máximo {cabin.capacity} huéspedes. No se permiten fiestas</p>
                  </div>
                  <div className="policy-card">
                    <h3><i className="fa fa-ban"></i> Mascotas</h3>
                    <p>No se aceptan mascotas en la propiedad</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'resenas' && (
              <div className="tab-pane-content">
                <h2>Reseñas de huéspedes</h2>

                {/* Botón para mostrar formulario */}
                {!showReviewForm && (
                  <button
                    className="btn-add-review"
                    onClick={() => setShowReviewForm(true)}
                  >
                    <i className="fa fa-pencil"></i> Dejar una reseña
                  </button>
                )}

                {/* Formulario para crear reseña */}
                {showReviewForm && (
                  <div className="review-form-container">
                    <h3>Comparte tu experiencia</h3>
                    <div className="review-form">
                      <div className="form-group">
                        <label>Tu calificación</label>
                        <div className="star-rating-input">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              className={`star-btn ${star <= reviewRating ? 'active' : ''}`}
                              onClick={() => setReviewRating(star)}
                              type="button"
                            >
                              <i className="fa fa-star"></i>
                            </button>
                          ))}
                        </div>
                        {reviewRating > 0 && (
                          <span className="rating-text">{reviewRating} de 5 estrellas</span>
                        )}
                      </div>

                      <div className="form-group">
                        <label>Tu comentario</label>
                        <textarea
                          className="review-textarea"
                          placeholder="Cuéntanos sobre tu experiencia en la cabaña..."
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          rows={4}
                        />
                      </div>

                      <div className="form-actions">
                        <button
                          className="btn-submit-review"
                          onClick={handleSubmitReview}
                          disabled={submittingReview}
                        >
                          {submittingReview ? '⏳ Enviando...' : '✓ Enviar reseña'}
                        </button>
                        <button
                          className="btn-cancel-review"
                          onClick={() => {
                            setShowReviewForm(false);
                            setReviewRating(0);
                            setReviewComment('');
                          }}
                        >
                          ✕ Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Lista de reseñas */}
                {reviews.length > 0 ? (
                  <div className="reviews-list">
                    {reviews.map((review) => (
                      <div key={review.id} className="review-card">
                        <div className="review-header">
                          <div className="reviewer-info">
                            <div className="reviewer-avatar">
                              {review.user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4>{review.user.name}</h4>
                              <div className="review-rating">
                                {[...Array(5)].map((_, i) => (
                                  <i
                                    key={i}
                                    className={`fa fa-star${i < review.rating ? '' : '-o'}`}
                                  ></i>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="review-text">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  !showReviewForm && (
                    <div className="no-reviews">
                      <i className="fa fa-star-o"></i>
                      <p>Aún no hay reseñas. ¡Sé el primero en dejar una!</p>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Booking Card */}
        <div className="cabin-booking-sidebar">
          <div className="booking-card-premium">
            <div className="card-header">
              <h3>Reserva tu estadía</h3>
            </div>

            <div className="booking-section">
              <label>Fechas de reserva</label>
              <button
                className="calendar-trigger-btn"
                onClick={() => setShowBookingCalendar(!showBookingCalendar)}
              >
                <i className="fa fa-calendar"></i>
                {checkInDate && checkOutDate
                  ? `${checkInDate} → ${checkOutDate}`
                  : 'Selecciona fechas'}
              </button>
            </div>

            <div className="booking-section">
              <label>Número de huéspedes</label>
              <select
                value={numberOfGuests}
                onChange={(e) => setNumberOfGuests(e.target.value)}
                className="booking-input"
              >
                <option value="">Selecciona...</option>
                {[...Array(cabin.capacity)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} {i === 0 ? 'huésped' : 'huéspedes'}
                  </option>
                ))}
              </select>
            </div>

            {validationError && (
              <div className="error-alert">
                <i className="fa fa-exclamation-circle"></i>
                <span>{validationError}</span>
              </div>
            )}

            <button
              className="reserve-btn-primary"
              onClick={() => {
                let error = '';
                if (!checkInDate) error = 'Selecciona fecha de llegada';
                else if (!checkOutDate) error = 'Selecciona fecha de salida';
                else if (!numberOfGuests) error = 'Selecciona número de huéspedes';

                if (error) {
                  setValidationError(error);
                  return;
                }

                setValidationError('');
                const token = localStorage.getItem('token');
                if (!token) {
                  window.location.href = '/login';
                  return;
                }

                navigate('/booking-summary', {
                  state: {
                    cabinId: cabin?.id,
                    cabinTitle: cabin?.title,
                    cabinPrice: cabin?.price,
                    checkInDate: checkInDate,
                    checkOutDate: checkOutDate,
                    numberOfGuests: parseInt(numberOfGuests),
                    cabinLocation: cabin?.location
                  }
                });
              }}
            >
              <i className="fa fa-calendar-check-o"></i> Continuar con reserva
            </button>

            <p className="card-note">
              <i className="fa fa-info-circle"></i> Aún no se cobra nada
            </p>

            <div className="card-divider"></div>

            <div className="price-breakdown">
              <div className="price-row">
                <span>Por noche:</span>
                <span className="price-value">${cabin.price.toLocaleString('es-ES')}</span>
              </div>
              {totalInfo && (
                <div className="price-row">
                  <span>Noches:</span>
                  <span className="price-value">{totalInfo.nights}</span>
                </div>
              )}
              <div className="price-row">
                <span>Tarifa servicio:</span>
                <span className="price-value">Gratis</span>
              </div>
              <div className="price-row total">
                <span>Total:</span>
                <span className="price-value">
                  {totalInfo 
                    ? `$${totalInfo.total.toLocaleString('es-ES')}`
                    : 'A definir'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== LIGHTBOX MODAL ===== */}
      {showLightbox && images.length > 0 && (
        <div className="lightbox-overlay" onClick={() => setShowLightbox(false)}>
          <div className="lightbox-container" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setShowLightbox(false)}>
              <i className="fa fa-times"></i>
            </button>

            <div className="lightbox-main">
              <img
                src={images[currentImageIndex]}
                alt={`${cabin.title}`}
                className="lightbox-image"
              />
            </div>

            {images.length > 1 && (
              <>
                <button
                  className="lightbox-nav lightbox-prev"
                  onClick={() =>
                    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
                  }
                >
                  <i className="fa fa-chevron-left"></i>
                </button>
                <button
                  className="lightbox-nav lightbox-next"
                  onClick={() => setCurrentImageIndex((prev) => (prev + 1) % images.length)}
                >
                  <i className="fa fa-chevron-right"></i>
                </button>
              </>
            )}

            <div className="lightbox-counter">
              {currentImageIndex + 1} / {images.length}
            </div>

            <div className="lightbox-thumbnails">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className={`lightbox-thumb ${idx === currentImageIndex ? 'active' : ''}`}
                  onClick={() => setCurrentImageIndex(idx)}
                >
                  <img src={img} alt={`Thumb ${idx}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== BOOKING CALENDAR MODAL ===== */}
      {showBookingCalendar && (
        <div className="calendar-modal-overlay" onClick={() => setShowBookingCalendar(false)}>
          <div className="calendar-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <button className="calendar-modal-close" onClick={() => setShowBookingCalendar(false)}>
              <i className="fa fa-times"></i>
            </button>
            <BookingCalendar
              cabinId={cabin?.id || ''}
              price={cabin?.price || 0}
              onClose={() => setShowBookingCalendar(false)}
              onSelectDates={(checkIn, checkOut) => {
                setCheckInDate(checkIn);
                setCheckOutDate(checkOut);
                setShowBookingCalendar(false);
              }}
            />
          </div>
        </div>
      )}

      {/* ===== SERVICES MODAL ===== */}
      {showServicesModal && (
        <div className="services-modal-overlay" onClick={() => setShowServicesModal(false)}>
          <div className="services-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Todos los servicios</h2>
              <button className="modal-close" onClick={() => setShowServicesModal(false)}>
                <i className="fa fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="service-section">
                <h3>Servicios principales</h3>
                <ul>
                  <li><i className="fa fa-car"></i> Estacionamiento en la propiedad disponible</li>
                  <li><i className="fa fa-utensils"></i> Cocina</li>
                  <li><i className="fa fa-fire"></i> Quincho</li>
                  <li><i className="fa fa-home"></i> Patio</li>
                  <li><i className="fa fa-tree"></i> Balcón o patio</li>
                  <li><i className="fa fa-wifi"></i> Wifi</li>
                </ul>
              </div>

              <div className="service-section">
                <h3>Cocina</h3>
                <ul>
                  <li><i className="fa fa-fire"></i> Horno</li>
                  <li><i className="fa fa-tint"></i> Lavavajillas</li>
                  <li><i className="fa fa-bars"></i> Calefont</li>
                  <li><i className="fa fa-tint"></i> Tetera eléctrica</li>
                  <li><i className="fa fa-spoon"></i> Vajilla y utensilios</li>
                </ul>
              </div>

              <div className="service-section">
                <h3>Habitaciones y baños</h3>
                <ul>
                  <li><i className="fa fa-bed"></i> {cabin.bedrooms} habitación{cabin.bedrooms !== 1 ? 'es' : ''}</li>
                  <li><i className="fa fa-shower"></i> {cabin.bathrooms} baño{cabin.bathrooms !== 1 ? 's' : ''}</li>
                  <li><i className="fa fa-droplet"></i> Se proporcionan frazadas</li>
                </ul>
              </div>

              <div className="service-section">
                <h3>Entretenimiento</h3>
                <ul>
                  <li><i className="fa fa-tv"></i> Televisión</li>
                  <li><i className="fa fa-wifi"></i> WiFi de alta velocidad</li>
                </ul>
              </div>

              <div className="service-section">
                <h3>Seguridad y acceso</h3>
                <ul>
                  <li><i className="fa fa-shield"></i> Cerco con púas</li>
                  <li><i className="fa fa-camera"></i> Cámaras de vigilancia</li>
                  <li><i className="fa fa-ban"></i> No se aceptan mascotas</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

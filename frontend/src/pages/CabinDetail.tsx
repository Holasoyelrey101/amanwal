import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [cabin, setCabin] = useState<Cabin | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [showBookingCalendar, setShowBookingCalendar] = useState(false);
  const [activeTab, setActiveTab] = useState('resumen');
  const [showServicesModal, setShowServicesModal] = useState(false);
  const [checkInDate, setCheckInDate] = useState<string>('');
  const [checkOutDate, setCheckOutDate] = useState<string>('');
  const [numberOfGuests, setNumberOfGuests] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');

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
      {/* Galería de imágenes - FULL WIDTH ARRIBA */}
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

      {/* Tabs DEBAJO DE LA GALERÍA */}
      <div className="cabin-tabs-wrapper">
        <div className="cabin-tabs">
          <button 
            className={`tab-btn ${activeTab === 'resumen' ? 'active' : ''}`}
            onClick={() => setActiveTab('resumen')}
          >
            Resumen
          </button>
          <button 
            className={`tab-btn ${activeTab === 'politicas' ? 'active' : ''}`}
            onClick={() => setActiveTab('politicas')}
          >
            Políticas
          </button>
        </div>
      </div>

      {/* Contenido principal CON LAYOUT DE DOS COLUMNAS */}
      <div className="cabin-main-wrapper">
        {/* Lado izquierdo - Info + Contenido */}
        <div className="cabin-left-section">
          {/* Título y características rápidas */}
          <div className="cabin-summary-section">
            <h1>{cabin.title}</h1>
            <div className="cabin-quick-features">
              <span><i className="fa fa-bed"></i> {cabin.bedrooms} habitaciones</span>
              <span><i className="fa fa-shower"></i> {cabin.bathrooms} baño</span>
              <span><i className="fa fa-users"></i> {cabin.capacity} personas</span>
            </div>
          </div>

          {/* Contenido de tabs */}
          <div className="cabin-tab-content">
            {activeTab === 'resumen' && (
              <div className="tab-pane">
                <div className="cabin-services-section">
                  <h3>Servicios principales</h3>
                  <div className="services-grid">
                    <div className="service-item">
                      <i className="fa fa-car"></i>
                      <span>Estacionamiento en la propiedad disponible</span>
                    </div>
                    <div className="service-item">
                      <i className="fa fa-cutlery"></i>
                      <span>Cocina</span>
                    </div>
                    <div className="service-item">
                      <i className="fa fa-fire"></i>
                      <span>Quincho</span>
                    </div>
                    <div className="service-item">
                      <i className="fa fa-home"></i>
                      <span>Patio disponible</span>
                    </div>
                    <div className="service-item">
                      <i className="fa fa-tree"></i>
                      <span>Balcón o patio</span>
                    </div>
                    <div className="service-item">
                      <i className="fa fa-wifi"></i>
                      <span>Wifi</span>
                    </div>
                  </div>
                  <button 
                    className="view-all-services-btn"
                    onClick={() => setShowServicesModal(true)}
                  >
                    Ver todos los servicios de la propiedad
                  </button>
                </div>

                <h3>Descripción</h3>
                <p>{cabin.description}</p>
              </div>
            )}
            {activeTab === 'politicas' && (
              <div className="tab-pane">
                <h3>Políticas de Reservación</h3>
                <div className="policies-content">
                  <p>Para garantizar una experiencia clara, cómoda y segura, estas son las políticas de reservación de nuestra cabaña:</p>

                  <h4>1. Confirmación de Reserva</h4>
                  <ul>
                    <li>La reserva se confirma únicamente con el pago del 100% del valor total de la estadía.</li>
                    <li>No se realizarán reservas sin pago.</li>
                  </ul>

                  <h4>2. Cambios y Modificaciones</h4>
                  <ul>
                    <li>Los cambios de fecha están sujetos a disponibilidad.</li>
                    <li>Se pueden solicitar modificaciones con al menos 7 días de anticipación sin costo adicional.</li>
                  </ul>

                  <h4>3. Cancelaciones</h4>
                  <ul>
                    <li>Cancelaciones con más de 7 días de anticipación: reembolso del 100%.</li>
                    <li>Cancelaciones entre 7 y 3 días antes de la llegada: reembolso del 50%.</li>
                    <li>Cancelaciones con menos de 72 horas: no cuentan con devolución.</li>
                  </ul>

                  <h4>4. No Show (No Presentación)</h4>
                  <ul>
                    <li>Si el huésped no llega el día de la reserva sin aviso previo, no habrá devolución del pago.</li>
                  </ul>

                  <h4>5. Capacidad y Uso de la Cabaña</h4>
                  <ul>
                    <li>La cabaña tiene un número máximo de huéspedes permitido. Superarlo no está permitido por razones de seguridad.</li>
                    <li>No se permiten fiestas, eventos ni reuniones masivas.</li>
                  </ul>

                  <h4>6. Mascotas</h4>
                  <ul>
                    <li>No se aceptan mascotas.</li>
                  </ul>

                  <h4>7. Check-in y Check-out</h4>
                  <ul>
                    <li>Check-in: Desde las 13:00 hrs.</li>
                    <li>Check-out: Hasta las 12:00 hrs.</li>
                    <li>Cualquier excepción debe coordinarse con anticipación.</li>
                  </ul>

                  <h4>8. Seguridad</h4>
                  <ul>
                    <li>Los huéspedes son responsables del cuidado de sus pertenencias.</li>
                    <li>La cabaña debe quedar cerrada cada vez que se salga.</li>
                  </ul>

                  <h4>9. Daños</h4>
                  <ul>
                    <li>Todo daño causado a la propiedad, mobiliario o equipamiento debe ser informado y cubierto por el huésped.</li>
                  </ul>

                  <h4>10. Condiciones Climáticas</h4>
                  <ul>
                    <li>Si por condiciones climáticas extremas no es posible acceder a la zona, se permitirá reprogramar la estadía sin costo.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lado derecho - Card de reserva */}
        <div className="cabin-right-section">
          <div className="booking-card">
            <div className="price-section">
              <div className="price-display">
                <span className="currency">$</span>
                <span className="amount">{cabin.price.toLocaleString('es-ES')}</span>
              </div>
              <div className="price-period">por noche</div>
            </div>

            <div className="date-guests-section">
              <div className="date-selector">
                <label>Llegada</label>
                <input 
                  type="date" 
                  placeholder="Seleccionar fecha"
                  value={checkInDate}
                  onClick={() => setShowBookingCalendar(true)}
                  readOnly
                />
              </div>
              <div className="date-selector">
                <label>Salida</label>
                <input 
                  type="date" 
                  placeholder="Seleccionar fecha"
                  value={checkOutDate}
                  onClick={() => setShowBookingCalendar(true)}
                  readOnly
                />
              </div>
            </div>

            <div className="guests-selector">
              <label>Huéspedes</label>
              <input 
                type="number" 
                placeholder="Número de huéspedes"
                value={numberOfGuests}
                onChange={(e) => setNumberOfGuests(e.target.value)}
                min="1"
                max={cabin.capacity}
              />
            </div>

            {validationError && (
              <div className="validation-error-message">
                <i className="fa fa-exclamation-circle"></i>
                <span>{validationError}</span>
              </div>
            )}

            <button 
              className="reserve-button" 
              onClick={() => {
                let error = '';

                if (!checkInDate) {
                  error = 'Por favor selecciona la fecha de llegada';
                } else if (!checkOutDate) {
                  error = 'Por favor selecciona la fecha de salida';
                } else if (!numberOfGuests || parseInt(numberOfGuests) < 1) {
                  error = 'Por favor selecciona el número de huéspedes';
                }

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

                // Navegar a la página de resumen con los datos
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
              Reservar
            </button>
            <p className="reserve-note">Aún no se te cobrará nada</p>
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
          onSelectDates={(checkIn, checkOut) => {
            setCheckInDate(checkIn);
            setCheckOutDate(checkOut);
          }}
        />
      )}

      {/* Services Modal */}
      {showServicesModal && (
        <div className="services-modal-overlay" onClick={() => setShowServicesModal(false)}>
          <div className="services-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="services-modal-header">
              <h2>Servicios de la propiedad</h2>
              <button 
                className="services-modal-close"
                onClick={() => setShowServicesModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="services-modal-body">
              <div className="service-category">
                <h3>Servicios principales</h3>
                <ul>
                  <li><i className="fa fa-car"></i> Estacionamiento en la propiedad disponible</li>
                  <li><i className="fa fa-cutlery"></i> Cocina</li>
                  <li><i className="fa fa-fire"></i> Quincho</li>
                  <li><i className="fa fa-home"></i> Patio</li>
                  <li><i className="fa fa-tree"></i> Balcón o patio</li>
                  <li><i className="fa fa-wifi"></i> Wifi</li>
                </ul>
              </div>

              <div className="service-category">
                <h3>Estacionamiento y transporte</h3>
                <ul>
                  <li><i className="fa fa-car"></i> Estacionamiento en la propiedad</li>
                </ul>
              </div>

{/*               <div className="service-category">
                <h3>Para familias</h3>
                <ul>
                  <li><i className="fa fa-child"></i> Área de juegos infantiles</li>
                  <li><i className="fa fa-spoon"></i> Vajilla para niños</li>
                </ul>
              </div> */}

              <div className="service-category">
                <h3>Cocina</h3>
                <ul>
                  <li><i className="fa fa-fire"></i> Horno</li>
                  <li><i className="fa fa-glass"></i> Lavavajillas</li>
                  <li><i className="fa fa-cutlery"></i> Calefont</li>
                  <li><i className="fa fa-tint"></i> Tetera eléctrica</li>
                  <li><i className="fa fa-spoon"></i> Vajilla y utensilios de cocina</li>
                </ul>
              </div>

              <div className="service-category">
                <h3>Comidas</h3>
                <ul>
                  <li><i className="fa fa-square"></i> Mesas</li>
                  <li><i className="fa fa-chair"></i> Sillas / sillones</li>
                </ul>
              </div>

              <div className="service-category">
                <h3>Habitaciones</h3>
                <ul>
                  <li><i className="fa fa-bed"></i> {cabin.bedrooms} habitación{cabin.bedrooms !== 1 ? 'es' : ''}</li>
                  <li><i className="fa fa-home"></i> Se proporcionan frazadas</li>
                </ul>
              </div>

              <div className="service-category">
                <h3>Baño</h3>
                <ul>
                  <li><i className="fa fa-shower"></i> {cabin.bathrooms} baño{cabin.bathrooms !== 1 ? 's' : ''}</li>
                  <li><i className="fa fa-bar-chart"></i> WC</li>
                </ul>
              </div>

{/*               <div className="service-category">
                <h3>Regadera</h3>
                <ul>
                  <li><i className="fa fa-towel"></i> Se ofrecen toallas</li>
                </ul>
              </div> */}

{/*               <div className="service-category">
                <h3>Áreas comunes para sentarse</h3>
                <ul>
                  <li><i className="fa fa-square"></i> Mesa</li>
                </ul>
              </div> */}

              <div className="service-category">
                <h3>Entretenimiento</h3>
                <ul>
                  <li><i className="fa fa-television"></i> TV</li>
                </ul>
              </div>

              <div className="service-category">
                <h3>Espacios exteriores</h3>
                <ul>
                  <li><i className="fa fa-fire"></i> Quincho</li>
                  <li><i className="fa fa-leaf"></i> Jardín</li>
                  <li><i className="fa fa-tree"></i> Patio</li>
                </ul>
              </div>

              <div className="service-category">
                <h3>Mascotas</h3>
                <ul>
                  <li><i className="fa fa-ban"></i> No se aceptan mascotas</li>
                </ul>
              </div>

              <div className="service-category">
                <h3>Facilidades de acceso</h3>
                <ul>
                  <li><i className="fa fa-ban"></i> No se permite fumar en la propiedad</li>
                </ul>
              </div>

              <div className="service-category">
                <h3>Aspectos destacados de la ubicación</h3>
                <ul>
                  <li><i className="fa fa-map-marker"></i> A pocos metros de playas, hospital y centro de la ciudad</li>
                </ul>
              </div>

{/*               <div className="service-category">
                <h3>Descripción general</h3>
                <ul>
                  <li><i className="fa fa-leaf"></i> Jardín</li>
                </ul>
              </div> */}

              <div className="service-category">
                <h3>Características de seguridad</h3>
                <ul>
                  <li><i className="fa fa-shield"></i> Cerco con puas</li>
                  <li><i className="fa fa-camera"></i> Resinto con camaras de vigilancia</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

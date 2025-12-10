import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import './my-bookings.css';

interface Cabin {
  id: string;
  title: string;
  images: string[];
  location: string;
}

interface Booking {
  id: string;
  bookingNumber: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: string;
  paymentExpiresAt?: string; // Nuevo campo
  cabin: Cabin;
}

export const MyBookings: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [paymentTimers, setPaymentTimers] = useState<Record<string, number>>({}); // Para timers de expiración

  useEffect(() => {
    if (isAuthenticated) {
      loadBookings();
    }
  }, [isAuthenticated]);

  // Efecto para actualizar timers de expiración cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      const newTimers: Record<string, number> = {};
      const now = new Date().getTime();

      bookings.forEach((booking) => {
        if (booking.paymentExpiresAt && booking.status === 'pending') {
          const expiresAt = new Date(booking.paymentExpiresAt).getTime();
          const timeLeft = Math.max(0, Math.floor((expiresAt - now) / 1000));
          newTimers[booking.id] = timeLeft;
        }
      });

      setPaymentTimers(newTimers);
    }, 1000);

    return () => clearInterval(interval);
  }, [bookings]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/bookings');
      setBookings(response.data);
    } catch (err) {
      console.error('Error al cargar reservas:', err);
      setError('Error al cargar tus reservas');
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      return;
    }

    try {
      await apiClient.patch(
        `/bookings/${bookingId}/cancel`,
        {}
      );
      setBookings(bookings.map(b => 
        b.id === bookingId ? { ...b, status: 'cancelled' } : b
      ));
    } catch (err) {
      console.error('Error al cancelar reserva:', err);
      alert('Error al cancelar la reserva');
    }
  };

  const initiatePayment = async (bookingId: string) => {
    try {
      const response = await apiClient.patch(
        `/bookings/${bookingId}/initiate-payment`,
        {}
      );
      
      // Actualizar la reserva con la expiración
      setBookings(bookings.map(b => 
        b.id === bookingId 
          ? { ...b, paymentExpiresAt: response.data.booking.paymentExpiresAt }
          : b
      ));

      // Mostrar alerta de éxito
      alert('Tienes 5 minutos para completar el pago. Si expira, la reserva se cancelará automáticamente.');
      
      // Redirigir a página de pago con ruta dinámica
      navigate(`/payment/${bookingId}`);
    } catch (err: any) {
      console.error('Error al iniciar pago:', err);
      alert(err.response?.data?.error || 'Error al iniciar el pago');
    }
  };

  const formatTimeRemaining = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const parseImages = (images: any): string[] => {
    if (typeof images === 'string') {
      try {
        return JSON.parse(images);
      } catch {
        return [images];
      }
    }
    return Array.isArray(images) ? images : [];
  };

  const getImageUrl = (images: any): string => {
    const parsed = parseImages(images);
    if (parsed.length > 0) {
      const img = parsed[0];
      if (img.startsWith('data:') || img.startsWith('http')) {
        return img;
      }
    }
    return 'https://via.placeholder.com/200x150?text=Cabaña';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { icon: 'fa-check-circle', label: 'Confirmada', class: 'confirmed' };
      case 'pending':
        return { icon: 'fa-clock-o', label: 'Pendiente', class: 'pending' };
      case 'cancelled':
        return { icon: 'fa-times-circle', label: 'Cancelada', class: 'cancelled' };
      default:
        return { icon: 'fa-info-circle', label: status, class: 'default' };
    }
  };

  const filteredBookings = filterStatus === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filterStatus);

  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="my-bookings-container">
      {/* Header */}
      <div className="bookings-header">
        <div className="header-content">
          <h1 className="header-title">
            <i className="fa fa-calendar"></i>
            Mis Reservas
          </h1>
          <p className="header-subtitle">Gestiona y visualiza todas tus reservas</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="error-alert">
          <i className="fa fa-exclamation-circle"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando tus reservas...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <i className="fa fa-inbox"></i>
          </div>
          <h3>No tienes reservas aún</h3>
          <p>¡Comienza a explorar nuestras cabañas y haz tu primera reserva!</p>
          <a href="/cabins" className="btn-explore">
            <i className="fa fa-arrow-right"></i>
            Explorar Cabañas
          </a>
        </div>
      ) : (
        <>
          {/* Filter Tabs */}
          <div className="filter-tabs">
            <button 
              className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
              onClick={() => setFilterStatus('all')}
            >
              <span>Todas</span>
              <span className="count">{bookings.length}</span>
            </button>
            <button 
              className={`filter-btn ${filterStatus === 'confirmed' ? 'active' : ''}`}
              onClick={() => setFilterStatus('confirmed')}
            >
              <i className="fa fa-check-circle"></i>
              <span>Confirmadas</span>
              <span className="count">{bookings.filter(b => b.status === 'confirmed').length}</span>
            </button>
            <button 
              className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
              onClick={() => setFilterStatus('pending')}
            >
              <i className="fa fa-clock-o"></i>
              <span>Pendientes</span>
              <span className="count">{bookings.filter(b => b.status === 'pending').length}</span>
            </button>
            <button 
              className={`filter-btn ${filterStatus === 'cancelled' ? 'active' : ''}`}
              onClick={() => setFilterStatus('cancelled')}
            >
              <i className="fa fa-times-circle"></i>
              <span>Canceladas</span>
              <span className="count">{bookings.filter(b => b.status === 'cancelled').length}</span>
            </button>
          </div>

          {/* Bookings Grid */}
          <div className="bookings-grid">
            {filteredBookings.map((booking) => {
              const statusBadge = getStatusBadge(booking.status);
              const nights = calculateNights(booking.checkIn, booking.checkOut);
              return (
                <div key={booking.id} className="booking-card">
                  {/* Image Section */}
                  <div className="booking-image-container">
                    <img
                      src={getImageUrl(booking.cabin.images)}
                      alt={booking.cabin.title}
                      className="booking-image"
                    />
                    <div className={`status-badge ${statusBadge.class}`}>
                      <i className={`fa ${statusBadge.icon}`}></i>
                      <span>{statusBadge.label}</span>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="booking-content">
                    <h3 className="cabin-title">{booking.cabin.title}</h3>
                    
                    <div className="cabin-location">
                      <i className="fa fa-map-marker"></i>
                      <span>{booking.cabin.location}</span>
                    </div>

                    <div className="booking-details">
                      <div className="detail-item">
                        <span className="detail-label">Nº Reserva</span>
                        <span className="detail-value">{booking.bookingNumber}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Entrada</span>
                        <span className="detail-value">
                          {new Date(booking.checkIn).toLocaleDateString('es-ES', { 
                            day: 'numeric', 
                            month: 'short' 
                          })}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Salida</span>
                        <span className="detail-value">
                          {new Date(booking.checkOut).toLocaleDateString('es-ES', { 
                            day: 'numeric', 
                            month: 'short' 
                          })}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Noches</span>
                        <span className="detail-value">{nights}</span>
                      </div>
                    </div>

                    <div className="price-section">
                      <span className="price-label">Total</span>
                      <span className="price-value">${booking.totalPrice.toLocaleString('es-ES')}</span>
                    </div>

                    <div className="booking-actions">
                      <a 
                        href={`/cabins/${booking.cabin.id}`}
                        className="btn-action btn-primary"
                      >
                        <i className="fa fa-eye"></i>
                        Ver Cabaña
                      </a>
                      {booking.status === 'pending' && (
                        <button
                          className={`btn-action btn-success ${paymentTimers[booking.id] ? '' : 'disabled'}`}
                          onClick={() => initiatePayment(booking.id)}
                          disabled={!paymentTimers[booking.id]}
                          title={paymentTimers[booking.id] ? 'Haz click para pagar' : 'Tiempo de pago expirado'}
                        >
                          <i className="fa fa-credit-card"></i>
                          {paymentTimers[booking.id] ? (
                            <>
                              Ir a Pagar
                              <span className="payment-timer">
                                {formatTimeRemaining(paymentTimers[booking.id])}
                              </span>
                            </>
                          ) : (
                            'Pago Expirado'
                          )}
                        </button>
                      )}
                      {booking.status !== 'cancelled' && (
                        <button
                          className="btn-action btn-danger"
                          onClick={() => cancelBooking(booking.id)}
                        >
                          <i className="fa fa-trash"></i>
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

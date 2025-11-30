import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './my-bookings.css';

interface Cabin {
  id: string;
  title: string;
  images: string[];
}

interface Booking {
  id: string;
  bookingNumber: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: string;
  cabin: Cabin;
}

const API_URL = 'http://localhost:3000/api';

export const MyBookings: React.FC = () => {
  const { token, isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadBookings();
    }
  }, [isAuthenticated]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
      await axios.patch(
        `${API_URL}/bookings/${bookingId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookings(bookings.map(b => 
        b.id === bookingId ? { ...b, status: 'cancelled' } : b
      ));
    } catch (err) {
      console.error('Error al cancelar reserva:', err);
      alert('Error al cancelar la reserva');
    }
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

  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case 'confirmed':
        return 'bg-success';
      case 'pending':
        return 'bg-warning';
      case 'cancelled':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'confirmed':
        return 'Confirmada';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  return (
    <div className="container py-5">
      <div className="mb-4">
        <h1 className="h2">Mis Reservas</h1>
        <p className="text-muted">Visualiza y gestiona todas tus reservas</p>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="alert alert-info">
          <h5>No tienes reservas aún</h5>
          <p>¡Comienza a explorar nuestras cabañas y haz tu primera reserva!</p>
          <a href="/cabins" className="btn btn-primary btn-sm">
            Ver Cabañas
          </a>
        </div>
      ) : (
        <div className="bookings-grid">
          {bookings.map((booking) => (
            <div key={booking.id} className="booking-card">
              <div className="booking-image-container">
                <img
                  src={getImageUrl(booking.cabin.images)}
                  alt={booking.cabin.title}
                  className="booking-image"
                />
                <span className={`badge ${getStatusBadgeClass(booking.status)}`}>
                  {getStatusLabel(booking.status)}
                </span>
              </div>
              <div className="booking-content">
                <h5 className="booking-title">{booking.cabin.title}</h5>
                
                <div className="booking-details">
                  <div className="detail-row">
                    <span className="label">Nº Reserva:</span>
                    <span className="value"><strong>{booking.bookingNumber}</strong></span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Entrada:</span>
                    <span className="value">
                      {new Date(booking.checkIn).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Salida:</span>
                    <span className="value">
                      {new Date(booking.checkOut).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Total:</span>
                    <span className="value"><strong>${booking.totalPrice.toLocaleString()}</strong></span>
                  </div>
                </div>

                <div className="booking-actions">
                  <a 
                    href={`/cabins/${booking.cabin.id}`}
                    className="btn btn-sm btn-outline-primary"
                  >
                    Ver Cabaña
                  </a>
                  {booking.status !== 'cancelled' && (
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => cancelBooking(booking.id)}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

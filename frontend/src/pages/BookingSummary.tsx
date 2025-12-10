import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import './booking-summary.css';

interface User {
  name: string;
  email: string;
  phone: string;
}

export const BookingSummary: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const state = location.state as {
    cabinId: string;
    cabinTitle: string;
    cabinPrice: number;
    checkInDate: string;
    checkOutDate: string;
    numberOfGuests: number;
    cabinLocation: string;
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await apiClient.get('/auth/me');
        setUser(response.data);
      } catch (err) {
        console.error('Error cargando datos del usuario:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (!state) {
    return (
      <div className="container py-5 text-center">
        <h2>Error: Datos de reserva no encontrados</h2>
        <button onClick={() => navigate(-1)} className="btn btn-primary">Volver</button>
      </div>
    );
  }

  const checkIn = new Date(state.checkInDate);
  const checkOut = new Date(state.checkOutDate);
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  const subtotal = nights * state.cabinPrice;
  const fee = Math.round(subtotal * 0.1); // 10% de comisión
  const total = subtotal + fee;

  const handleCompleteBooking = async () => {
    try {
      // Paso 1: Crear la reserva
      const bookingResponse = await apiClient.post('/bookings', {
        cabinId: state.cabinId,
        checkIn: state.checkInDate,
        checkOut: state.checkOutDate,
        guests: state.numberOfGuests
      });

      const bookingData = bookingResponse.data;
      const bookingId = bookingData.id;
      console.log('✅ Reserva creada exitosamente:', bookingId);

      // Paso 2: Iniciar el proceso de pago (establece expiración a 5 minutos)
      const paymentInitResponse = await apiClient.patch(`/bookings/${bookingId}/initiate-payment`);
      console.log('✅ Pago iniciado, expira en:', paymentInitResponse.data.expiresIn, 'segundos');

      // Paso 3: Crear la orden de pago en Flow
      const paymentResponse = await apiClient.post('/payments/create', {
        bookingId: bookingId
      });

      const paymentData = paymentResponse.data;
      console.log('✅ Orden de pago creada:', paymentData.flowOrder);

      // Paso 4: Redirigir a Flow para completar el pago
      if (paymentData.redirectUrl) {
        window.location.href = paymentData.redirectUrl;
      } else {
        alert('Error: No se recibió URL de pago');
      }
    } catch (err: any) {
      console.error('Error al completar la reserva:', err);
      const errorMsg = err.response?.data?.error || 'Error al realizar la reserva';
      alert(errorMsg);
    }
  };

  return (
    <div className="booking-summary-container">
      <div className="summary-wrapper">
        {/* Header */}
        <div className="summary-header">
          <h1>Resumen de tu reserva</h1>
          <button className="back-btn" onClick={() => navigate(-1)}>← Volver</button>
        </div>

        {/* Main Content */}
        <div className="summary-content">
          {/* Datos de la Cabaña */}
          <div className="summary-section cabin-info">
            <h2>{state.cabinTitle}</h2>
            <p className="location"><i className="fa fa-map-marker"></i> {state.cabinLocation}</p>
          </div>

          {/* Fechas */}
          <div className="summary-section dates-info">
            <h3>Fechas de la Estadía</h3>
            <div className="dates-container">
              <div className="date-card">
                <div className="date-label">CHECK-IN</div>
                <div className="date-day">{checkIn.getDate()}</div>
                <div className="date-month">{checkIn.toLocaleDateString('es-ES', { month: 'long' })}</div>
                <div className="date-year">{checkIn.getFullYear()}</div>
                <div className="date-weekday">{checkIn.toLocaleDateString('es-ES', { weekday: 'long' })}</div>
              </div>

              <div className="date-arrow">
                <i className="fa fa-arrow-right"></i>
              </div>

              <div className="date-card">
                <div className="date-label">CHECK-OUT</div>
                <div className="date-day">{checkOut.getDate()}</div>
                <div className="date-month">{checkOut.toLocaleDateString('es-ES', { month: 'long' })}</div>
                <div className="date-year">{checkOut.getFullYear()}</div>
                <div className="date-weekday">{checkOut.toLocaleDateString('es-ES', { weekday: 'long' })}</div>
              </div>

              <div className="nights-badge">
                <div className="nights-number">{nights}</div>
                <div className="nights-label">Noche{nights !== 1 ? 's' : ''}</div>
              </div>
            </div>
          </div>

          {/* Datos del Huésped */}
          {!loading && user && (
            <div className="summary-section guest-info">
              <h3>Datos del Huésped</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Nombre</label>
                  <p>{user.name}</p>
                </div>
                <div className="info-item">
                  <label>Email</label>
                  <p>{user.email}</p>
                </div>
                <div className="info-item">
                  <label>Teléfono</label>
                  <p>{user.phone || 'No proporcionado'}</p>
                </div>
                <div className="info-item">
                  <label>Número de Huéspedes</label>
                  <p>{state.numberOfGuests}</p>
                </div>
              </div>
            </div>
          )}

          {/* Desglose de Precio */}
          <div className="summary-section price-breakdown">
            <h3>Desglose del Precio</h3>
            <div className="price-detail">
              <div className="price-row">
                <span>${state.cabinPrice.toLocaleString('es-ES')} x {nights} noche{nights !== 1 ? 's' : ''}</span>
                <span>${subtotal.toLocaleString('es-ES')}</span>
              </div>
              <div className="price-row">
                <span>Comisión de servicio</span>
                <span>${fee.toLocaleString('es-ES')}</span>
              </div>
              <div className="price-row total">
                <span>Total</span>
                <span>${total.toLocaleString('es-ES')}</span>
              </div>
            </div>
          </div>

          {/* Payment Method Info */}
          <div className="summary-section payment-method">
            <div className="payment-info-box">
              <i className="fa fa-lock"></i>
              <div className="payment-text">
                <p>Las transacciones se procesan mediante <strong>Flow</strong>, el método de pago seguro.</p>
                <p>Serás redirigido a <a href="https://www.flow.cl" target="_blank" rel="noopener noreferrer">flow.cl</a> para completar el pago.</p>
              </div>
            </div>
          </div>

          {/* Información Importante - Con Scroll */}
          <div className="summary-section important-info full-width">
            <h3>Información Importante</h3>
            <div className="info-scroll">
              <div className="info-content">
                <h4>Políticas de Cancelación</h4>
                <ul>
                  <li>Cancelaciones con más de 7 días de anticipación: reembolso del 100%</li>
                  <li>Cancelaciones entre 7 y 3 días antes: reembolso del 50%</li>
                  <li>Cancelaciones con menos de 72 horas: no hay devolución</li>
                </ul>

                <h4>Reglas de la Casa</h4>
                <ul>
                  <li>Check-in: desde las 13:00 hrs</li>
                  <li>Check-out: hasta las 12:00 hrs</li>
                  <li>No se aceptan mascotas</li>
                  <li>No se permiten fiestas ni eventos masivos</li>
                  <li>Los huéspedes son responsables de sus pertenencias</li>
                  <li>Todo daño debe ser reportado y cubierto por el huésped</li>
                </ul>

                <h4>Seguridad</h4>
                <ul>
                  <li>Las transmisiones son seguras y el almacenamiento cifrado protege tu información personal</li>
                  <li>Los pagos se procesan de forma segura a través de Flow</li>
                </ul>

                <h4>Condiciones Especiales</h4>
                <ul>
                  <li>Si por condiciones climáticas extremas no es posible acceder a la zona, se permitirá reprogramar sin costo</li>
                  <li>Confirma tu correo electrónico antes de realizar la reserva</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="summary-actions">
          <button className="cancel-btn" onClick={() => navigate(-1)}>Cancelar</button>
          <button className="complete-btn" onClick={handleCompleteBooking}>Completar Reservación</button>
        </div>
      </div>
    </div>
  );
};

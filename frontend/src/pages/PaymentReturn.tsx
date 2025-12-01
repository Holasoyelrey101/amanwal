import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './payment-return.css';

export const PaymentReturn: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'pending' | 'failed'>('loading');
  const [booking, setBooking] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!bookingId) {
          setStatus('failed');
          setError('ID de reserva no encontrado');
          return;
        }

        // Esperar un momento para que el webhook se procese
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Obtener estado de la reserva
        const response = await fetch(`http://localhost:3000/api/bookings/${bookingId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Error al obtener estado de la reserva');
        }

        const bookingData = await response.json();
        setBooking(bookingData);

        if (bookingData.paymentStatus === 'completed') {
          setStatus('success');
        } else if (bookingData.paymentStatus === 'pending') {
          setStatus('pending');
        } else if (bookingData.paymentStatus === 'failed') {
          setStatus('failed');
          setError('El pago fue rechazado');
        }
      } catch (err) {
        console.error('Error al verificar pago:', err);
        setStatus('failed');
        setError('Error al verificar el estado del pago');
      }
    };

    checkPaymentStatus();
  }, [bookingId]);

  return (
    <div className="payment-return-container">
      <div className="payment-return-wrapper">
        {status === 'loading' && (
          <div className="payment-status loading">
            <div className="spinner"></div>
            <h2>Verificando tu pago...</h2>
            <p>Por favor espera mientras procesamos tu transacción</p>
          </div>
        )}

        {status === 'success' && booking && (
          <div className="payment-status success">
            <div className="success-icon">
              <i className="fa fa-check-circle"></i>
            </div>
            <h2>¡Pago Exitoso!</h2>
            <p className="subtitle">Tu reserva ha sido confirmada</p>
            
            <div className="booking-info-box">
              <div className="info-row">
                <span className="label">Número de Reserva:</span>
                <span className="value">{booking.bookingNumber}</span>
              </div>
              <div className="info-row">
                <span className="label">Cabaña:</span>
                <span className="value">{booking.cabin?.title}</span>
              </div>
              <div className="info-row">
                <span className="label">Check-in:</span>
                <span className="value">{new Date(booking.checkIn).toLocaleDateString('es-ES')}</span>
              </div>
              <div className="info-row">
                <span className="label">Check-out:</span>
                <span className="value">{new Date(booking.checkOut).toLocaleDateString('es-ES')}</span>
              </div>
              <div className="info-row highlight">
                <span className="label">Total Pagado:</span>
                <span className="value">${booking.totalPrice.toLocaleString('es-ES')}</span>
              </div>
            </div>

            <div className="success-message">
              <i className="fa fa-envelope"></i>
              <p>Se ha enviado un correo de confirmación a tu email</p>
            </div>

            <button 
              className="action-button"
              onClick={() => navigate('/bookings')}
            >
              Ver mis reservas
            </button>
          </div>
        )}

        {status === 'pending' && booking && (
          <div className="payment-status pending">
            <div className="pending-icon">
              <i className="fa fa-hourglass-half"></i>
            </div>
            <h2>Pago Pendiente</h2>
            <p className="subtitle">Tu pago está siendo procesado</p>
            
            <div className="booking-info-box">
              <div className="info-row">
                <span className="label">Número de Reserva:</span>
                <span className="value">{booking.bookingNumber}</span>
              </div>
            </div>

            <p className="info-text">
              Tu reserva está en estado pendiente. Por favor intenta nuevamente más tarde.
            </p>

            <button 
              className="action-button"
              onClick={() => navigate('/')}
            >
              Volver al inicio
            </button>
          </div>
        )}

        {status === 'failed' && (
          <div className="payment-status failed">
            <div className="failed-icon">
              <i className="fa fa-times-circle"></i>
            </div>
            <h2>Pago No Completado</h2>
            <p className="subtitle">{error}</p>

            <div className="error-box">
              <p>No te preocupes, tu información está segura. Puedes intentar nuevamente.</p>
            </div>

            <button 
              className="action-button"
              onClick={() => navigate('/')}
            >
              Volver al inicio
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

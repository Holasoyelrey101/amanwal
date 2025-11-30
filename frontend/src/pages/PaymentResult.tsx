import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';

export function PaymentResult() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'pending' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        if (!bookingId) {
          setStatus('error');
          setMessage('ID de reserva no encontrado');
          return;
        }

        // Esperar un poco a que Flow procese el pago
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Obtener estado de la reserva
        const response = await apiClient.get(`/bookings/${bookingId}`);
        const booking = response.data;

        if (booking.status === 'confirmed') {
          setStatus('success');
          setMessage('¡Tu pago ha sido confirmado exitosamente!');
          setTimeout(() => navigate('/my-bookings'), 3000);
        } else if (booking.status === 'pending') {
          setStatus('pending');
          setMessage('Tu pago está siendo procesado. Por favor espera...');
          setTimeout(() => navigate('/my-bookings'), 5000);
        } else {
          setStatus('error');
          setMessage('Hubo un problema al procesar tu pago');
        }
      } catch (error) {
        console.error('Error al verificar pago:', error);
        setStatus('error');
        setMessage('Error al verificar el estado del pago');
      }
    };

    checkPaymentStatus();
  }, [bookingId, navigate]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {status === 'loading' && (
          <>
            <div style={styles.spinner}></div>
            <h2>Procesando tu pago...</h2>
            <p>Por favor espera mientras verificamos el estado de tu reserva</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={styles.successIcon}>✓</div>
            <h2 style={{ color: '#4CAF50' }}>¡Pago Confirmado!</h2>
            <p>{message}</p>
            <p style={{ fontSize: '0.9em', color: '#666' }}>Serás redirigido a tus reservas en 3 segundos...</p>
          </>
        )}

        {status === 'pending' && (
          <>
            <div style={styles.pendingIcon}>⏳</div>
            <h2 style={{ color: '#FF9800' }}>Pago Pendiente</h2>
            <p>{message}</p>
            <p style={{ fontSize: '0.9em', color: '#666' }}>Volveremos a verificar en unos segundos...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={styles.errorIcon}>✕</div>
            <h2 style={{ color: '#F44336' }}>Error</h2>
            <p>{message}</p>
            <button 
              onClick={() => navigate('/my-bookings')}
              style={styles.button}
            >
              Volver a Mis Reservas
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '40px',
    textAlign: 'center' as const,
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    maxWidth: '400px',
    width: '100%',
  },
  spinner: {
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #3498db',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 20px',
  },
  successIcon: {
    fontSize: '48px',
    color: '#4CAF50',
    marginBottom: '20px',
  },
  pendingIcon: {
    fontSize: '48px',
    color: '#FF9800',
    marginBottom: '20px',
  },
  errorIcon: {
    fontSize: '48px',
    color: '#F44336',
    marginBottom: '20px',
  },
  button: {
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  },
};

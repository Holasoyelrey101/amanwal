import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import './payment-flow.css';

interface PaymentFlowProps {
  bookingId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function PaymentFlow({ bookingId, onSuccess, onError }: PaymentFlowProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed' | 'pending'>('idle');

  // Procesar la confirmación del pago (cuando Flow redirige de vuelta)
  useEffect(() => {
    const handlePaymentReturn = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');

      if (token) {
        console.log('🔔 Retornando de Flow con token:', token);
        setPaymentStatus('processing');

        try {
          // Verificar estado del pago con el backend
          const response = await apiClient.get(`/payments/status/${token}`);

          console.log('📊 Estado del pago:', response.data);

          if (response.data.isSuccessful) {
            setPaymentStatus('success');
            console.log('✅ ¡Pago exitoso!');

            // Esperar un poco antes de redirigir
            setTimeout(() => {
              if (onSuccess) {
                onSuccess();
              } else {
                navigate('/my-bookings');
              }
            }, 2000);
          } else if (response.data.isPending) {
            setPaymentStatus('pending');
            console.log('⏳ Pago pendiente, aguardando confirmación...');

            setTimeout(() => {
              navigate('/my-bookings');
            }, 3000);
          } else if (response.data.isRejected) {
            setPaymentStatus('failed');
            setError('El pago fue rechazado. Por favor, intenta con otra tarjeta.');
            console.error('❌ Pago rechazado');
          }
        } catch (err) {
          setPaymentStatus('failed');
          const errorMessage = err instanceof Error ? err.message : 'Error al verificar el pago';
          setError(errorMessage);
          if (onError) {
            onError(errorMessage);
          }
          console.error('Error:', err);
        }
      }
    };

    handlePaymentReturn();
  }, [navigate, onSuccess, onError]);

  // Iniciar pago con Flow
  const handleStartPayment = async () => {
    if (!bookingId) {
      setError('ID de reserva no válido');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('💳 Iniciando pago para reserva:', bookingId);

      // Crear orden de pago
      const response = await apiClient.post('/payments/create', {
        bookingId: bookingId,
      });

      console.log('✅ Orden de pago creada');
      console.log('Redirigiendo a Flow...');

      // Redirigir a Flow
      if (response.data.redirectUrl) {
        window.location.href = response.data.redirectUrl;
      } else {
        throw new Error('No se recibió URL de redirección');
      }
    } catch (err) {
      setLoading(false);
      const errorMessage = err instanceof Error ? err.message : 'Error al procesar el pago';
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
      console.error('Error:', err);
    }
  };

  return (
    <div className="payment-flow-container">
      <div className="payment-flow-card">
        {/* Estado: Idle (Listo para pagar) */}
        {paymentStatus === 'idle' && (
          <div className="payment-flow-content">
            <div className="payment-flow-icon idle">💳</div>
            <h2>Procesar Pago</h2>
            <p>Serás redirigido a Flow para completar tu pago de forma segura.</p>

            {error && <div className="payment-flow-error">{error}</div>}

            <button
              onClick={handleStartPayment}
              disabled={loading}
              className="payment-flow-button primary"
            >
              {loading ? '⏳ Procesando...' : '🔗 Ir a Pagar con Flow'}
            </button>

            <div className="payment-flow-info">
              <h3>Métodos de pago disponibles:</h3>
              <ul>
                <li>💳 Tarjetas de crédito/débito</li>
                <li>🏦 Transferencia bancaria</li>
                <li>🛒 Servipag</li>
                <li>📱 Multicaja</li>
              </ul>
            </div>
          </div>
        )}

        {/* Estado: Processing (Verificando pago) */}
        {paymentStatus === 'processing' && (
          <div className="payment-flow-content">
            <div className="payment-flow-icon processing">⏳</div>
            <h2>Verificando Pago...</h2>
            <p>Estamos confirmando tu pago, por favor espera.</p>
            <div className="spinner"></div>
          </div>
        )}

        {/* Estado: Success (Pago exitoso) */}
        {paymentStatus === 'success' && (
          <div className="payment-flow-content success">
            <div className="payment-flow-icon success">✅</div>
            <h2>¡Pago Exitoso!</h2>
            <p>Tu reserva ha sido confirmada. Serás redirigido a tus reservas...</p>
            <div className="spinner"></div>
          </div>
        )}

        {/* Estado: Pending (Pago pendiente) */}
        {paymentStatus === 'pending' && (
          <div className="payment-flow-content pending">
            <div className="payment-flow-icon pending">⏳</div>
            <h2>Pago Pendiente</h2>
            <p>Tu pago está siendo procesado. Volveremos a verific a tu reserva pronto.</p>
            <p className="secondary-text">Serás redirigido a tus reservas...</p>
            <div className="spinner"></div>
          </div>
        )}

        {/* Estado: Failed (Pago rechazado) */}
        {paymentStatus === 'failed' && (
          <div className="payment-flow-content error">
            <div className="payment-flow-icon error">❌</div>
            <h2>Pago Rechazado</h2>
            <p>{error || 'No se pudo procesar el pago.'}</p>

            <div className="payment-flow-actions">
              <button
                onClick={handleStartPayment}
                disabled={loading}
                className="payment-flow-button primary"
              >
                {loading ? '⏳ Procesando...' : '🔄 Intentar de Nuevo'}
              </button>
              <button onClick={() => navigate('/my-bookings')} className="payment-flow-button secondary">
                ← Volver a Mis Reservas
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="payment-flow-security">
        <p>
          <strong>🔒 Pago Seguro:</strong> Tu información de pago está protegida por Flow mediante
          encriptación SSL de 256 bits.
        </p>
      </div>
    </div>
  );
}

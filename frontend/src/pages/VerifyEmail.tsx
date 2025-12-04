import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import './verify-email.css';

export const VerifyEmail: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verificando tu email...');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Token de verificación no encontrado');
        return;
      }

      try {
        const response = await apiClient.post(`/auth/verify-email/${token}`);
        
        if (response.data.token) {
          // Guardar token y usuario
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          
          setStatus('success');
          setMessage('✓ Email verificado correctamente. Redirigiendo...');
          
          // Redirigir después de 2 segundos
          setTimeout(() => {
            login(response.data.user, response.data.token);
            navigate('/');
          }, 2000);
        }
      } catch (error: any) {
        setStatus('error');
        setMessage(error.response?.data?.error || 'Error al verificar email');
      }
    };

    verifyEmail();
  }, [token, navigate, login]);

  return (
    <div className="verify-email-container">
      <div className="verify-email-box">
        <div className={`verify-email-status ${status}`}>
          {status === 'loading' && (
            <div className="spinner"></div>
          )}
          {status === 'success' && (
            <span className="check-mark">✓</span>
          )}
          {status === 'error' && (
            <span className="error-mark">✕</span>
          )}
        </div>
        
        <h2 className={`verify-email-title ${status}`}>
          {status === 'loading' && 'Verificando Email'}
          {status === 'success' && 'Email Verificado'}
          {status === 'error' && 'Error de Verificación'}
        </h2>
        
        <p className="verify-email-message">{message}</p>

        {status === 'success' && (
          <p className="verify-email-redirect">Serás redirigido en segundos...</p>
        )}

        {status === 'error' && (
          <div className="verify-email-actions">
            <button
              className="btn btn-primary"
              onClick={() => navigate('/auth/resend')}
            >
              Reenviar Email
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/auth/login')}
            >
              Volver al Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import './resend-verification.css';

export const ResendVerification: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await apiClient.post('/auth/resend-verification', { email });
      setMessageType('success');
      setMessage('✓ Email de verificación reenviado. Por favor revisa tu bandeja de entrada.');
      setEmail('');
      
      setTimeout(() => {
        navigate('/auth/login');
      }, 3000);
    } catch (error: any) {
      setMessageType('error');
      setMessage(error.response?.data?.error || 'Error al reenviar email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resend-verification-container">
      <div className="resend-verification-box">
        <h2>Reenviar Email de Verificación</h2>
        <p className="subtitle">Ingresa tu email para recibir un nuevo enlace de verificación</p>

        {message && (
          <div className={`alert alert-${messageType}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Enviando...' : 'Reenviar Email'}
          </button>
        </form>

        <p className="back-link">
          ¿Tienes el enlace? 
          <button
            type="button"
            onClick={() => navigate('/auth/login')}
            className="link-button"
          >
            Volver al Login
          </button>
        </p>
      </div>
    </div>
  );
};

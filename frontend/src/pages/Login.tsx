import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import './auth.css';

export const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [requiresVerification, setRequiresVerification] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setRequiresVerification(false);

    try {
      const response = await authAPI.login(formData.email, formData.password);
      login(response.data.user, response.data.token);
      navigate('/');
    } catch (err: any) {
      if (err.response?.status === 403 && err.response?.data?.requiresVerification) {
        setRequiresVerification(true);
        setUnverifiedEmail(formData.email);
        setError('');
      } else {
        setError(err.response?.data?.error || 'Error al iniciar sesión');
      }
    } finally {
      setLoading(false);
    }
  };

  if (requiresVerification) {
    return (
      <div className="auth-container">
        <div className="auth-background"></div>
        <div className="auth-wrapper">
          <div className="auth-card verification-card">
            <div className="verification-icon">
              <i className="fa fa-envelope"></i>
            </div>
            <h2>Email No Verificado</h2>
            <p>Antes de iniciar sesión, necesitas verificar tu correo electrónico.</p>
            
            <div className="verification-info">
              <div className="info-item">
                <i className="fa fa-check"></i>
                <span>Revisa tu correo: <strong>{unverifiedEmail}</strong></span>
              </div>
              <div className="info-item">
                <i className="fa fa-link"></i>
                <span>Busca el enlace de verificación de Amanwal</span>
              </div>
              <div className="info-item">
                <i className="fa fa-click"></i>
                <span>Haz clic para verificar tu cuenta</span>
              </div>
            </div>

            <div className="action-buttons">
              <button
                className="auth-btn primary"
                onClick={() => navigate('/auth/resend')}
              >
                <i className="fa fa-envelope-open"></i>
                Reenviar Email
              </button>
              <button
                className="auth-btn secondary"
                onClick={() => {
                  setRequiresVerification(false);
                  setFormData({ email: '', password: '' });
                }}
              >
                <i className="fa fa-arrow-left"></i>
                Volver
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-background"></div>
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Iniciar Sesión</h1>
            <p>Bienvenido de vuelta a Amanwal</p>
          </div>

          {error && (
            <div className="auth-alert error">
              <i className="fa fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">
                <i className="fa fa-envelope"></i>
                Email
              </label>
              <input
                type="email"
                className="auth-input"
                id="email"
                name="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <i className="fa fa-lock"></i>
                Contraseña
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  className="auth-input"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="auth-btn primary full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fa fa-spinner fa-spin"></i>
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <i className="fa fa-sign-in"></i>
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>¿No tienes cuenta?</span>
          </div>

          <button
            className="auth-btn secondary full"
            onClick={() => navigate('/register')}
          >
            <i className="fa fa-user-plus"></i>
            Crear Nueva Cuenta
          </button>
        </div>
      </div>
    </div>
  );
};

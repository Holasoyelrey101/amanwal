import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import './auth.css';

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    birthDate: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [requiresVerification, setRequiresVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    // Validar edad mínima (18 años)
    const birthDate = new Date(formData.birthDate);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (age < 18 || (age === 18 && monthDiff < 0)) {
      setError('Debes tener al menos 18 años para registrarte');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.register(
        formData.email,
        formData.name,
        formData.password,
        formData.birthDate
      );

      // Si requiresVerification es true, mostrar el mensaje de verificación
      if (response.data.requiresVerification) {
        setRequiresVerification(true);
        setVerificationEmail(formData.email);
        setFormData({ email: '', name: '', birthDate: '', password: '', confirmPassword: '' });
      } else {
        // Si no, login automático (caso antiguo)
        login(response.data.user, response.data.token);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al registrarse');
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
            <h2>Verifica tu Email</h2>
            <p>Te hemos enviado un enlace de verificación a tu correo electrónico.</p>
            
            <div className="verification-info">
              <div className="info-item">
                <i className="fa fa-envelope"></i>
                <span>Email: <strong>{verificationEmail}</strong></span>
              </div>
              <div className="info-item">
                <i className="fa fa-click"></i>
                <span>Haz clic en el enlace en el correo para verificar tu cuenta</span>
              </div>
              <div className="info-item">
                <i className="fa fa-clock"></i>
                <span>El enlace expira en 24 horas</span>
              </div>
            </div>

            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginBottom: '20px', fontWeight: '500' }}>
              Una vez verificado, podrás iniciar sesión en tu cuenta
            </p>

            <div className="action-buttons">
              <button
                className="auth-btn primary"
                onClick={() => navigate('/login')}
              >
                <i className="fa fa-sign-in"></i>
                Ir a Iniciar Sesión
              </button>
              <button
                className="auth-btn secondary"
                onClick={() => {
                  setRequiresVerification(false);
                  setFormData({
                    email: '',
                    name: '',
                    birthDate: '',
                    password: '',
                    confirmPassword: '',
                  });
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
            <h1>Crear Cuenta</h1>
            <p>Únete a Amanwal hoy</p>
          </div>

          {error && (
            <div className="auth-alert error">
              <i className="fa fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="name">
                <i className="fa fa-user"></i>
                Nombre Completo
              </label>
              <input
                type="text"
                className="auth-input"
                id="name"
                name="name"
                placeholder="Juan Pérez"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

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
              <label htmlFor="birthDate">
                <i className="fa fa-calendar"></i>
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                className="auth-input"
                id="birthDate"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                required
              />
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '4px', fontWeight: '500' }}>
                Debes ser mayor de 18 años
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <i className="fa fa-lock"></i>
                Contraseña
              </label>
              <input
                type="password"
                className="auth-input"
                id="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '4px', fontWeight: '500' }}>
                Mínimo 6 caracteres
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">
                <i className="fa fa-lock"></i>
                Confirmar Contraseña
              </label>
              <input
                type="password"
                className="auth-input"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="auth-btn primary full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fa fa-spinner fa-spin"></i>
                  Creando cuenta...
                </>
              ) : (
                <>
                  <i className="fa fa-user-plus"></i>
                  Crear Cuenta
                </>
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>¿Ya tienes cuenta?</span>
          </div>

          <button
            className="auth-btn secondary full"
            onClick={() => navigate('/login')}
          >
            <i className="fa fa-sign-in"></i>
            Iniciar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

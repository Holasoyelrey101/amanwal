import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [requiresVerification, setRequiresVerification] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
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
      // Si el error es 403 y requiresVerification está en true, mostrar opción de reenviar
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
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow border-warning">
              <div className="card-body p-5">
                <div className="mb-4" style={{ fontSize: '50px', textAlign: 'center' }}>📧</div>
                <h2 className="card-title text-center text-warning mb-3">Email No Verificado</h2>
                <p className="text-muted mb-4">
                  Antes de iniciar sesión, necesitas verificar tu correo electrónico.
                </p>
                
                <div className="alert alert-info" role="alert">
                  <strong>¿Qué hacer?</strong>
                  <ul className="mb-0 mt-2">
                    <li>Revisa tu correo electrónico: <strong>{unverifiedEmail}</strong></li>
                    <li>Busca un email de Amanwal con un enlace de verificación</li>
                    <li>Haz clic en el enlace para verificar tu cuenta</li>
                  </ul>
                </div>

                <p className="text-muted mb-3">¿No recibes el email?</p>
                
                <button
                  className="btn btn-primary w-100"
                  onClick={() => navigate('/auth/resend')}
                >
                  Reenviar Email de Verificación
                </button>

                <hr className="my-4" />

                <button
                  className="btn btn-outline-secondary w-100"
                  onClick={() => {
                    setRequiresVerification(false);
                    setFormData({ email: '', password: '' });
                  }}
                >
                  Intentar Nuevamente con Otro Email
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body p-5">
              <h2 className="card-title text-center mb-4">Iniciar Sesión</h2>
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </button>
              </form>
              <p className="text-center mt-3">
                ¿No tienes cuenta?{' '}
                <a href="/register" className="text-decoration-none">
                  Regístrate aquí
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

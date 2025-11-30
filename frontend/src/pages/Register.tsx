import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import { useAuth } from '../context/AuthContext';

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.register(
        formData.email,
        formData.name,
        formData.password
      );

      // Si requiresVerification es true, mostrar el mensaje de verificación
      if (response.data.requiresVerification) {
        setRequiresVerification(true);
        setVerificationEmail(formData.email);
        setSuccess(`✓ Cuenta creada! Hemos enviado un enlace de verificación a ${formData.email}`);
        setFormData({ email: '', name: '', password: '', confirmPassword: '' });
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
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow border-success">
              <div className="card-body p-5 text-center">
                <div className="mb-4" style={{ fontSize: '60px' }}>✓</div>
                <h2 className="card-title text-success mb-3">¡Bienvenido!</h2>
                <p className="text-muted mb-4">
                  Tu cuenta ha sido creada exitosamente. Hemos enviado un enlace de verificación a:
                </p>
                <p className="fw-bold text-dark mb-4">{verificationEmail}</p>
                <p className="text-muted mb-4">
                  Por favor verifica tu email haciendo clic en el enlace. El enlace expira en 24 horas.
                </p>
                
                <div className="alert alert-info" role="alert">
                  <strong>📧 Revisa tu bandeja de entrada</strong>
                  <p className="mt-2 mb-0">Si no ves el email, revisa tu carpeta de spam</p>
                </div>

                <div className="mt-4">
                  <p className="text-muted mb-3">¿No recibiste el email?</p>
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => navigate('/auth/resend')}
                  >
                    Reenviar Email
                  </button>
                </div>

                <hr className="my-4" />

                <p className="text-muted small">
                  Una vez verifiques tu email, podrás iniciar sesión con tu cuenta.
                </p>
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
              <h2 className="card-title text-center mb-4">Crear Cuenta</h2>
              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
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
                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirmar Contraseña
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? 'Registrando...' : 'Registrarse'}
                </button>
              </form>
              <p className="text-center mt-3">
                ¿Ya tienes cuenta?{' '}
                <a href="/login" className="text-decoration-none">
                  Inicia sesión aquí
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { CabinList } from './pages/CabinList';
import { CabinDetail } from './pages/CabinDetail';
import { AdminDashboard } from './pages/AdminDashboard';
import { Profile } from './pages/Profile';
import { MyBookings } from './pages/MyBookings';
import { PaymentResult } from './pages/PaymentResult';
import { VerifyEmail } from './pages/VerifyEmail';
import { ResendVerification } from './pages/ResendVerification';
import PaymentFlow from './components/PaymentFlow';
import apiClient from './api/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './theme.css';
import './App.css';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin } = useAuth();
  return isAdmin ? <>{children}</> : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <div className="d-flex flex-column min-vh-100">
            <Navbar />
            <main className="flex-grow-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email/:token" element={<VerifyEmail />} />
              <Route path="/auth/resend" element={<ResendVerification />} />
              <Route path="/cabins" element={<CabinList />} />
              <Route path="/cabins/:id" element={<CabinDetail />} />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route
                path="/my-bookings"
                element={
                  <PrivateRoute>
                    <MyBookings />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/payment/:bookingId"
                element={
                  <PrivateRoute>
                    <PaymentFlowWrapper />
                  </PrivateRoute>
                }
              />
              <Route
                path="/payment-return/:bookingId"
                element={
                  <PrivateRoute>
                    <PaymentReturnWrapper />
                  </PrivateRoute>
                }
              />
              <Route
                path="/payment-result/:bookingId"
                element={
                  <PrivateRoute>
                    <PaymentResult />
                  </PrivateRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

function PaymentFlowWrapper() {
  const { bookingId } = useParams();
  return <PaymentFlow bookingId={bookingId} />;
}

function PaymentReturnWrapper() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = React.useState(false);

  React.useEffect(() => {
    const confirmPayment = async () => {
      try {
        if (!bookingId) {
          navigate('/my-bookings');
          return;
        }

        // Confirmar la reserva del usuario
        await apiClient.patch(`/bookings/${bookingId}/confirm`, {});
        console.log('Reserva confirmada automáticamente');
      } catch (error) {
        console.error('Error al confirmar reserva:', error);
        // Continuar de todas formas
      }

      // Mostrar el mensaje de éxito
      setShowSuccess(true);

      // Después de 5 segundos redirigir a mis reservas
      setTimeout(() => {
        navigate('/my-bookings');
      }, 5000);
    };

    confirmPayment();
  }, [bookingId, navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh', 
      backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
    }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { 
            transform: scale(1);
            opacity: 1;
          }
          50% { 
            transform: scale(1.15);
            opacity: 0.9;
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .success-container {
          animation: slideDown 0.6s ease-out;
        }
        
        .success-emoji {
          animation: pulse 1.5s ease-in-out infinite;
        }
        
        .success-confetti {
          position: fixed;
          width: 10px;
          height: 10px;
          background: #FFD700;
          pointer-events: none;
        }
      `}</style>

      <div className="success-container" style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '60px 50px',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        maxWidth: '550px',
        width: '100%',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Fondo decorativo */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
        }}></div>

        {showSuccess ? (
          <>
            <div className="success-emoji" style={{
              fontSize: '100px',
              marginBottom: '30px',
              display: 'inline-block'
            }}>
              ✅
            </div>
            
            <h1 style={{
              color: '#667eea',
              fontSize: '36px',
              marginBottom: '15px',
              fontWeight: 'bold',
              margin: '0 0 15px 0'
            }}>
              ¡Pago Realizado!
            </h1>

            <div style={{
              height: '4px',
              width: '80px',
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
              margin: '20px auto',
              borderRadius: '2px'
            }}></div>

            <p style={{
              fontSize: '18px',
              color: '#333',
              marginBottom: '15px',
              lineHeight: '1.6',
              fontWeight: '500'
            }}>
              Tu pago ha sido procesado exitosamente.
            </p>

            <p style={{
              fontSize: '15px',
              color: '#666',
              marginBottom: '30px',
              lineHeight: '1.5'
            }}>
              Tu reserva ha sido confirmada. Puedes ver todos los detalles en la sección <strong>"Mis Reservas"</strong>.
            </p>

            <div style={{
              backgroundColor: '#f0f4ff',
              padding: '20px',
              borderRadius: '10px',
              marginBottom: '30px',
              border: '2px solid #e0e8ff'
            }}>
              <p style={{
                fontSize: '14px',
                color: '#667eea',
                margin: 0,
                fontWeight: '500'
              }}>
                📧 Revisa tu correo para el comprobante de la reserva
              </p>
            </div>

            <div style={{
              fontSize: '14px',
              color: '#999',
              fontStyle: 'italic'
            }}>
              Redirigiendo en unos momentos...
            </div>

            {/* Barra de progreso */}
            <div style={{
              marginTop: '20px',
              height: '3px',
              backgroundColor: '#e0e0e0',
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                animation: 'slideRight 5s ease-out forwards',
                borderRadius: '3px'
              }}></div>
            </div>
          </>
        ) : (
          <>
            <div style={{
              fontSize: '60px',
              marginBottom: '20px',
              animation: 'pulse 1.5s ease-in-out infinite'
            }}>
              ⏳
            </div>
            <h2 style={{
              color: '#667eea',
              fontSize: '24px',
              marginBottom: '15px'
            }}>
              Procesando pago...
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#666',
              marginBottom: '20px'
            }}>
              Por favor espera un momento mientras confirmamos tu pago.
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#667eea',
                borderRadius: '50%',
                animation: 'pulse 1.5s ease-in-out infinite'
              }}></div>
              <div style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#667eea',
                borderRadius: '50%',
                animation: 'pulse 1.5s ease-in-out 0.2s infinite'
              }}></div>
              <div style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#667eea',
                borderRadius: '50%',
                animation: 'pulse 1.5s ease-in-out 0.4s infinite'
              }}></div>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes slideRight {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default App;


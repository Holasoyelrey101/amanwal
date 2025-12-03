import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './home.css';

export const Home: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="home-container">
      {/* Hero Section */}
      <div className="hero-section" style={{ transform: `translateY(${scrollY * 0.5}px)` }}>
        <div className="hero-background">
          <div className="hero-gradient-1"></div>
          <div className="hero-gradient-2"></div>
          <div className="hero-particles">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="particle" style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.1}s`
              }}></div>
            ))}
          </div>
        </div>

        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Bienvenido a <span className="brand-highlight">Amanwal</span>
            </h1>
            <p className="hero-subtitle">
              Descubre y reserva las cabañas más hermosas para tu próxima aventura
            </p>
            <div className="hero-buttons">
              <Link to="/cabins" className="btn-explore">
                <span>Explorar Cabañas</span>
                <i className="fa fa-arrow-right"></i>
              </Link>
              <Link to="/cabins" className="btn-secondary-hero">
                <i className="fa fa-search"></i>
                <span>Buscar</span>
              </Link>
            </div>
          </div>


        </div>

        <div className="hero-scroll-indicator">
          <div className="scroll-dot"></div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <div className="features-container">
          <div className="section-header">
            <h2 className="section-title">Por qué elegir Amanwal</h2>
            <p className="section-subtitle">Experiencias inolvidables te esperan</p>
          </div>

          <div className="features-grid">
            <div className="feature-card" style={{ animationDelay: '0.1s' }}>
              <div className="feature-icon premium">🏡</div>
              <h3 className="feature-title">Cabañas Premium</h3>
              <p className="feature-description">
                Selecciona entre nuestras cabañas cuidadosamente diseñadas y decoradas con los mejores acabados
              </p>
              <div className="feature-benefits">
                <span className="benefit-tag">Ubicaciones ideales</span>
                <span className="benefit-tag">Comodidades modernas</span>
              </div>
            </div>

            <div className="feature-card" style={{ animationDelay: '0.2s' }}>
              <div className="feature-icon easy">📅</div>
              <h3 className="feature-title">Reservas Fáciles</h3>
              <p className="feature-description">
                Reserva tu cabaña en pocos clics, sin complicaciones ni trámites innecesarios
              </p>
              <div className="feature-benefits">
                <span className="benefit-tag">Proceso rápido</span>
                <span className="benefit-tag">Pago seguro</span>
              </div>
            </div>

            <div className="feature-card" style={{ animationDelay: '0.3s' }}>
              <div className="feature-icon reviews">⭐</div>
              <h3 className="feature-title">Reseñas Reales</h3>
              <p className="feature-description">
                Lee opiniones verificadas de huéspedes anteriores y elige con confianza
              </p>
              <div className="feature-benefits">
                <span className="benefit-tag">Opiniones verificadas</span>
                <span className="benefit-tag">Transparencia total</span>
              </div>
            </div>

            <div className="feature-card" style={{ animationDelay: '0.4s' }}>
              <div className="feature-icon support">💬</div>
              <h3 className="feature-title">Soporte 24/7</h3>
              <p className="feature-description">
                Nuestro equipo está disponible para ayudarte en cualquier momento
              </p>
              <div className="feature-benefits">
                <span className="benefit-tag">Atención inmediata</span>
                <span className="benefit-tag">Disponible siempre</span>
              </div>
            </div>

            <div className="feature-card" style={{ animationDelay: '0.5s' }}>
              <div className="feature-icon prices">💰</div>
              <h3 className="feature-title">Mejores Precios</h3>
              <p className="feature-description">
                Obtén las mejores ofertas y promociones exclusivas para nuestros clientes
              </p>
              <div className="feature-benefits">
                <span className="benefit-tag">Descuentos especiales</span>
                <span className="benefit-tag">Sin cargos ocultos</span>
              </div>
            </div>

            <div className="feature-card" style={{ animationDelay: '0.6s' }}>
              <div className="feature-icon security">🔒</div>
              <h3 className="feature-title">100% Seguro</h3>
              <p className="feature-description">
                Tus datos y pagos están protegidos con los más altos estándares de seguridad
              </p>
              <div className="feature-benefits">
                <span className="benefit-tag">Encriptado</span>
                <span className="benefit-tag">Garantizado</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        <div className="cta-background">
          <div className="cta-gradient"></div>
        </div>
        <div className="cta-content">
          <h2 className="cta-title">¿Listo para tu próxima aventura?</h2>
          <p className="cta-subtitle">Comienza a explorar nuestras cabañas hoy mismo</p>
          <Link to="/cabins" className="btn-cta-primary">
            Explorar Ahora
          </Link>
        </div>
      </div>
    </div>
  );
};

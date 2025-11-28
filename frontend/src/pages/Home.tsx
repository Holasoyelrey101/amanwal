import React from 'react';
import { Link } from 'react-router-dom';

export const Home: React.FC = () => {
  return (
    <div>
      {/* Hero Section */}
      <div className="bg-dark text-white py-5 text-center">
        <div className="container">
          <h1 className="display-4 fw-bold mb-3">Bienvenido a Amanwal</h1>
          <p className="lead mb-4">
            Descubre y reserva las cabañas más hermosas para tu próxima aventura
          </p>
          <Link to="/cabins" className="btn btn-primary btn-lg">
            Explorar Cabañas
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-5">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card text-center">
                <div className="card-body">
                  <h2 className="text-primary mb-3">🏡 Cabañas Premium</h2>
                  <p className="card-text">
                    Selecciona entre nuestras cabañas cuidadosamente diseñadas
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card text-center">
                <div className="card-body">
                  <h2 className="text-primary mb-3">📅 Reservas Fáciles</h2>
                  <p className="card-text">
                    Reserva tu cabaña en pocos clics, sin complicaciones
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card text-center">
                <div className="card-body">
                  <h2 className="text-primary mb-3">⭐ Reseñas Reales</h2>
                  <p className="card-text">
                    Lee opiniones de huéspedes anteriores
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

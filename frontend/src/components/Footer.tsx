import React from 'react';
import './footer.css';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer bg-dark text-white mt-5 py-4">
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-4 mb-3">
            <h5>🏠 Amanwal</h5>
            <p className="small">Tus cabañas de ensueño te esperan</p>
          </div>
          <div className="col-md-4 mb-3">
            <h6>Enlaces Rápidos</h6>
            <ul className="list-unstyled small">
              <li><a href="/cabins" className="text-white-50 text-decoration-none">Cabañas</a></li>
              <li><a href="/my-bookings" className="text-white-50 text-decoration-none">Mis Reservas</a></li>
              <li><a href="/profile" className="text-white-50 text-decoration-none">Perfil</a></li>
            </ul>
          </div>
          <div className="col-md-4 mb-3">
            <h6>Contacto</h6>
            <p className="small">
              Email: info@amanwal.com<br />
              Teléfono: +34 XXX XXX XXX
            </p>
          </div>
        </div>
        <hr className="bg-white-50" />
        <div className="text-center">
          <p className="small mb-0">
            &copy; {currentYear} <strong>Cabañas Amanwal</strong>. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

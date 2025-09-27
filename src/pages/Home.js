import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="container mt-5">
      <section className="text-center mb-5">
        <h1 className="display-4 mb-4">Descubre las mejores ofertas y actividades</h1>
        <p className="lead mb-4">Explora nuestro catálogo sin necesidad de registro o inicia sesión para participar y disfrutar de beneficios exclusivos</p>
        <Link to="/offers" className="btn btn-primary btn-lg">Ver ofertas disponibles</Link>
      </section>

      <section className="row">
        <div className="col-md-4 mb-4">
          <div className="card h-100 text-center">
            <div className="card-body">
              <div className="display-4 mb-3">📱</div>
              <h3>Acceso Multiplataforma</h3>
              <p>Disponible en web y aplicación móvil para que accedas desde cualquier dispositivo</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card h-100 text-center">
            <div className="card-body">
              <div className="display-4 mb-3">👀</div>
              <h3>Navega Sin Límites</h3>
              <p>Explora todas nuestras ofertas y actividades sin necesidad de crear una cuenta</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card h-100 text-center">
            <div className="card-body">
              <div className="display-4 mb-3">🎯</div>
              <h3>Participa y Gana</h3>
              <p>Regístrate para participar en actividades exclusivas y obtener recompensas especiales</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
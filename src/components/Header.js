import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = ({ currentUser, onLogout }) => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <header className="bg-primary text-white p-3">
      <div className="container">
        <nav className="d-flex justify-content-between align-items-center">
          <Link to="/" className="text-white text-decoration-none">
            <h1 className="h4 m-0">🛒 OfertasApp</h1>
          </Link>
          
          <div className="d-flex align-items-center">
            <Link to="/" className="text-white mx-2 text-decoration-none">Inicio</Link>
            <Link to="/offers" className="text-white mx-2 text-decoration-none">Ofertas</Link>
            <Link to="/activities" className="text-white mx-2 text-decoration-none">Actividades</Link>
            
            {currentUser ? (
              <div className="dropdown ms-3">
                <button className="btn btn-outline-light dropdown-toggle" type="button" data-bs-toggle="dropdown">
                  👤 {currentUser.nombre}
                </button>
                <ul className="dropdown-menu">
                  <li><Link to="/profile" className="dropdown-item">Mi Perfil</Link></li>
                  <li><Link to="/favorites" className="dropdown-item">⭐ Mis Favoritos</Link></li>
                  <li><hr className="dropdown-divider"/></li>
                  <li><button className="dropdown-item" onClick={onLogout}>Cerrar Sesión</button></li>
                </ul>
              </div>
            ) : (
              <button className="btn btn-outline-light ms-3" onClick={handleLoginClick}>
                Iniciar Sesión
              </button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
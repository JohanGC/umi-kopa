import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Header = ({ currentUser, onLogout }) => {
  const navigate = useNavigate();
  const { getTotalItems } = useCart();

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <header className="fondo-header p-3 cont-one">
      <div className="container">
        <nav className="d-flex justify-content-between align-items-center">
          <Link to="/">
            <img className="logo" src='logoKopa_W.svg'></img>
          </Link>
          
          <div className="d-flex align-items-center">
            <Link to="/" className="text-white mx-2 text-decoration-none">Inicio</Link>
            <Link to="/offers" className="text-white mx-2 text-decoration-none">Ofertas</Link>
            <Link to="/activities" className="text-white mx-2 text-decoration-none">Actividades</Link>
            
            {/* Icono del carrito */}
            <button 
              className="btn btn-header position-relative ms-3"
              onClick={() => navigate('/cart')}
            >
              🛍️ Carrito
              {getTotalItems() > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {getTotalItems()}
                </span>
              )}
            </button>

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
                  {currentUser && (currentUser.rol === 'oferente' || currentUser.rol === 'administrador') && (
                    <>
                      <li><Link to="/my-offers" className="dropdown-item">🏷️ Mis Ofertas</Link></li>
                      <li><Link to="/my-activities" className="dropdown-item">🎯 Mis Actividades</Link></li>
                      <li><hr className="dropdown-divider"/></li>
                    </>
                  )}
                </ul>
              </div>
            ) : (
              <button className="btn btn-header ms-3" onClick={handleLoginClick}>
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
// components/Navbar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ currentUser, onLogout }) => {
  const location = useLocation();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand" to="/">
          🛵 MiApp
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {currentUser && (
              <li className="nav-item">
                <Link 
                  className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`} 
                  to="/dashboard"
                >
                  Dashboard
                </Link>
              </li>
            )}
          </ul>
          
          <ul className="navbar-nav">
            {currentUser ? (
              <>
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`} 
                    to="/profile"
                  >
                    👤 {currentUser.nombre || currentUser.email}
                  </Link>
                </li>
                {currentUser.rol === 'mandadito' && (
                  <li className="nav-item">
                    <Link 
                      className={`nav-link ${location.pathname === '/mandadito-dashboard' ? 'active' : ''}`} 
                      to="/mandadito-dashboard"
                    >
                      🛵 Panel Mandadito
                    </Link>
                  </li>
                )}
                {currentUser.rol === 'admin' && (
                  <li className="nav-item">
                    <Link 
                      className={`nav-link ${location.pathname === '/admin-dashboard' ? 'active' : ''}`} 
                      to="/admin-dashboard"
                    >
                      ⚙️ Admin
                    </Link>
                  </li>
                )}
                <li className="nav-item">
                  <button 
                    className="btn btn-outline-light btn-sm ms-2"
                    onClick={onLogout}
                  >
                    Cerrar Sesión
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`} 
                    to="/login"
                  >
                    Iniciar Sesión
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${location.pathname === '/register' ? 'active' : ''}`} 
                    to="/register"
                  >
                    Registrarse
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
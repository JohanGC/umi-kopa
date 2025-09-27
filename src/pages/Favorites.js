import React, { useState, useEffect } from 'react';
import { dataService } from '../services/dataService';
import { authService } from '../services/auth';
import { useNavigate } from 'react-router-dom';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [offers, setOffers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    
    if (user) {
      const userFavorites = dataService.getUserFavorites(user.email);
      setFavorites(userFavorites);
      
      const allOffers = dataService.getOffers();
      const allActivities = dataService.getActivities();
      setOffers(allOffers);
      setActivities(allActivities);
    }
  }, []);

  const getFavoriteItems = () => {
    const favoriteItems = [];
    
    favorites.forEach(fav => {
      if (fav.type === 'offer') {
        const offer = offers.find(o => o.id === fav.id);
        if (offer) favoriteItems.push({ ...offer, type: 'offer' });
      } else if (fav.type === 'activity') {
        const activity = activities.find(a => a.id === fav.id);
        if (activity) favoriteItems.push({ ...activity, type: 'activity' });
      }
    });
    
    return favoriteItems;
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  const handleRemoveFavorite = (itemId, type) => {
    if (currentUser) {
      dataService.removeFromFavorites(itemId, currentUser.email, type);
      const updatedFavorites = dataService.getUserFavorites(currentUser.email);
      setFavorites(updatedFavorites);
    }
  };

  const handleNavigate = (type) => {
    if (type === 'offer') {
      navigate('/offers');
    } else {
      navigate('/activities');
    }
  };

  const favoriteItems = getFavoriteItems();

  if (!currentUser) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning text-center">
          <h4>🔒 Acceso restringido</h4>
          <p>Debes iniciar sesión para ver tus favoritos.</p>
          <button className="btn btn-primary" onClick={() => navigate('/login')}>
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">⭐ Mis Favoritos</h2>
      
      {favoriteItems.length === 0 ? (
        <div className="alert alert-info text-center">
          <h4>📝 Aún no tienes favoritos</h4>
          <p>Explora las ofertas y actividades y agrega tus favoritos haciendo clic en la estrella ☆</p>
          <div className="mt-3">
            <button className="btn btn-primary me-2" onClick={() => navigate('/offers')}>
              Ver Ofertas
            </button>
            <button className="btn btn-success" onClick={() => navigate('/activities')}>
              Ver Actividades
            </button>
          </div>
        </div>
      ) : (
        <div className="row">
          {favoriteItems.map(item => (
            <div key={`${item.type}-${item.id}`} className="col-md-6 mb-4">
              <div className="card h-100">
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <span className="display-4">{item.image}</span>
                    <div>
                      <span className="badge bg-warning text-dark me-2">⭐ Favorito</span>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRemoveFavorite(item.id, item.type)}
                        title="Quitar de favoritos"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="card-title">{item.title}</h3>
                  <p className="card-text flex-grow-1">{item.description}</p>
                  
                  <div className="mb-2">
                    <span className="badge bg-success fs-6">{item.discount} DESCUENTO</span>
                    <span className={`badge ms-2 fs-6 ${item.type === 'activity' ? 'bg-info' : 'bg-primary'}`}>
                      {item.type === 'activity' ? 'Actividad' : 'Oferta'}
                    </span>
                  </div>
                  
                  {item.date && (
                    <div className="mb-2">
                      <small className="text-muted">📅 {formatDate(item.date)}</small>
                    </div>
                  )}
                  
                  <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        Participantes: {item.participants}/{item.maxParticipants}
                      </small>
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => handleNavigate(item.type)}
                      >
                        {item.type === 'activity' ? 'Ver Actividad' : 'Ver Oferta'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
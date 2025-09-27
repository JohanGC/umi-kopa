import React, { useState, useEffect } from 'react';
import { authService } from '../services/auth';
import { dataService } from '../services/dataService';

const FavoriteButton = ({ itemId, type }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    
    if (user) {
      const favoriteStatus = dataService.isItemFavorite(itemId, user.email, type);
      setIsFavorite(favoriteStatus);
    }
  }, [itemId, type]);

  const toggleFavorite = () => {
    if (!currentUser) {
      alert('Debes iniciar sesión para agregar a favoritos');
      return;
    }

    if (isFavorite) {
      dataService.removeFromFavorites(itemId, currentUser.email, type);
      setIsFavorite(false);
    } else {
      dataService.addToFavorites(itemId, currentUser.email, type);
      setIsFavorite(true);
    }
  };

  return (
    <button 
      className={`btn btn-sm ${isFavorite ? 'btn-warning' : 'btn-outline-warning'}`}
      onClick={toggleFavorite}
      title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
    >
      {isFavorite ? '★' : '☆'}
    </button>
  );
};

export default FavoriteButton;
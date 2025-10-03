import { authAPI, offersAPI, activitiesAPI, favoritesAPI } from './api';

export const authService = {
  // Login con API real
  login: async (email, password) => {
    const response = await authAPI.login(email, password);
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    return response.user;
  },

  // Registro con API real
  register: async (nombre, email, password) => {
    const response = await authAPI.register(nombre, email, password);
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    return response.user;
  },

  // Obtener usuario actual
  getCurrentUser: () => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  },

  // Cerrar sesión
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Verificar token (opcional)
  verifyToken: async () => {
    try {
      const user = await authAPI.getProfile();
      return user;
    } catch (error) {
      authService.logout();
      return null;
    }
  }
};

// Actualizar dataService para usar APIs reales
export const dataService = {
  getOffers: () => offersAPI.getAll(),
  getActivities: () => activitiesAPI.getAll(),
  participateInOffer: (offerId) => offersAPI.participate(offerId),
  participateInActivity: (activityId) => activitiesAPI.participate(activityId),
  
  // Favoritos con API real
  addToFavorites: (itemId, itemType) => 
    favoritesAPI.addFavorite(itemId, itemType),
  
  removeFromFavorites: (itemId, itemType) => 
    favoritesAPI.removeFavorite(itemId, itemType),
  
  getUserFavorites: () => favoritesAPI.getFavorites()
};
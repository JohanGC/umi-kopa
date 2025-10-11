import { authAPI, offersAPI, activitiesAPI, favoritesAPI } from './api';

export const authService = {
  // Login con API real
  login: async (email, password) => {
    try {
      console.log('🔑 Intentando login...', { email });
      const response = await authAPI.login(email, password);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      return response.user;
    } catch (error) {
      console.error('❌ Error en login:', error);
      throw error;
    }
  },

  // Registro con API real - CORREGIDO
  register: async (userData) => { // ✅ Cambiado para recibir objeto completo
    try {
      console.log('📝 Intentando registrar usuario...', userData);
      const response = await authAPI.register(userData);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      return response.user;
    } catch (error) {
      console.error('❌ Error en registro:', error);
      throw error;
    }
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

  // Verificar token
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
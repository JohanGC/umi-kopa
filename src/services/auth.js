import { authAPI, offersAPI, activitiesAPI, favoritesAPI } from './api';

// Función auxiliar para guardar usuarios en la lista del AdminPanel
const saveUserToAdminList = (userData) => {
  try {
    // Obtener usuarios existentes
    const existingUsers = JSON.parse(localStorage.getItem('ofertasApp_users') || '[]');
    
    // Verificar si el usuario ya existe por email
    const userExists = existingUsers.some(user => user.email === userData.email);
    
    if (!userExists) {
      // Crear nuevo usuario con todos los datos necesarios
      const newUser = {
        _id: userData._id || Date.now().toString(),
        nombre: userData.nombre,
        email: userData.email,
        telefono: userData.telefono || '',
        rol: userData.rol,
        empresa: userData.empresa || '',
        direccion: userData.direccion || '',
        verificada: userData.verificada || false,
        activo: true,
        createdAt: userData.createdAt || new Date().toISOString()
      };
      
      // Agregar a la lista
      existingUsers.push(newUser);
      localStorage.setItem('ofertasApp_users', JSON.stringify(existingUsers));
      console.log('✅ Usuario guardado en lista admin:', newUser);
    }
    
    return existingUsers;
  } catch (error) {
    console.error('❌ Error guardando usuario en lista admin:', error);
  }
};

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

  // Registro con API real - MODIFICADO
  register: async (userData) => {
    try {
      console.log('📝 Intentando registrar usuario...', userData);
      const response = await authAPI.register(userData);
      
      // Guardar en localStorage de autenticación
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // ✅ GUARDAR TAMBIÉN EN LA LISTA DEL ADMINPANEL
      saveUserToAdminList(response.user);
      
      return response.user;
    } catch (error) {
      console.error('❌ Error en registro con API:', error);
      
      // ✅ FALLBACK: Si la API falla, crear usuario localmente
      console.log('🔄 Usando registro local como fallback...');
      
      const fallbackUser = {
        _id: Date.now().toString(),
        nombre: userData.nombre,
        email: userData.email,
        telefono: userData.telefono || '',
        rol: userData.rol || 'usuario',
        empresa: userData.empresa || '',
        direccion: userData.direccion || '',
        verificada: false,
        activo: true,
        createdAt: new Date().toISOString()
      };
      
      // Guardar en ambos lugares
      localStorage.setItem('user', JSON.stringify(fallbackUser));
      localStorage.setItem('token', 'fallback-token-' + Date.now());
      saveUserToAdminList(fallbackUser);
      
      console.log('✅ Usuario creado localmente:', fallbackUser);
      return fallbackUser;
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
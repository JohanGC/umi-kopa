const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Función genérica para hacer requests - CORREGIDA
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  // ✅ CORREGIDO: Si hay body, convertirlo a JSON
  if (config.body && typeof config.body !== 'string') {
    config.body = JSON.stringify(config.body);
  }

  try {
    console.log(`🔄 Enviando request a: ${API_BASE_URL}${endpoint}`, config);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error en la solicitud');
    }
    
    return data;
  } catch (error) {
    console.error('❌ Error en apiRequest:', error);
    throw error;
  }
};

// Servicios específicos - CORREGIDOS
export const authAPI = {
  login: (email, password) => 
    apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password } // ✅ Solo el objeto, apiRequest lo convierte
    }),

  register: (userData) => // ✅ Cambiado para recibir objeto completo
    apiRequest('/auth/register', {
      method: 'POST',
      body: userData
    }),

  getProfile: () => apiRequest('/auth/profile')
};

export const offersAPI = {
  getAll: () => apiRequest('/offers'),
  getById: (id) => apiRequest(`/offers/${id}`),
  participate: (id) => 
    apiRequest(`/offers/${id}/participate`, { method: 'POST' })
};

export const activitiesAPI = {
  getAll: () => apiRequest('/activities'),
  getById: (id) => apiRequest(`/activities/${id}`),
  participate: (id) => 
    apiRequest(`/activities/${id}/participate`, { method: 'POST' })
};

export const favoritesAPI = {
  getFavorites: () => apiRequest('/favorites'),
  addFavorite: (itemId, itemType) =>
    apiRequest('/favorites', {
      method: 'POST',
      body: { itemId, itemType }
    }),
  removeFavorite: (itemId, itemType) =>
    apiRequest('/favorites', {
      method: 'DELETE',
      body: { itemId, itemType }
    })
};
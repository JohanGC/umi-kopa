//const API_BASE_URL = 'http://localhost:5000/api';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
// Función genérica para hacer requests
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

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error en la solicitud');
    }
    
    return data;
  } catch (error) {
    throw error;
  }
};

// Servicios específicos
export const authAPI = {
  login: (email, password) => 
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  register: (nombre, email, password) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ nombre, email, password })
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
      body: JSON.stringify({ itemId, itemType })
    }),
  removeFavorite: (itemId, itemType) =>
    apiRequest('/favorites', {
      method: 'DELETE',
      body: JSON.stringify({ itemId, itemType })
    })
};
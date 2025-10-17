// services/dataService.js

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Servicio para manejar datos de ofertas, actividades y administración
export const dataService = {
  // ==================== FUNCIONES PARA EL ADMIN PANEL ====================

  // Obtener estadísticas del admin
  getAdminStats: async () => {
    try {
      console.log('📊 Obteniendo estadísticas...');
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/stats`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Stats obtenidos:', data);
      return data;
    } catch (error) {
      console.error('❌ Error fetching admin stats:', error);
      // Fallback a localStorage
      return dataService.getLocalStorageStats();
    }
  },

  // Obtener todos los usuarios
  getUsers: async () => {
    try {
      console.log('👥 Obteniendo usuarios desde API...');
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/admin/users`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Usuarios obtenidos desde API:', data);
      return data;
      
    } catch (error) {
      console.error('❌ Error fetching users from API:', error);
      return dataService.getLocalStorageUsers();
    }
  },

  // Obtener todas las ofertas
  getOffers: async () => {
    try {
      console.log('🏷️ Obteniendo ofertas desde API...');
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/offers`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Ofertas obtenidas desde API:', data);
      return data;
      
    } catch (error) {
      console.error('❌ Error fetching offers from API:', error);
      return dataService.getLocalStorageOffers();
    }
  },

  // Obtener todas las actividades
  getActivities: async () => {
    try {
      console.log('🎯 Obteniendo actividades desde API...');
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/activities`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Actividades obtenidas desde API:', data);
      return data;
      
    } catch (error) {
      console.error('❌ Error fetching activities from API:', error);
      return dataService.getLocalStorageActivities();
    }
  },

  // Obtener ofertas pendientes - FUNCIÓN AGREGADA
  getPendingOffers: async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('⏳ Obteniendo ofertas pendientes...');
      
      const response = await fetch(`${API_URL}/admin/offers/pending`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Ofertas pendientes obtenidas:', data);
      return data;
    } catch (error) {
      console.error('❌ Error fetching pending offers:', error);
      // Fallback a localStorage
      const offers = dataService.getLocalStorageOffers();
      return Array.isArray(offers) ? offers.filter(offer => offer.estado === 'pendiente') : [];
    }
  },

  // Obtener actividades pendientes
  getPendingActivities: async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('⏳ Obteniendo actividades pendientes...');
      
      const response = await fetch(`${API_URL}/admin/activities/pending`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Actividades pendientes obtenidas:', data);
      return data;
    } catch (error) {
      console.error('❌ Error fetching pending activities:', error);
      // Fallback a localStorage
      const activities = dataService.getLocalStorageActivities();
      return Array.isArray(activities) ? activities.filter(activity => activity.estado === 'pendiente') : [];
    }
  },

  // Aprobar o rechazar oferta
  approveOffer: async (id, action, motivo = '') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/offers/${id}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ action, motivo })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error approving/rejecting offer:', error);
      throw error;
    }
  },

  // Aprobar o rechazar actividad
  approveActivity: async (id, action, motivo = '') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/activities/${id}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ action, motivo })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error approving/rejecting activity:', error);
      throw error;
    }
  },

  // Actualizar usuario
  updateUser: async (userId, userData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Eliminar usuario
  deleteUser: async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Eliminar oferta
  deleteOffer: async (offerId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/offers/${offerId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting offer:', error);
      throw error;
    }
  },

  // Eliminar actividad
  deleteActivity: async (activityId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/activities/${activityId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting activity:', error);
      throw error;
    }
  },

  // ==================== FUNCIONES DE FALLBACK (LOCALSTORAGE) ====================

  getLocalStorageStats: () => {
    try {
      const users = dataService.getLocalStorageUsers();
      const offers = dataService.getLocalStorageOffers();
      const activities = dataService.getLocalStorageActivities();
      
      const totalUsers = users.length;
      const newUsers = users.filter(user => {
        try {
          const userDate = new Date(user.createdAt);
          const currentDate = new Date();
          const diffTime = Math.abs(currentDate - userDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 30;
        } catch (e) {
          return false;
        }
      }).length;

      const totalOffers = Array.isArray(offers) ? offers.filter(offer => offer.estado === 'aprobada').length : 0;
      const pendingOffers = Array.isArray(offers) ? offers.filter(offer => offer.estado === 'pendiente').length : 0;
      
      const totalActivities = Array.isArray(activities) ? activities.filter(activity => activity.estado === 'aprobada').length : 0;
      const pendingActivities = Array.isArray(activities) ? activities.filter(activity => activity.estado === 'pendiente').length : 0;

      const totalRevenue = (Array.isArray(offers) ? offers.reduce((sum, offer) => {
        return sum + ((offer.participantes || 0) * (offer.precioDescuento || 0));
      }, 0) : 0) + (Array.isArray(activities) ? activities.reduce((sum, activity) => {
        return sum + ((activity.participantes || 0) * (activity.precioDescuento || 0));
      }, 0) : 0);

      return {
        totalUsers,
        newUsers,
        totalOffers,
        pendingOffers,
        totalActivities,
        pendingActivities,
        totalRevenue: Math.round(totalRevenue)
      };
    } catch (error) {
      console.error('Error en getLocalStorageStats:', error);
      return {
        totalUsers: 0,
        newUsers: 0,
        totalOffers: 0,
        pendingOffers: 0,
        totalActivities: 0,
        pendingActivities: 0,
        totalRevenue: 0
      };
    }
  },

  getLocalStorageUsers: () => {
    console.log('🔍 Buscando usuarios en localStorage...');
    
    try {
      let users = JSON.parse(localStorage.getItem('ofertasApp_users') || '[]');
      
      // Si no hay usuarios, crear admin por defecto
      if (users.length === 0) {
        const defaultUsers = [
          {
            _id: 1,
            nombre: "Admin Principal",
            email: "admin@ejemplo.com",
            telefono: "+1234567890",
            rol: "administrador",
            empresa: "Sistema",
            verificada: true,
            activo: true,
            createdAt: new Date().toISOString()
          }
        ];
        localStorage.setItem('ofertasApp_users', JSON.stringify(defaultUsers));
        users = defaultUsers;
      }
      
      console.log('👥 Usuarios encontrados en localStorage:', users);
      return users;
    } catch (error) {
      console.error('Error obteniendo usuarios de localStorage:', error);
      return [];
    }
  },

  getLocalStorageOffers: () => {
    try {
      const offers = JSON.parse(localStorage.getItem('ofertasApp_offers') || '[]');
      if (offers.length === 0) {
        const defaultOffers = [
          { 
            _id: 1, 
            titulo: "Oferta de Verano", 
            descripcion: "Descuentos especiales en productos de temporada", 
            descuento: "20%",
            categoria: "temporada",
            empresa: "Empresa Ejemplo",
            participantes: 0,
            maxParticipantes: 100,
            precioOriginal: 100,
            precioDescuento: 80,
            estado: "aprobada",
            createdAt: new Date().toISOString(),
            isActive: true
          }
        ];
        localStorage.setItem('ofertasApp_offers', JSON.stringify(defaultOffers));
        return defaultOffers;
      }
      return offers;
    } catch (error) {
      console.error('Error obteniendo ofertas de localStorage:', error);
      return [];
    }
  },

  getLocalStorageActivities: () => {
    try {
      const activities = JSON.parse(localStorage.getItem('ofertasApp_activities') || '[]');
      if (activities.length === 0) {
        const defaultActivities = [
          { 
            _id: 1, 
            titulo: "Taller de Cocina", 
            descripcion: "Aprende a preparar platillos gourmet con chefs expertos", 
            descuento: "25%",
            categoria: "taller",
            empresa: "Escuela de Cocina",
            participantes: 0,
            maxParticipantes: 20,
            precioOriginal: 150,
            precioDescuento: 112.5,
            fecha: "2024-03-15",
            estado: "aprobada",
            createdAt: new Date().toISOString(),
            isActive: true
          }
        ];
        localStorage.setItem('ofertasApp_activities', JSON.stringify(defaultActivities));
        return defaultActivities;
      }
      return activities;
    } catch (error) {
      console.error('Error obteniendo actividades de localStorage:', error);
      return [];
    }
  },

  // ==================== FUNCIONES PARA USUARIOS REGULARES ====================

  participateInOffer: async (offerId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/offers/${offerId}/participate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error participating in offer:', error);
      // Fallback local
      const userId = JSON.parse(localStorage.getItem('user') || '{}').id;
      if (!userId) return false;
      
      const offers = dataService.getLocalStorageOffers();
      const offerIndex = offers.findIndex(offer => offer._id == offerId);
      
      if (offerIndex !== -1 && offers[offerIndex].participantes < offers[offerIndex].maxParticipantes) {
        offers[offerIndex].participantes++;
        localStorage.setItem('ofertasApp_offers', JSON.stringify(offers));
        
        const userParticipations = JSON.parse(localStorage.getItem(`ofertasApp_user_${userId}_offers`) || '[]');
        userParticipations.push(offerId);
        localStorage.setItem(`ofertasApp_user_${userId}_offers`, JSON.stringify(userParticipations));
        
        return true;
      }
      return false;
    }
  },

  participateInActivity: async (activityId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/activities/${activityId}/participate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error participating in activity:', error);
      // Fallback local
      const userId = JSON.parse(localStorage.getItem('user') || '{}').id;
      if (!userId) return false;
      
      const activities = dataService.getLocalStorageActivities();
      const activityIndex = activities.findIndex(activity => activity._id == activityId);
      
      if (activityIndex !== -1 && activities[activityIndex].participantes < activities[activityIndex].maxParticipantes) {
        activities[activityIndex].participantes++;
        localStorage.setItem('ofertasApp_activities', JSON.stringify(activities));
        
        const userParticipations = JSON.parse(localStorage.getItem(`ofertasApp_user_${userId}_activities`) || '[]');
        userParticipations.push(activityId);
        localStorage.setItem(`ofertasApp_user_${userId}_activities`, JSON.stringify(userParticipations));
        
        return true;
      }
      return false;
    }
  },

  getUserParticipations: (userId) => {
    try {
      const offerParticipations = JSON.parse(localStorage.getItem(`ofertasApp_user_${userId}_offers`) || '[]');
      const activityParticipations = JSON.parse(localStorage.getItem(`ofertasApp_user_${userId}_activities`) || '[]');
      
      return {
        offers: offerParticipations,
        activities: activityParticipations
      };
    } catch (error) {
      console.error('Error obteniendo participaciones:', error);
      return {
        offers: [],
        activities: []
      };
    }
  },

  addToFavorites: async (itemId, itemType) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ itemId, itemType })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding to favorites:', error);
      // Fallback local
      const userId = JSON.parse(localStorage.getItem('user') || '{}').id;
      if (!userId) return false;
      
      const favorites = JSON.parse(localStorage.getItem(`ofertasApp_user_${userId}_favorites`) || '[]');
      const newFavorite = { id: itemId, type: itemType, date: new Date().toISOString() };
      
      if (!favorites.some(fav => fav.id === itemId && fav.type === itemType)) {
        favorites.push(newFavorite);
        localStorage.setItem(`ofertasApp_user_${userId}_favorites`, JSON.stringify(favorites));
        return true;
      }
      return false;
    }
  },

  removeFromFavorites: async (itemId, itemType) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/favorites`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ itemId, itemType })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error removing from favorites:', error);
      // Fallback local
      const userId = JSON.parse(localStorage.getItem('user') || '{}').id;
      if (!userId) return false;
      
      const favorites = JSON.parse(localStorage.getItem(`ofertasApp_user_${userId}_favorites`) || '[]');
      const updatedFavorites = favorites.filter(fav => !(fav.id === itemId && fav.type === itemType));
      localStorage.setItem(`ofertasApp_user_${userId}_favorites`, JSON.stringify(updatedFavorites));
      return true;
    }
  },

  getUserFavorites: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/favorites`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting favorites:', error);
      // Fallback local
      const userId = JSON.parse(localStorage.getItem('user') || '{}').id;
      if (!userId) return [];
      
      return JSON.parse(localStorage.getItem(`ofertasApp_user_${userId}_favorites`) || '[]');
    }
  },

  isItemFavorite: (itemId, itemType) => {
    try {
      const userId = JSON.parse(localStorage.getItem('user') || '{}').id;
      if (!userId) return false;
      
      const favorites = JSON.parse(localStorage.getItem(`ofertasApp_user_${userId}_favorites`) || '[]');
      return favorites.some(fav => fav.id == itemId && fav.type === itemType);
    } catch (error) {
      console.error('Error verificando favoritos:', error);
      return false;
    }
  },

  createActivity: async (activityData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(activityData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating activity:', error);
      // Fallback a localStorage
      const activities = JSON.parse(localStorage.getItem('ofertasApp_activities') || '[]');
      const newActivity = {
        ...activityData,
        _id: Date.now().toString(),
        id: Date.now(),
        estado: 'pendiente',
        participantes: 0,
        createdAt: new Date().toISOString()
      };
      
      activities.push(newActivity);
      localStorage.setItem('ofertasApp_activities', JSON.stringify(activities));
      return newActivity;
    }
  },

  createOffer: async (offerData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/offers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(offerData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating offer:', error);
      // Fallback a localStorage
      const offers = JSON.parse(localStorage.getItem('ofertasApp_offers') || '[]');
      const newOffer = {
        ...offerData,
        _id: Date.now().toString(),
        id: Date.now(),
        estado: 'pendiente',
        participantes: 0,
        createdAt: new Date().toISOString()
      };
      
      offers.push(newOffer);
      localStorage.setItem('ofertasApp_offers', JSON.stringify(offers));
      return newOffer;
    }
  }
};
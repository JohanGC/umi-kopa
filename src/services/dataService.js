// Servicio para manejar datos de ofertas y actividades
export const dataService = {
  // Obtener todas las ofertas
  getOffers: () => {
    const offers = JSON.parse(localStorage.getItem('ofertasApp_offers') || '[]');
    if (offers.length === 0) {
      // Datos por defecto
      const defaultOffers = [
        { 
          id: 1, 
          title: "Oferta de Verano", 
          description: "Descuentos especiales en productos de temporada", 
          discount: "20%",
          category: "temporada",
          image: "🌞",
          participants: 0,
          maxParticipants: 100,
          isActive: true
        },
        { 
          id: 2, 
          title: "Promoción Nocturna", 
          description: "Ofertas exclusivas después de las 8pm", 
          discount: "15%",
          category: "nocturna",
          image: "🌙",
          participants: 0,
          maxParticipants: 50,
          isActive: true
        },
        { 
          id: 3, 
          title: "Fin de Semana Especial", 
          description: "Descuentos en todos los productos los fines de semana", 
          discount: "30%",
          category: "fin-de-semana",
          image: "🎉",
          participants: 0,
          maxParticipants: 200,
          isActive: true
        }
      ];
      localStorage.setItem('ofertasApp_offers', JSON.stringify(defaultOffers));
      return defaultOffers;
    }
    return offers;
  },

  // Obtener todas las actividades
  getActivities: () => {
    const activities = JSON.parse(localStorage.getItem('ofertasApp_activities') || '[]');
    if (activities.length === 0) {
      // Datos por defecto
      const defaultActivities = [
        { 
          id: 1, 
          title: "Taller de Cocina", 
          description: "Aprende a preparar platillos gourmet con chefs expertos", 
          discount: "25%",
          category: "taller",
          image: "👨‍🍳",
          participants: 0,
          maxParticipants: 20,
          date: "2024-03-15",
          isActive: true
        },
        { 
          id: 2, 
          title: "Tour Cultural", 
          description: "Recorrido por los lugares históricos más importantes de la ciudad", 
          discount: "30%",
          category: "tour",
          image: "🏛️",
          participants: 0,
          maxParticipants: 30,
          date: "2024-03-20",
          isActive: true
        },
        { 
          id: 3, 
          title: "Clase de Yoga", 
          description: "Sesiones de yoga para todos los niveles en un ambiente relajante", 
          discount: "20%",
          category: "clase",
          image: "🧘",
          participants: 0,
          maxParticipants: 15,
          date: "2024-03-18",
          isActive: true
        }
      ];
      localStorage.setItem('ofertasApp_activities', JSON.stringify(defaultActivities));
      return defaultActivities;
    }
    return activities;
  },

  // Participar en una oferta
  participateInOffer: (offerId, userId) => {
    const offers = dataService.getOffers();
    const offerIndex = offers.findIndex(offer => offer.id === offerId);
    
    if (offerIndex !== -1 && offers[offerIndex].participants < offers[offerIndex].maxParticipants) {
      offers[offerIndex].participants++;
      localStorage.setItem('ofertasApp_offers', JSON.stringify(offers));
      
      // Guardar participación del usuario
      const userParticipations = JSON.parse(localStorage.getItem(`ofertasApp_user_${userId}_offers`) || '[]');
      userParticipations.push(offerId);
      localStorage.setItem(`ofertasApp_user_${userId}_offers`, JSON.stringify(userParticipations));
      
      return true;
    }
    return false;
  },

  // Participar en una actividad
  participateInActivity: (activityId, userId) => {
    const activities = dataService.getActivities();
    const activityIndex = activities.findIndex(activity => activity.id === activityId);
    
    if (activityIndex !== -1 && activities[activityIndex].participants < activities[activityIndex].maxParticipants) {
      activities[activityIndex].participants++;
      localStorage.setItem('ofertasApp_activities', JSON.stringify(activities));
      
      // Guardar participación del usuario
      const userParticipations = JSON.parse(localStorage.getItem(`ofertasApp_user_${userId}_activities`) || '[]');
      userParticipations.push(activityId);
      localStorage.setItem(`ofertasApp_user_${userId}_activities`, JSON.stringify(userParticipations));
      
      return true;
    }
    return false;
  },

  // Obtener participaciones del usuario
  getUserParticipations: (userId) => {
    const offerParticipations = JSON.parse(localStorage.getItem(`ofertasApp_user_${userId}_offers`) || '[]');
    const activityParticipations = JSON.parse(localStorage.getItem(`ofertasApp_user_${userId}_activities`) || '[]');
    
    return {
      offers: offerParticipations,
      activities: activityParticipations
    };
  },

  // Sistema de favoritos
  addToFavorites: (itemId, userId, type) => {
    const favorites = JSON.parse(localStorage.getItem(`ofertasApp_user_${userId}_favorites`) || '[]');
    const newFavorite = { id: itemId, type, date: new Date().toISOString() };
    
    if (!favorites.some(fav => fav.id === itemId && fav.type === type)) {
      favorites.push(newFavorite);
      localStorage.setItem(`ofertasApp_user_${userId}_favorites`, JSON.stringify(favorites));
      return true;
    }
    return false;
  },

  removeFromFavorites: (itemId, userId, type) => {
    const favorites = JSON.parse(localStorage.getItem(`ofertasApp_user_${userId}_favorites`) || '[]');
    const updatedFavorites = favorites.filter(fav => !(fav.id === itemId && fav.type === type));
    localStorage.setItem(`ofertasApp_user_${userId}_favorites`, JSON.stringify(updatedFavorites));
    return true;
  },

  getUserFavorites: (userId) => {
    return JSON.parse(localStorage.getItem(`ofertasApp_user_${userId}_favorites`) || '[]');
  },

  isItemFavorite: (itemId, userId, type) => {
    const favorites = JSON.parse(localStorage.getItem(`ofertasApp_user_${userId}_favorites`) || '[]');
    return favorites.some(fav => fav.id === itemId && fav.type === type);
  }
};
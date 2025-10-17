import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ AGREGAR ESTA LÍNEA
import { dataService } from '../services/dataService';
import { authService } from '../services/auth';
import SearchFilter from '../components/SearchFilter';
import FavoriteButton from '../components/FavoriteButton';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [userParticipations, setUserParticipations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { addNotification } = useNotification();
  const navigate = useNavigate(); // ✅ AGREGAR ESTE HOOK

  const categories = [
    { value: 'taller', label: 'Taller' },
    { value: 'tour', label: 'Tour' },
    { value: 'clase', label: 'Clase' },
    { value: 'evento', label: 'Evento Especial' }
  ];

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        const user = authService.getCurrentUser();
        setCurrentUser(user);
        
        if (user) {
          const participations = dataService.getUserParticipations(user.email);
          setUserParticipations(participations.activities);
        }
        
        // ✅ CORREGIDO: Usar await para funciones async
        const allActivities = await dataService.getActivities();
        console.log('🎯 Actividades obtenidas:', allActivities);
        
        // ✅ Asegurar que sea array
        const activitiesArray = Array.isArray(allActivities) ? allActivities : [];
        
        setActivities(activitiesArray);
        setFilteredActivities(activitiesArray);
      } catch (error) {
        console.error('❌ Error cargando actividades:', error);
        setActivities([]);
        setFilteredActivities([]);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  useEffect(() => {
    filterActivities();
  }, [searchTerm, categoryFilter, activities]);

  const filterActivities = () => {
    let filtered = (activities || []).filter(activity => activity.isActive);

    if (searchTerm) {
      filtered = filtered.filter(activity =>
        activity.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) || // Para compatibilidad
        activity.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) // Para compatibilidad
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter(activity => 
        activity.category === categoryFilter || 
        activity.categoria === categoryFilter // Para compatibilidad
      );
    }

    setFilteredActivities(filtered);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleAddToCart = (item, type) => {
    addToCart(item, type);
    addNotification(`"${item.title || item.titulo}" agregado al carrito`, 'success');
  };

  const handleFilter = (category) => {
    setCategoryFilter(category);
  };

  const handleParticipate = async (activityId) => {
    if (!currentUser) {
      alert('Debes iniciar sesión para participar en las actividades');
      return;
    }

    try {
      const success = await dataService.participateInActivity(activityId);
      if (success) {
        addNotification('¡Te has registrado en esta actividad exitosamente!', 'success');
        // Actualizar la lista
        const updatedActivities = await dataService.getActivities();
        const activitiesArray = Array.isArray(updatedActivities) ? updatedActivities : [];
        setActivities(activitiesArray);
        
        const participations = dataService.getUserParticipations(currentUser.email);
        setUserParticipations(participations.activities);
      } else {
        addNotification('No se pudo registrar en la actividad. Puede que esté llena.', 'error');
      }
    } catch (error) {
      addNotification('Error al participar en la actividad', 'error');
    }
  };

  const isUserParticipating = (activityId) => {
    return userParticipations.includes(activityId);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no definida';
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('es-ES', options);
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const getProgressPercentage = (participants, maxParticipants) => {
    return maxParticipants > 0 ? (participants / maxParticipants) * 100 : 0;
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="d-flex justify-content-center align-items-center" style={{height: '200px'}}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando actividades...</span>
          </div>
          <span className="ms-2">Cargando actividades...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
      <h2>Actividades Disponibles</h2>
      {currentUser && (
        <button 
          className="btn btn-success"
          onClick={() => navigate('/create-activity')}
        >
          + Crear Actividad
        </button>
      )}
      </div>
      
      <SearchFilter 
        onSearch={handleSearch}
        onFilter={handleFilter}
        categories={categories}
      />

      {!currentUser && (
        <div className="alert alert-info">
          <strong>💡 Tip:</strong> Inicia sesión para participar en las actividades y obtener beneficios exclusivos.
        </div>
      )}

      <div className="mb-3">
        <small className="text-muted">
          Mostrando {filteredActivities.length} de {(activities || []).filter(a => a.isActive).length} actividades
        </small>
      </div>

      <div className="row">
        {filteredActivities.length === 0 ? (
          <div className="col-12">
            <div className="alert alert-warning text-center">
              <h4>🔍 No se encontraron actividades</h4>
              <p>Intenta con otros términos de búsqueda o cambia los filtros.</p>
            </div>
          </div>
        ) : (
          filteredActivities.map(activity => (
            <div key={activity.id || activity._id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100">
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <span className="display-4">{activity.image}</span>
                    <FavoriteButton itemId={activity.id || activity._id} type="activity" />
                  </div>
                  
                  <h3 className="card-title">{activity.title || activity.titulo}</h3>
                  <p className="card-text flex-grow-1">{activity.description || activity.descripcion}</p>
                  
                  <div className="mb-2">
                    <span className="badge bg-success fs-6">{activity.discount || activity.descuento} DESCUENTO</span>
                    <span className="badge bg-info ms-2 fs-6">
                      {formatDate(activity.date || activity.fecha)}
                    </span>
                  </div>
                  
                  <div className="mb-3">
                    <div className="d-flex justify-content-between small text-muted">
                      <span>
                        Participantes: {activity.participants || activity.participantes}/
                        {activity.maxParticipants || activity.maxParticipantes}
                      </span>
                      <span>
                        {Math.round(getProgressPercentage(
                          activity.participants || activity.participantes, 
                          activity.maxParticipants || activity.maxParticipantes
                        ))}%
                      </span>
                    </div>
                    <div className="progress" style={{height: '8px'}}>
                      <div 
                        className="progress-bar" 
                        style={{width: `${getProgressPercentage(
                          activity.participants || activity.participantes, 
                          activity.maxParticipants || activity.maxParticipantes
                        )}%`}}
                      ></div>
                    </div>
                  </div>

                  {currentUser ? (
                    isUserParticipating(activity.id || activity._id) ? (
                      <button className="btn btn-success" disabled>
                        ✅ Ya estás registrado
                      </button>
                    ) : (
                      <button 
                        className="btn btn-primary"
                        onClick={() => handleParticipate(activity.id || activity._id)}
                        disabled={(activity.participants || activity.participantes) >= 
                                 (activity.maxParticipants || activity.maxParticipantes)}
                      >
                        {(activity.participants || activity.participantes) >= 
                         (activity.maxParticipants || activity.maxParticipantes) 
                          ? '❌ Actividad llena' 
                          : '🎯 Registrarse'}
                      </button>
                    )
                  ) : (
                    <button className="btn btn-outline-primary" disabled>
                      🔒 Inicia sesión para participar
                    </button>
                  )}
                  <button 
                    className="btn btn-outline-success mt-2"
                    onClick={() => handleAddToCart(activity, 'activity')}
                  >
                    🛒 Agregar al Carrito
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Activities;
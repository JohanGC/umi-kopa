import React, { useState, useEffect } from 'react';
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
  const { addToCart } = useCart();
  const { addNotification } = useNotification();

  const categories = [
    { value: 'taller', label: 'Taller' },
    { value: 'tour', label: 'Tour' },
    { value: 'clase', label: 'Clase' },
    { value: 'evento', label: 'Evento Especial' }
  ];

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    
    if (user) {
      const participations = dataService.getUserParticipations(user.email);
      setUserParticipations(participations.activities);
    }
    
    const allActivities = dataService.getActivities();
    setActivities(allActivities);
    setFilteredActivities(allActivities);
  }, []);

  useEffect(() => {
    filterActivities();
  }, [searchTerm, categoryFilter, activities]);

  const filterActivities = () => {
    let filtered = activities.filter(activity => activity.isActive);

    if (searchTerm) {
      filtered = filtered.filter(activity =>
        activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter(activity => activity.category === categoryFilter);
    }

    setFilteredActivities(filtered);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleAddToCart = (item, type) => {
    addToCart(item, type);
    addNotification(`"${item.title}" agregado al carrito`, 'success');
  };

  const handleFilter = (category) => {
    setCategoryFilter(category);
  };

  const handleParticipate = (activityId) => {
    if (!currentUser) {
      alert('Debes iniciar sesión para participar en las actividades');
      return;
    }

    const success = dataService.participateInActivity(activityId, currentUser.email);
    if (success) {
      alert('¡Te has registrado en esta actividad exitosamente!');
      const updatedActivities = dataService.getActivities();
      setActivities(updatedActivities);
      
      const participations = dataService.getUserParticipations(currentUser.email);
      setUserParticipations(participations.activities);
    } else {
      alert('No se pudo registrar en la actividad. Puede que esté llena.');
    }
  };

  const isUserParticipating = (activityId) => {
    return userParticipations.includes(activityId);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  const getProgressPercentage = (participants, maxParticipants) => {
    return (participants / maxParticipants) * 100;
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Actividades Disponibles</h2>
      
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
          Mostrando {filteredActivities.length} de {activities.filter(a => a.isActive).length} actividades
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
            <div key={activity.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100">
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <span className="display-4">{activity.image}</span>
                    <FavoriteButton itemId={activity.id} type="activity" />
                  </div>
                  
                  <h3 className="card-title">{activity.title}</h3>
                  <p className="card-text flex-grow-1">{activity.description}</p>
                  
                  <div className="mb-2">
                    <span className="badge bg-success fs-6">{activity.discount} DESCUENTO</span>
                    <span className="badge bg-info ms-2 fs-6">{formatDate(activity.date)}</span>
                  </div>
                  
                  <div className="mb-3">
                    <div className="d-flex justify-content-between small text-muted">
                      <span>Participantes: {activity.participants}/{activity.maxParticipants}</span>
                      <span>{Math.round(getProgressPercentage(activity.participants, activity.maxParticipants))}%</span>
                    </div>
                    <div className="progress" style={{height: '8px'}}>
                      <div 
                        className="progress-bar" 
                        style={{width: `${getProgressPercentage(activity.participants, activity.maxParticipants)}%`}}
                      ></div>
                    </div>
                  </div>

                  {currentUser ? (
                    isUserParticipating(activity.id) ? (
                      <button className="btn btn-success" disabled>
                        ✅ Ya estás registrado
                      </button>
                    ) : (
                      <button 
                        className="btn btn-primary"
                        onClick={() => handleParticipate(activity.id)}
                        disabled={activity.participants >= activity.maxParticipants}
                      >
                        {activity.participants >= activity.maxParticipants ? '❌ Actividad llena' : '🎯 Registrarse'}
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
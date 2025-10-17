import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ AGREGAR ESTA LÍNEA
import { dataService } from '../services/dataService';
import { authService } from '../services/auth';
import SearchFilter from '../components/SearchFilter';
import FavoriteButton from '../components/FavoriteButton';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';

const Offers = () => {
  const [offers, setOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [userParticipations, setUserParticipations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { addNotification } = useNotification();
  const navigate = useNavigate(); // ✅ AGREGAR ESTE HOOK
  
  const categories = [
    { value: 'temporada', label: 'Temporada' },
    { value: 'nocturna', label: 'Nocturna' },
    { value: 'fin-de-semana', label: 'Fin de Semana' },
    { value: 'flash', label: 'Oferta Flash' }
  ];

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        const user = authService.getCurrentUser();
        setCurrentUser(user);
        
        if (user) {
          const participations = dataService.getUserParticipations(user.email);
          setUserParticipations(participations.offers);
        }
        
        // ✅ CORREGIDO: Usar await para funciones async
        const allOffers = await dataService.getOffers();
        console.log('📦 Ofertas obtenidas:', allOffers);
        
        // ✅ Asegurar que sea array
        const offersArray = Array.isArray(allOffers) ? allOffers : [];
        
        setOffers(offersArray);
        setFilteredOffers(offersArray);
      } catch (error) {
        console.error('❌ Error cargando ofertas:', error);
        setOffers([]);
        setFilteredOffers([]);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  useEffect(() => {
    filterOffers();
  }, [searchTerm, categoryFilter, offers]);

  const filterOffers = () => {
    let filtered = (offers || []).filter(offer => offer.isActive);

    if (searchTerm) {
      filtered = filtered.filter(offer =>
        offer.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) || // Para compatibilidad
        offer.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) // Para compatibilidad
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter(offer => 
        offer.category === categoryFilter || 
        offer.categoria === categoryFilter // Para compatibilidad
      );
    }

    setFilteredOffers(filtered);
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

  const handleParticipate = async (offerId) => {
    if (!currentUser) {
      alert('Debes iniciar sesión para participar en las ofertas');
      return;
    }

    try {
      const success = await dataService.participateInOffer(offerId);
      if (success) {
        addNotification('¡Te has unido a esta oferta exitosamente!', 'success');
        // Actualizar la lista
        const updatedOffers = await dataService.getOffers();
        const offersArray = Array.isArray(updatedOffers) ? updatedOffers : [];
        setOffers(offersArray);
        
        const participations = dataService.getUserParticipations(currentUser.email);
        setUserParticipations(participations.offers);
      } else {
        addNotification('No se pudo unir a la oferta. Puede que esté llena.', 'error');
      }
    } catch (error) {
      addNotification('Error al participar en la oferta', 'error');
    }
  };

  const isUserParticipating = (offerId) => {
    return userParticipations.includes(offerId);
  };

  const getProgressPercentage = (participants, maxParticipants) => {
    return maxParticipants > 0 ? (participants / maxParticipants) * 100 : 0;
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="d-flex justify-content-center align-items-center" style={{height: '200px'}}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando ofertas...</span>
          </div>
          <span className="ms-2">Cargando ofertas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      
      <div className="d-flex justify-content-between align-items-center mb-4">
      <h2>Ofertas Disponibles</h2>
      {currentUser && (
        <button 
          className="btn btn-warning"
          onClick={() => navigate('/create-offer')}
        >
          + Crear Oferta
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
          <strong>💡 Tip:</strong> Inicia sesión para participar en las ofertas y obtener beneficios exclusivos.
        </div>
      )}

      <div className="mb-3">
        <small className="text-muted">
          Mostrando {filteredOffers.length} de {(offers || []).filter(o => o.isActive).length} ofertas
        </small>
      </div>

      <div className="row">
        {filteredOffers.length === 0 ? (
          <div className="col-12">
            <div className="alert alert-warning text-center">
              <h4>🔍 No se encontraron ofertas</h4>
              <p>Intenta con otros términos de búsqueda o cambia los filtros.</p>
            </div>
          </div>
        ) : (
          filteredOffers.map(offer => (
            <div key={offer.id || offer._id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100">
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <span className="display-4">{offer.image}</span>
                    <FavoriteButton itemId={offer.id || offer._id} type="offer" />
                  </div>
                  
                  <h3 className="card-title">{offer.title || offer.titulo}</h3>
                  <p className="card-text flex-grow-1">{offer.description || offer.descripcion}</p>
                  
                  <div className="mb-2">
                    <span className="badge bg-success fs-6">{offer.discount || offer.descuento} DESCUENTO</span>
                    <span className="badge bg-secondary ms-2 fs-6">
                      {categories.find(cat => 
                        cat.value === (offer.category || offer.categoria)
                      )?.label || (offer.category || offer.categoria)}
                    </span>
                  </div>
                  
                  <div className="mb-3">
                    <div className="d-flex justify-content-between small text-muted">
                      <span>Participantes: {offer.participants || offer.participantes}/{offer.maxParticipants || offer.maxParticipantes}</span>
                      <span>{Math.round(getProgressPercentage(
                        offer.participants || offer.participantes, 
                        offer.maxParticipants || offer.maxParticipantes
                      ))}%</span>
                    </div>
                    <div className="progress" style={{height: '8px'}}>
                      <div 
                        className="progress-bar" 
                        style={{width: `${getProgressPercentage(
                          offer.participants || offer.participantes, 
                          offer.maxParticipants || offer.maxParticipantes
                        )}%`}}
                      ></div>
                    </div>
                  </div>

                  {currentUser ? (
                    isUserParticipating(offer.id || offer._id) ? (
                      <button className="btn btn-success" disabled>
                        ✅ Ya estás participando
                      </button>
                    ) : (
                      <button 
                        className="btn btn-primary"
                        onClick={() => handleParticipate(offer.id || offer._id)}
                        disabled={(offer.participants || offer.participantes) >= (offer.maxParticipants || offer.maxParticipantes)}
                      >
                        {(offer.participants || offer.participantes) >= (offer.maxParticipants || offer.maxParticipantes) 
                          ? '❌ Oferta llena' 
                          : '🎯 Participar'}
                      </button>
                    )
                  ) : (
                    <button className="btn btn-outline-primary" disabled>
                      🔒 Inicia sesión para participar
                    </button>
                  )}
                  <button 
                    className="btn btn-outline-success mt-2"
                    onClick={() => handleAddToCart(offer, 'offer')}
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

export default Offers;
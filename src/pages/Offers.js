import React, { useState, useEffect } from 'react';
import { dataService } from '../services/dataService';
import { authService } from '../services/auth';
import SearchFilter from '../components/SearchFilter';
import FavoriteButton from '../components/FavoriteButton';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';


// Función para agregar al carrito


const Offers = () => {
  const [offers, setOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [userParticipations, setUserParticipations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const { addToCart } = useCart();
  const { addNotification } = useNotification();
  
  const categories = [
    { value: 'temporada', label: 'Temporada' },
    { value: 'nocturna', label: 'Nocturna' },
    { value: 'fin-de-semana', label: 'Fin de Semana' },
    { value: 'flash', label: 'Oferta Flash' }
  ];

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    
    if (user) {
      const participations = dataService.getUserParticipations(user.email);
      setUserParticipations(participations.offers);
    }
    
    const allOffers = dataService.getOffers();
    setOffers(allOffers);
    setFilteredOffers(allOffers);
  }, []);

  useEffect(() => {
    filterOffers();
  }, [searchTerm, categoryFilter, offers]);

  const filterOffers = () => {
    let filtered = offers.filter(offer => offer.isActive);

    if (searchTerm) {
      filtered = filtered.filter(offer =>
        offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter(offer => offer.category === categoryFilter);
    }

    setFilteredOffers(filtered);
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

  const handleParticipate = (offerId) => {
    if (!currentUser) {
      alert('Debes iniciar sesión para participar en las ofertas');
      return;
    }

    const success = dataService.participateInOffer(offerId, currentUser.email);
    if (success) {
      alert('¡Te has unido a esta oferta exitosamente!');
      // Actualizar la lista
      const updatedOffers = dataService.getOffers();
      setOffers(updatedOffers);
      
      const participations = dataService.getUserParticipations(currentUser.email);
      setUserParticipations(participations.offers);
    } else {
      alert('No se pudo unir a la oferta. Puede que esté llena.');
    }
  };

  const isUserParticipating = (offerId) => {
    return userParticipations.includes(offerId);
  };

  const getProgressPercentage = (participants, maxParticipants) => {
    return (participants / maxParticipants) * 100;
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Ofertas Disponibles</h2>
      
      {/* Componente de búsqueda y filtros */}
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

      {/* Contador de resultados */}
      <div className="mb-3">
        <small className="text-muted">
          Mostrando {filteredOffers.length} de {offers.filter(o => o.isActive).length} ofertas
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
            <div key={offer.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100">
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <span className="display-4">{offer.image}</span>
                    <FavoriteButton itemId={offer.id} type="offer" />
                  </div>
                  
                  <h3 className="card-title">{offer.title}</h3>
                  <p className="card-text flex-grow-1">{offer.description}</p>
                  
                  <div className="mb-2">
                    <span className="badge bg-success fs-6">{offer.discount} DESCUENTO</span>
                    <span className="badge bg-secondary ms-2 fs-6">
                      {categories.find(cat => cat.value === offer.category)?.label || offer.category}
                    </span>
                  </div>
                  
                  <div className="mb-3">
                    <div className="d-flex justify-content-between small text-muted">
                      <span>Participantes: {offer.participants}/{offer.maxParticipants}</span>
                      <span>{Math.round(getProgressPercentage(offer.participants, offer.maxParticipants))}%</span>
                    </div>
                    <div className="progress" style={{height: '8px'}}>
                      <div 
                        className="progress-bar" 
                        style={{width: `${getProgressPercentage(offer.participants, offer.maxParticipants)}%`}}
                      ></div>
                    </div>
                  </div>

                  {currentUser ? (
                    isUserParticipating(offer.id) ? (
                      
                      <button className="btn btn-success" disabled>
                        ✅ Ya estás participando
                      </button>
                    ) : (
                      <button 
                        className="btn btn-primary"
                        onClick={() => handleParticipate(offer.id)}
                        disabled={offer.participants >= offer.maxParticipants}
                      >
                        {offer.participants >= offer.maxParticipants ? '❌ Oferta llena' : '🎯 Participar'}
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
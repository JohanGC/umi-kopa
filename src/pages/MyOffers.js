import React, { useState, useEffect } from 'react';
import { authService } from '../services/auth';
import { useNotification } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import CreateOfferForm from '../components/CreateOfferForm';

const MyOffers = () => {
  const [offers, setOffers] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user || (user.rol !== 'oferente' && user.rol !== 'administrador')) {
      addNotification('Acceso denegado. Se requieren privilegios de oferente.', 'error');
      navigate('/');
      return;
    }
    setCurrentUser(user);
    loadMyOffers();
  }, [navigate, addNotification]);

  const loadMyOffers = async () => {
    try {
      // Simular carga de ofertas del usuario
      const mockOffers = [
        {
          id: 1,
          titulo: 'Oferta de Verano 2024',
          descripcion: 'Descuentos especiales en productos de temporada',
          descuento: '20%',
          categoria: 'temporada',
          estado: 'aprobada',
          participantes: 45,
          maxParticipantes: 100,
          fechaCreacion: '2024-01-10',
          precioOriginal: 100,
          precioDescuento: 80
        },
        {
          id: 2,
          titulo: 'Promoción Nocturna',
          descripcion: 'Ofertas exclusivas después de las 8pm',
          descuento: '15%',
          categoria: 'nocturna',
          estado: 'pendiente',
          participantes: 0,
          maxParticipantes: 50,
          fechaCreacion: '2024-01-15',
          precioOriginal: 80,
          precioDescuento: 68
        },
        {
          id: 3,
          titulo: 'Fin de Semana Especial',
          descripcion: 'Descuentos en todos los productos los fines de semana',
          descuento: '30%',
          categoria: 'fin-de-semana',
          estado: 'rechazada',
          participantes: 0,
          maxParticipantes: 200,
          fechaCreacion: '2024-01-08',
          precioOriginal: 120,
          precioDescuento: 84,
          motivoRechazo: 'La oferta no cumple con nuestras políticas'
        }
      ];
      setOffers(mockOffers);
    } catch (error) {
      addNotification('Error cargando tus ofertas', 'error');
    }
  };

  const getStatusBadge = (estado) => {
    const statusConfig = {
      pendiente: { class: 'bg-warning', text: '⏳ Pendiente' },
      aprobada: { class: 'bg-success', text: '✅ Aprobada' },
      rechazada: { class: 'bg-danger', text: '❌ Rechazada' },
      expirada: { class: 'bg-secondary', text: '📅 Expirada' }
    };
    
    const config = statusConfig[estado] || statusConfig.pendiente;
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  const getProgressPercentage = (participantes, maxParticipantes) => {
    return (participantes / maxParticipantes) * 100;
  };

  if (!currentUser) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>🏷️ Mis Ofertas</h2>
          <p className="text-muted">Gestiona las ofertas que has creado</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateForm(true)}
        >
          + Crear Nueva Oferta
        </button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body text-center">
              <h5>Total</h5>
              <h3>{offers.length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body text-center">
              <h5>Aprobadas</h5>
              <h3>{offers.filter(o => o.estado === 'aprobada').length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-dark">
            <div className="card-body text-center">
              <h5>Pendientes</h5>
              <h3>{offers.filter(o => o.estado === 'pendiente').length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-danger text-white">
            <div className="card-body text-center">
              <h5>Rechazadas</h5>
              <h3>{offers.filter(o => o.estado === 'rechazada').length}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de ofertas */}
      <div className="row">
        {offers.length === 0 ? (
          <div className="col-12">
            <div className="card text-center py-5">
              <div className="card-body">
                <h4>📝 Aún no has creado ofertas</h4>
                <p className="text-muted mb-4">
                  Crea tu primera oferta para que los usuarios puedan participar
                </p>
                <button 
                  className="btn btn-primary btn-lg"
                  onClick={() => setShowCreateForm(true)}
                >
                  🚀 Crear Mi Primera Oferta
                </button>
              </div>
            </div>
          </div>
        ) : (
          offers.map(offer => (
            <div key={offer.id} className="col-md-6 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="card-title">{offer.titulo}</h5>
                    {getStatusBadge(offer.estado)}
                  </div>
                  
                  <p className="card-text text-muted">{offer.descripcion}</p>
                  
                  <div className="mb-3">
                    <span className="badge bg-info me-2">{offer.categoria}</span>
                    <span className="badge bg-success">{offer.descuento} DESCUENTO</span>
                  </div>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between small text-muted mb-1">
                      <span>Participantes: {offer.participantes}/{offer.maxParticipantes}</span>
                      <span>{Math.round(getProgressPercentage(offer.participantes, offer.maxParticipantes))}%</span>
                    </div>
                    <div className="progress" style={{height: '6px'}}>
                      <div 
                        className="progress-bar" 
                        style={{width: `${getProgressPercentage(offer.participantes, offer.maxParticipantes)}%`}}
                      ></div>
                    </div>
                  </div>

                  <div className="row text-center mb-3">
                    <div className="col-6">
                      <small className="text-muted">Precio Original</small>
                      <div className="text-decoration-line-through">${offer.precioOriginal}</div>
                    </div>
                    <div className="col-6">
                      <small className="text-muted">Precio con Descuento</small>
                      <div className="text-success fw-bold">${offer.precioDescuento}</div>
                    </div>
                  </div>

                  {offer.estado === 'rechazada' && offer.motivoRechazo && (
                    <div className="alert alert-danger small mb-3">
                      <strong>Motivo de rechazo:</strong> {offer.motivoRechazo}
                    </div>
                  )}

                  <div className="d-flex justify-content-between">
                    <small className="text-muted">
                      Creada: {new Date(offer.fechaCreacion).toLocaleDateString()}
                    </small>
                    <div>
                      <button className="btn btn-outline-primary btn-sm me-2">
                        ✏️ Editar
                      </button>
                      <button className="btn btn-outline-danger btn-sm">
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal para crear oferta */}
      {showCreateForm && (
        <CreateOfferForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={loadMyOffers}
        />
      )}
    </div>
  );
};

export default MyOffers;
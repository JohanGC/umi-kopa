import React, { useState, useEffect } from 'react';
import { dataService } from '../services/dataService';
import { useNotification } from '../context/NotificationContext';
import ChangePasswordForm from '../components/ChangePasswordForm';

const Profile = ({ user }) => {
  const [userParticipations, setUserParticipations] = useState({ offers: [], activities: [] });
  const [offers, setOffers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const { addNotification } = useNotification();

  useEffect(() => {
    // Cargar datos del usuario
    loadUserData();
  }, [user.email]);

  const loadUserData = async () => {
    try {
      // En una implementación real, esto vendría de APIs
      const participations = { offers: [], activities: [] }; // dataService.getUserParticipations(user.email);
      setUserParticipations(participations);
      
      const allOffers = await dataService.getOffers();
      const allActivities = await dataService.getActivities();
      
      setOffers(allOffers);
      setActivities(allActivities);
    } catch (error) {
      addNotification('Error cargando datos del perfil', 'error');
    }
  };

  const getUserOffers = () => {
    return offers.filter(offer => userParticipations.offers.includes(offer.id));
  };

  const getUserActivities = () => {
    return activities.filter(activity => userParticipations.activities.includes(activity.id));
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  const handleEditProfile = () => {
    addNotification('Funcionalidad de edición de perfil en desarrollo', 'info');
  };

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-4">
          <div className="card shadow">
            <div className="card-body p-4">
              <h2 className="card-title text-center mb-4">Mi Perfil</h2>
              
              <div className="text-center mb-4">
                <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center" 
                     style={{width: '80px', height: '80px', fontSize: '2rem'}}>
                  {user.nombre.charAt(0).toUpperCase()}
                </div>
              </div>
              
              <div className="mb-3">
                <label className="form-label fw-bold">Nombre:</label>
                <p className="fs-5">{user.nombre}</p>
              </div>
              
              <div className="mb-3">
                <label className="form-label fw-bold">Email:</label>
                <p className="fs-5">{user.email}</p>
              </div>
              
              <div className="mb-3">
                <label className="form-label fw-bold">Rol:</label>
                <p>
                  <span className={`badge ${
                    user.rol === 'administrador' ? 'bg-danger' :
                    user.rol === 'oferente' ? 'bg-warning' : 'bg-info'
                  }`}>
                    {user.rol === 'administrador' ? '👑 Administrador' :
                     user.rol === 'oferente' ? '🏢 Oferente' : '👤 Usuario'}
                  </span>
                </p>
              </div>

              {user.empresa && (
                <div className="mb-3">
                  <label className="form-label fw-bold">Empresa:</label>
                  <p className="fs-5">{user.empresa}</p>
                </div>
              )}

              {user.telefono && (
                <div className="mb-3">
                  <label className="form-label fw-bold">Teléfono:</label>
                  <p className="fs-5">{user.telefono}</p>
                </div>
              )}

              {user.direccion && (
                <div className="mb-3">
                  <label className="form-label fw-bold">Dirección:</label>
                  <p className="fs-5">{user.direccion}</p>
                </div>
              )}

              <div className="d-grid gap-2">
                <button 
                  className="btn btn-primary"
                  onClick={handleEditProfile}
                >
                  ✏️ Editar Perfil
                </button>
                <button 
                  className="btn btn-warning"
                  onClick={() => setShowChangePassword(true)}
                >
                  🔐 Cambiar Contraseña
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-body p-4">
              <h3 className="card-title mb-4">Mis Participaciones</h3>
              
              <div className="mb-4">
                <h5>🎯 Ofertas Activas ({getUserOffers().length})</h5>
                {getUserOffers().length > 0 ? (
                  <div className="list-group">
                    {getUserOffers().map(offer => (
                      <div key={offer.id} className="list-group-item">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="mb-1">{offer.title}</h6>
                            <small>{offer.description}</small>
                          </div>
                          <span className="badge bg-success">{offer.discount}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted">No has participado en ninguna oferta aún.</p>
                )}
              </div>
              
              <div>
                <h5>📅 Actividades Registradas ({getUserActivities().length})</h5>
                {getUserActivities().length > 0 ? (
                  <div className="list-group">
                    {getUserActivities().map(activity => (
                      <div key={activity.id} className="list-group-item">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="mb-1">{activity.title}</h6>
                            <small>{activity.description}</small>
                            <br />
                            <small className="text-muted">Fecha: {formatDate(activity.date)}</small>
                          </div>
                          <span className="badge bg-info">{activity.discount}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted">No te has registrado en ninguna actividad aún.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de cambio de contraseña */}
      {showChangePassword && (
        <ChangePasswordForm
          onClose={() => setShowChangePassword(false)}
          onSuccess={() => {
            addNotification('Contraseña cambiada exitosamente', 'success');
            setShowChangePassword(false);
          }}
        />
      )}
    </div>
  );
};

export default Profile;
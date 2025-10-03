import React, { useState, useEffect } from 'react';
import { dataService } from '../services/dataService';

const Profile = ({ user }) => {
  const [userParticipations, setUserParticipations] = useState({ offers: [], activities: [] });
  const [offers, setOffers] = useState([]);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    // Verifica que user y user.email existan antes de usarlos
    if (user && user.email) {
      const participations = dataService.getUserParticipations(user.email);
      setUserParticipations(participations);
    }
    
    const allOffers = dataService.getOffers();
    const allActivities = dataService.getActivities();
    
    setOffers(allOffers);
    setActivities(allActivities);
  }, [user?.email]); // Protege la dependencia también

  // Agrega validación para user
  if (!user) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning text-center">
          <h4>Usuario no encontrado</h4>
          <p>No se pudieron cargar los datos del perfil.</p>
        </div>
      </div>
    );
  }

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

  // ✅ CORREGIDO - Protege el acceso a user.nombre
  const firstLetter = user?.nombre?.charAt(0) || 'U';
  const userName = user?.nombre || 'Usuario';
  const userEmail = user?.email || 'No especificado';

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
                  {firstLetter} {/* ✅ Usa la variable protegida */}
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Nombre:</label>
                <p className="fs-5">{userName}</p> {/* ✅ Usa la variable protegida */}
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Email:</label>
                <p className="fs-5">{userEmail}</p> {/* ✅ Usa la variable protegida */}
              </div>
              <div className="d-grid gap-2">
                <button className="btn btn-primary">Editar Perfil</button>
                <button className="btn btn-outline-secondary">Cambiar Contraseña</button>
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
    </div>
  );
};

export default Profile;
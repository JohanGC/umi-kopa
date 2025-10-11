import React, { useState, useEffect } from 'react';
import { authService } from '../services/auth';
import { useNotification } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import CreateActivityForm from '../components/CreateActivityForm';

const MyActivities = () => {
  const [activities, setActivities] = useState([]);
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
    loadMyActivities();
  }, [navigate, addNotification]);

  const loadMyActivities = async () => {
    try {
      // Simular carga de actividades del usuario
      const mockActivities = [
        {
          id: 1,
          titulo: 'Taller de Cocina Italiana',
          descripcion: 'Aprende a preparar auténtica pasta italiana con chefs expertos',
          descuento: '25%',
          categoria: 'taller',
          estado: 'aprobada',
          participantes: 15,
          maxParticipantes: 20,
          fecha: '2024-02-15',
          hora: '18:00',
          duracion: '3 horas',
          ubicacion: 'Calle Gourmet 123, Ciudad',
          fechaCreacion: '2024-01-10',
          precioOriginal: 80,
          precioDescuento: 60
        },
        {
          id: 2,
          titulo: 'Tour Cultural por el Centro Histórico',
          descripcion: 'Recorrido guiado por los lugares más emblemáticos de la ciudad',
          descuento: '30%',
          categoria: 'tour',
          estado: 'pendiente',
          participantes: 8,
          maxParticipantes: 30,
          fecha: '2024-02-20',
          hora: '10:00',
          duracion: '4 horas',
          ubicacion: 'Plaza Central, Ciudad',
          fechaCreacion: '2024-01-15',
          precioOriginal: 50,
          precioDescuento: 35
        },
        {
          id: 3,
          titulo: 'Clase de Yoga para Principiantes',
          descripcion: 'Sesiones de yoga para todos los niveles en un ambiente relajante',
          descuento: '20%',
          categoria: 'clase',
          estado: 'rechazada',
          participantes: 0,
          maxParticipantes: 15,
          fecha: '2024-02-18',
          hora: '08:00',
          duracion: '1.5 horas',
          ubicacion: 'Centro de Bienestar, Av. Salud 456',
          fechaCreacion: '2024-01-08',
          precioOriginal: 40,
          precioDescuento: 32,
          motivoRechazo: 'El instructor no cuenta con las certificaciones requeridas'
        }
      ];
      setActivities(mockActivities);
    } catch (error) {
      addNotification('Error cargando tus actividades', 'error');
    }
  };

  const getStatusBadge = (estado) => {
    const statusConfig = {
      pendiente: { class: 'bg-warning', text: '⏳ Pendiente' },
      aprobada: { class: 'bg-success', text: '✅ Aprobada' },
      rechazada: { class: 'bg-danger', text: '❌ Rechazada' },
      completada: { class: 'bg-secondary', text: '🎯 Completada' }
    };
    
    const config = statusConfig[estado] || statusConfig.pendiente;
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  const getProgressPercentage = (participantes, maxParticipantes) => {
    return (participantes / maxParticipantes) * 100;
  };

  const formatDateTime = (fecha, hora) => {
    const date = new Date(fecha);
    return `${date.toLocaleDateString('es-ES')} a las ${hora}`;
  };

  const isActivityUpcoming = (fecha) => {
    return new Date(fecha) > new Date();
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
          <h2>🎯 Mis Actividades</h2>
          <p className="text-muted">Gestiona las actividades que has creado</p>
        </div>
        <button 
          className="btn btn-success"
          onClick={() => setShowCreateForm(true)}
        >
          + Crear Nueva Actividad
        </button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body text-center">
              <h5>Total</h5>
              <h3>{activities.length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body text-center">
              <h5>Aprobadas</h5>
              <h3>{activities.filter(a => a.estado === 'aprobada').length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-dark">
            <div className="card-body text-center">
              <h5>Pendientes</h5>
              <h3>{activities.filter(a => a.estado === 'pendiente').length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body text-center">
              <h5>Próximas</h5>
              <h3>{activities.filter(a => a.estado === 'aprobada' && isActivityUpcoming(a.fecha)).length}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de actividades */}
      <div className="row">
        {activities.length === 0 ? (
          <div className="col-12">
            <div className="card text-center py-5">
              <div className="card-body">
                <h4>📝 Aún no has creado actividades</h4>
                <p className="text-muted mb-4">
                  Crea tu primera actividad para que los usuarios puedan registrarse
                </p>
                <button 
                  className="btn btn-success btn-lg"
                  onClick={() => setShowCreateForm(true)}
                >
                  🎯 Crear Mi Primera Actividad
                </button>
              </div>
            </div>
          </div>
        ) : (
          activities.map(activity => (
            <div key={activity.id} className="col-md-6 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="card-title">{activity.titulo}</h5>
                    {getStatusBadge(activity.estado)}
                  </div>
                  
                  <p className="card-text text-muted">{activity.descripcion}</p>
                  
                  <div className="mb-3">
                    <span className="badge bg-info me-2">{activity.categoria}</span>
                    <span className="badge bg-success">{activity.descuento} DESCUENTO</span>
                    {isActivityUpcoming(activity.fecha) && activity.estado === 'aprobada' && (
                      <span className="badge bg-primary ms-2">📅 Próxima</span>
                    )}
                  </div>

                  <div className="mb-3">
                    <div className="small text-muted">
                      <strong>📅 Fecha y Hora:</strong> {formatDateTime(activity.fecha, activity.hora)}
                    </div>
                    <div className="small text-muted">
                      <strong>⏱️ Duración:</strong> {activity.duracion}
                    </div>
                    <div className="small text-muted">
                      <strong>📍 Ubicación:</strong> {activity.ubicacion}
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between small text-muted mb-1">
                      <span>Inscritos: {activity.participantes}/{activity.maxParticipantes}</span>
                      <span>{Math.round(getProgressPercentage(activity.participantes, activity.maxParticipantes))}%</span>
                    </div>
                    <div className="progress" style={{height: '6px'}}>
                      <div 
                        className="progress-bar" 
                        style={{width: `${getProgressPercentage(activity.participantes, activity.maxParticipantes)}%`}}
                      ></div>
                    </div>
                  </div>

                  <div className="row text-center mb-3">
                    <div className="col-6">
                      <small className="text-muted">Precio Original</small>
                      <div className="text-decoration-line-through">${activity.precioOriginal}</div>
                    </div>
                    <div className="col-6">
                      <small className="text-muted">Precio con Descuento</small>
                      <div className="text-success fw-bold">${activity.precioDescuento}</div>
                    </div>
                  </div>

                  {activity.estado === 'rechazada' && activity.motivoRechazo && (
                    <div className="alert alert-danger small mb-3">
                      <strong>Motivo de rechazo:</strong> {activity.motivoRechazo}
                    </div>
                  )}

                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                      Creada: {new Date(activity.fechaCreacion).toLocaleDateString()}
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

      {/* Modal para crear actividad */}
      {showCreateForm && (
        <CreateActivityForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={loadMyActivities}
        />
      )}
    </div>
  );
};

export default MyActivities;
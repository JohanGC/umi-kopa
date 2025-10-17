import React, { useState, useEffect } from 'react';
import { authService } from '../services/auth';// Tu servicio de auth existente
import { dataService } from '../services/dataService';// El nuevo con API
import { useNotification } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
// En AdminPanel.js - verifica estos imports

const AdminPanel = () => {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [offers, setOffers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [pendingOffers, setPendingOffers] = useState([]);
  const [pendingActivities, setPendingActivities] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user || user.rol !== 'administrador') {
      addNotification('Acceso denegado. Se requieren privilegios de administrador.', 'error');
      navigate('/');
      return;
    }
    setCurrentUser(user);
    loadDashboardData();
  }, [navigate, addNotification]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Cargar estadísticas
      const statsData = await dataService.getAdminStats();
      setStats(statsData);

      // Cargar usuarios
      const usersData = await dataService.getUsers();
      setUsers(usersData);

      // Cargar ofertas y actividades
      const [offersData, activitiesData, pendingOffersData, pendingActivitiesData] = await Promise.all([
        dataService.getOffers(),
        dataService.getActivities(),
        dataService.getPendingOffers(),
        dataService.getPendingActivities()
      ]);

      setOffers(offersData);
      setActivities(activitiesData);
      setPendingOffers(pendingOffersData);
      setPendingActivities(pendingActivitiesData);

    } catch (error) {
      console.error('Error cargando datos:', error);
      addNotification('Error cargando datos del panel', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, type) => {
    try {
      if (type === 'offer') {
        await dataService.approveOffer(id, 'approve');
      } else {
        await dataService.approveActivity(id, 'approve');
      }
      addNotification(`${type === 'offer' ? 'Oferta' : 'Actividad'} aprobada correctamente`, 'success');
      loadDashboardData();
    } catch (error) {
      addNotification('Error al aprobar', 'error');
    }
  };

  const handleReject = async (id, type) => {
    const motivo = prompt('Ingrese el motivo del rechazo:', 'No cumple con las políticas');
    if (motivo === null) return; // Usuario canceló

    try {
      if (type === 'offer') {
        await dataService.approveOffer(id, 'reject', motivo);
      } else {
        await dataService.approveActivity(id, 'reject', motivo);
      }
      addNotification(`${type === 'offer' ? 'Oferta' : 'Actividad'} rechazada`, 'warning');
      loadDashboardData();
    } catch (error) {
      addNotification('Error al rechazar', 'error');
    }
  };

  const loadPendingData = async () => {
    try {
      const [pendingOffers, pendingActivities] = await Promise.all([
        dataService.getPendingOffers(),
        dataService.getPendingActivities()
      ]);
      
      console.log('📊 Ofertas pendientes:', pendingOffers);
      console.log('📊 Actividades pendientes:', pendingActivities);
      
      setPendingOffers(Array.isArray(pendingOffers) ? pendingOffers : []);
      setPendingActivities(Array.isArray(pendingActivities) ? pendingActivities : []);
    } catch (error) {
      console.error('Error cargando datos pendientes:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await dataService.deleteUser(userId);
      addNotification('Usuario eliminado correctamente', 'success');
      loadDashboardData();
    } catch (error) {
      addNotification('Error eliminando usuario', 'error');
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await dataService.updateUser(userId, { activo: newStatus });
      addNotification(`Usuario ${newStatus ? 'activado' : 'desactivado'}`, 'success');
      loadDashboardData();
    } catch (error) {
      addNotification('Error actualizando usuario', 'error');
    }
  };

  const handleDeleteOffer = async (offerId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta oferta?')) {
      return;
    }

    try {
      await dataService.deleteOffer(offerId);
      addNotification('Oferta eliminada correctamente', 'success');
      loadDashboardData();
    } catch (error) {
      addNotification('Error eliminando oferta', 'error');
    }
  };

  const handleDeleteActivity = async (activityId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta actividad?')) {
      return;
    }

    try {
      await dataService.deleteActivity(activityId);
      addNotification('Actividad eliminada correctamente', 'success');
      loadDashboardData();
    } catch (error) {
      addNotification('Error eliminando actividad', 'error');
    }
  };

  const handleViewDetails = (item, type) => {
    // Aquí puedes implementar un modal o navegación para ver detalles
    console.log(`Ver detalles de ${type}:`, item);
    addNotification(`Viendo detalles de ${type}`, 'info');
  };

  const handleEdit = (item, type) => {
    // Aquí puedes implementar la edición
    console.log(`Editar ${type}:`, item);
    addNotification(`Editando ${type}`, 'info');
  };

  const getStatusBadge = (estado) => {
    const statusConfig = {
      pendiente: { class: 'bg-warning', text: '⏳ Pendiente' },
      aprobada: { class: 'bg-success', text: '✅ Aprobada' },
      rechazada: { class: 'bg-danger', text: '❌ Rechazada' },
      expirada: { class: 'bg-secondary', text: '📅 Expirada' },
      completada: { class: 'bg-info', text: '🎯 Completada' },
      activa: { class: 'bg-success', text: '✅ Activa' },
      inactiva: { class: 'bg-secondary', text: '⏸️ Inactiva' }
    };
    
    const config = statusConfig[estado] || statusConfig.pendiente;
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  const getRoleBadge = (rol) => {
    const roleConfig = {
      administrador: { class: 'bg-danger', text: '👑 Admin' },
      oferente: { class: 'bg-warning', text: '🏢 Oferente' },
      usuario: { class: 'bg-info', text: '👤 Usuario' }
    };
    
    const config = roleConfig[rol] || roleConfig.usuario;
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  // Función para formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando panel...</span>
          </div>
          <p className="mt-2">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4">
      <div className="row">
        <div className="col-md-3">
          <div className="card">
            <div className="card-header bg-danger text-white">
              <h5 className="mb-0">👑 Panel de Administración</h5>
              <small className="text-light">Bienvenido, {currentUser.nombre}</small>
            </div>
            <div className="list-group list-group-flush">
              <button
                className={`list-group-item list-group-item-action ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                📊 Dashboard
              </button>
              <button
                className={`list-group-item list-group-item-action ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                👥 Gestión de Usuarios
              </button>
              <button
                className={`list-group-item list-group-item-action ${activeTab === 'offers' ? 'active' : ''}`}
                onClick={() => setActiveTab('offers')}
              >
                🏷️ Todas las Ofertas
              </button>
              <button
                className={`list-group-item list-group-item-action ${activeTab === 'activities' ? 'active' : ''}`}
                onClick={() => setActiveTab('activities')}
              >
                🎯 Todas las Actividades
              </button>
              <button
                className={`list-group-item list-group-item-action ${activeTab === 'pending' ? 'active' : ''}`}
                onClick={() => setActiveTab('pending')}
              >
                ⏳ Pendientes de Aprobación
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-9">
          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div>
              <h2 className="mb-4">📊 Dashboard de Administración</h2>
              
              <div className="row">
                <div className="col-md-3 mb-4">
                  <div className="card bg-primary text-white">
                    <div className="card-body text-center">
                      <h5>👥 Total Usuarios</h5>
                      <h2 className="display-4">{stats.totalUsers || 0}</h2>
                      <small>{stats.newUsers || 0} nuevos</small>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-3 mb-4">
                  <div className="card bg-success text-white">
                    <div className="card-body text-center">
                      <h5>🏷️ Ofertas Activas</h5>
                      <h2 className="display-4">{stats.totalOffers || 0}</h2>
                      <small>{stats.pendingOffers || 0} pendientes</small>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-3 mb-4">
                  <div className="card bg-info text-white">
                    <div className="card-body text-center">
                      <h5>🎯 Actividades Activas</h5>
                      <h2 className="display-4">{stats.totalActivities || 0}</h2>
                      <small>{stats.pendingActivities || 0} pendientes</small>
                    </div>
                  </div>
                </div>

                <div className="col-md-3 mb-4">
                  <div className="card bg-warning text-dark">
                    <div className="card-body text-center">
                      <h5>💰 Ingresos Totales</h5>
                      <h2 className="display-4">${stats.totalRevenue || 0}</h2>
                      <small>Este mes</small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resumen rápido */}
              <div className="row">
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-header">
                      <h6>📋 Resumen de Pendientes</h6>
                    </div>
                    <div className="card-body">
                      <div className="d-flex justify-content-between mb-2">
                        <span>Ofertas pendientes:</span>
                        <span className="badge bg-warning">{pendingOffers.length}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Actividades pendientes:</span>
                        <span className="badge bg-warning">{pendingActivities.length}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>Total pendientes:</span>
                        <strong>{pendingOffers.length + pendingActivities.length}</strong>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-header">
                      <h6>📊 Distribución de Usuarios</h6>
                    </div>
                    <div className="card-body">
                      <div className="d-flex justify-content-between mb-2">
                        <span>Administradores:</span>
                        <span className="badge bg-danger">
                          {users.filter(u => u.rol === 'administrador').length}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Oferentes:</span>
                        <span className="badge bg-warning">
                          {users.filter(u => u.rol === 'oferente').length}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>Usuarios:</span>
                        <span className="badge bg-info">
                          {users.filter(u => u.rol === 'usuario').length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Gestión de Usuarios */}
          {activeTab === 'users' && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>👥 Gestión de Usuarios</h2>
                <span className="badge bg-primary">Total: {users.length}</span>
              </div>
              
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Teléfono</th>
                      <th>Rol</th>
                      <th>Empresa</th>
                      <th>Fecha Registro</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user._id}>
                        <td>
                          <strong>{user.nombre}</strong>
                          {user.verificada && <span className="badge bg-success ms-1">✓</span>}
                        </td>
                        <td>{user.email}</td>
                        <td>{user.telefono || 'N/A'}</td>
                        <td>{getRoleBadge(user.rol)}</td>
                        <td>{user.empresa || 'N/A'}</td>
                        <td>{formatDate(user.createdAt)}</td>
                        <td>
                          <span 
                            className={`badge ${user.activo !== false ? 'bg-success' : 'bg-secondary'} cursor-pointer`}
                            onClick={() => handleToggleUserStatus(user._id, user.activo !== false)}
                            title="Click para cambiar estado"
                          >
                            {user.activo !== false ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button 
                              className="btn btn-outline-primary"
                              title="Ver detalles"
                              onClick={() => handleViewDetails(user, 'usuario')}
                            >
                              👁️
                            </button>
                            <button 
                              className="btn btn-outline-warning"
                              title="Editar usuario"
                              onClick={() => handleEdit(user, 'usuario')}
                            >
                              ✏️
                            </button>
                            <button 
                              className="btn btn-outline-danger"
                              onClick={() => handleDeleteUser(user._id)}
                              title="Eliminar usuario"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {users.length === 0 && (
                <div className="alert alert-info text-center">
                  <h5>📝 No hay usuarios registrados</h5>
                  <p>Los usuarios aparecerán aquí cuando se registren en la plataforma.</p>
                </div>
              )}
            </div>
          )}

          {/* Todas las Ofertas */}
          {activeTab === 'offers' && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>🏷️ Todas las Ofertas</h2>
                <span className="badge bg-primary">Total: {offers.length}</span>
              </div>
              
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th>Título</th>
                      <th>Empresa</th>
                      <th>Categoría</th>
                      <th>Descuento</th>
                      <th>Participantes</th>
                      <th>Precio</th>
                      <th>Estado</th>
                      <th>Fecha Creación</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {offers.map(offer => (
                      <tr key={offer._id}>
                        <td>
                          <strong>{offer.titulo}</strong>
                          <br />
                          <small className="text-muted">{offer.descripcion?.substring(0, 50)}...</small>
                        </td>
                        <td>{offer.empresa}</td>
                        <td>
                          <span className="badge bg-info">{offer.categoria}</span>
                        </td>
                        <td>
                          <span className="badge bg-success">{offer.descuento}</span>
                        </td>
                        <td>
                          {offer.participantes || 0}/{offer.maxParticipantes || 0}
                          <div className="progress mt-1" style={{height: '4px'}}>
                            <div 
                              className="progress-bar" 
                              style={{
                                width: `${((offer.participantes || 0) / (offer.maxParticipantes || 1)) * 100}%`
                              }}
                            ></div>
                          </div>
                        </td>
                        <td>
                          <div>
                            <small className="text-decoration-line-through">${offer.precioOriginal}</small>
                            <br />
                            <strong className="text-success">${offer.precioDescuento}</strong>
                          </div>
                        </td>
                        <td>{getStatusBadge(offer.estado)}</td>
                        <td>{formatDate(offer.createdAt)}</td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button 
                              className="btn btn-outline-primary" 
                              title="Ver detalles"
                              onClick={() => handleViewDetails(offer, 'oferta')}
                            >
                              👁️
                            </button>
                            <button 
                              className="btn btn-outline-warning" 
                              title="Editar"
                              onClick={() => handleEdit(offer, 'oferta')}
                            >
                              ✏️
                            </button>
                            <button 
                              className="btn btn-outline-danger" 
                              title="Eliminar"
                              onClick={() => handleDeleteOffer(offer._id)}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {offers.length === 0 && (
                <div className="alert alert-info text-center">
                  <h5>📝 No hay ofertas registradas</h5>
                  <p>Las ofertas aparecerán aquí cuando sean creadas.</p>
                </div>
              )}
            </div>
          )}

          {/* Todas las Actividades */}
          {activeTab === 'activities' && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>🎯 Todas las Actividades</h2>
                <span className="badge bg-primary">Total: {activities.length}</span>
              </div>
              
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th>Título</th>
                      <th>Empresa</th>
                      <th>Categoría</th>
                      <th>Fecha</th>
                      <th>Participantes</th>
                      <th>Precio</th>
                      <th>Estado</th>
                      <th>Fecha Creación</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities.map(activity => (
                      <tr key={activity._id}>
                        <td>
                          <strong>{activity.titulo}</strong>
                          <br />
                          <small className="text-muted">{activity.descripcion?.substring(0, 50)}...</small>
                        </td>
                        <td>{activity.empresa}</td>
                        <td>
                          <span className="badge bg-info">{activity.categoria}</span>
                        </td>
                        <td>{formatDate(activity.fecha)}</td>
                        <td>
                          {activity.participantes || 0}/{activity.maxParticipantes || 0}
                          <div className="progress mt-1" style={{height: '4px'}}>
                            <div 
                              className="progress-bar" 
                              style={{
                                width: `${((activity.participantes || 0) / (activity.maxParticipantes || 1)) * 100}%`
                              }}
                            ></div>
                          </div>
                        </td>
                        <td>
                          <div>
                            <small className="text-decoration-line-through">${activity.precioOriginal}</small>
                            <br />
                            <strong className="text-success">${activity.precioDescuento}</strong>
                          </div>
                        </td>
                        <td>{getStatusBadge(activity.estado)}</td>
                        <td>{formatDate(activity.createdAt)}</td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button 
                              className="btn btn-outline-primary" 
                              title="Ver detalles"
                              onClick={() => handleViewDetails(activity, 'actividad')}
                            >
                              👁️
                            </button>
                            <button 
                              className="btn btn-outline-warning" 
                              title="Editar"
                              onClick={() => handleEdit(activity, 'actividad')}
                            >
                              ✏️
                            </button>
                            <button 
                              className="btn btn-outline-danger" 
                              title="Eliminar"
                              onClick={() => handleDeleteActivity(activity._id)}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {activities.length === 0 && (
                <div className="alert alert-info text-center">
                  <h5>📝 No hay actividades registradas</h5>
                  <p>Las actividades aparecerán aquí cuando sean creadas.</p>
                </div>
              )}
            </div>
          )}

          {/* Pendientes de Aprobación */}
          {activeTab === 'pending' && (
            <div>
              <h2 className="mb-4">⏳ Pendientes de Aprobación</h2>
              
              <div className="row">
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-header bg-warning">
                      <h5 className="mb-0">🏷️ Ofertas Pendientes ({pendingOffers.length})</h5>
                    </div>
                    <div className="card-body">
                      {pendingOffers.length === 0 ? (
                        <div className="alert alert-success">
                          ✅ No hay ofertas pendientes de aprobación
                        </div>
                      ) : (
                        pendingOffers.map(offer => (
                          <div key={offer._id} className="border rounded p-3 mb-3">
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <h6>{offer.titulo}</h6>
                                <p className="text-muted small mb-2">{offer.descripcion}</p>
                                <div>
                                  <span className="badge bg-info me-2">{offer.categoria}</span>
                                  <span className="badge bg-success">{offer.descuento}</span>
                                </div>
                                <small className="text-muted">
                                  Empresa: {offer.empresa} | Creado: {formatDate(offer.createdAt)}
                                </small>
                              </div>
                              <div className="btn-group btn-group-sm">
                                <button 
                                  className="btn btn-success"
                                  onClick={() => handleApprove(offer._id, 'offer')}
                                >
                                  ✅ Aprobar
                                </button>
                                <button 
                                  className="btn btn-danger"
                                  onClick={() => handleReject(offer._id, 'offer')}
                                >
                                  ❌ Rechazar
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="card">
                    <div className="card-header bg-warning">
                      <h5 className="mb-0">🎯 Actividades Pendientes ({pendingActivities.length})</h5>
                    </div>
                    <div className="card-body">
                      {pendingActivities.length === 0 ? (
                        <div className="alert alert-success">
                          ✅ No hay actividades pendientes de aprobación
                        </div>
                      ) : (
                        pendingActivities.map(activity => (
                          <div key={activity._id} className="border rounded p-3 mb-3">
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <h6>{activity.titulo}</h6>
                                <p className="text-muted small mb-2">{activity.descripcion}</p>
                                <div>
                                  <span className="badge bg-info me-2">{activity.categoria}</span>
                                  <span className="badge bg-success">{activity.descuento}</span>
                                </div>
                                <small className="text-muted">
                                  Empresa: {activity.empresa} | Fecha: {formatDate(activity.fecha)}
                                </small>
                              </div>
                              <div className="btn-group btn-group-sm">
                                <button 
                                  className="btn btn-success"
                                  onClick={() => handleApprove(activity._id, 'activity')}
                                >
                                  ✅ Aprobar
                                </button>
                                <button 
                                  className="btn btn-danger"
                                  onClick={() => handleReject(activity._id, 'activity')}
                                >
                                  ❌ Rechazar
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
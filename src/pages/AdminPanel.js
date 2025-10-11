import React, { useState, useEffect } from 'react';
import { authService } from '../services/auth';
import { useNotification } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
  const [stats, setStats] = useState({});
  const [pendingOffers, setPendingOffers] = useState([]);
  const [pendingActivities, setPendingActivities] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
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
    // Cargar ofertas pendientes
    const offersResponse = await fetch('/api/offers/pending', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    const pendingOffers = await offersResponse.json();

    // Cargar actividades pendientes
    const activitiesResponse = await fetch('/api/activities/pending', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    const pendingActivities = await activitiesResponse.json();

    setPendingOffers(pendingOffers);
    setPendingActivities(pendingActivities);

    // Cargar estadísticas
    const statsResponse = await fetch('/api/admin/stats', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    const statsData = await statsResponse.json();
    setStats(statsData);

  } catch (error) {
    addNotification('Error cargando datos del panel', 'error');
  }
};

const handleApprove = async (id, type) => {
  try {
    const response = await fetch(`/api/${type}s/${id}/approve`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ estado: 'aprobada' })
    });

    if (response.ok) {
      addNotification(`${type} aprobado correctamente`, 'success');
      loadDashboardData(); // Recargar datos
    } else {
      const errorData = await response.json();
      addNotification(errorData.message, 'error');
    }
  } catch (error) {
    addNotification('Error al aprobar', 'error');
  }
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
    <div className="container-fluid mt-4">
      <div className="row">
        <div className="col-md-3">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">🔧 Panel de Administración</h5>
            </div>
            <div className="list-group list-group-flush">
              <button
                className={`list-group-item list-group-item-action ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                📊 Dashboard
              </button>
              <button
                className={`list-group-item list-group-item-action ${activeTab === 'offers' ? 'active' : ''}`}
                onClick={() => setActiveTab('offers')}
              >
                🏷️ Ofertas Pendientes
              </button>
              <button
                className={`list-group-item list-group-item-action ${activeTab === 'activities' ? 'active' : ''}`}
                onClick={() => setActiveTab('activities')}
              >
                🎯 Actividades Pendientes
              </button>
              <button
                className={`list-group-item list-group-item-action ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                👥 Gestión de Usuarios
              </button>
              <button
                className={`list-group-item list-group-item-action ${activeTab === 'reports' ? 'active' : ''}`}
                onClick={() => setActiveTab('reports')}
              >
                📈 Reportes
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
                <div className="col-md-4 mb-4">
                  <div className="card bg-primary text-white">
                    <div className="card-body">
                      <h5 className="card-title">👥 Total Usuarios</h5>
                      <h2 className="display-4">{stats.totalUsers}</h2>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-4 mb-4">
                  <div className="card bg-success text-white">
                    <div className="card-body">
                      <h5 className="card-title">🏷️ Ofertas Activas</h5>
                      <h2 className="display-4">{stats.totalOffers}</h2>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-4 mb-4">
                  <div className="card bg-info text-white">
                    <div className="card-body">
                      <h5 className="card-title">🎯 Actividades Activas</h5>
                      <h2 className="display-4">{stats.totalActivities}</h2>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-4">
                  <div className="card bg-warning text-dark">
                    <div className="card-body">
                      <h5 className="card-title">⏳ Pendientes de Aprobación</h5>
                      <h2 className="display-4">{stats.pendingApprovals}</h2>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-6 mb-4">
                  <div className="card bg-secondary text-white">
                    <div className="card-body">
                      <h5 className="card-title">🎉 Participantes Activos</h5>
                      <h2 className="display-4">{stats.activeParticipants}</h2>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resumen de pendientes */}
              <div className="row">
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-header">
                      <h6>🏷️ Ofertas Pendientes</h6>
                    </div>
                    <div className="card-body">
                      {pendingOffers.slice(0, 3).map(offer => (
                        <div key={offer.id} className="d-flex justify-content-between align-items-center mb-2">
                          <span>{offer.titulo}</span>
                          <span className="badge bg-warning">Pendiente</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-header">
                      <h6>🎯 Actividades Pendientes</h6>
                    </div>
                    <div className="card-body">
                      {pendingActivities.slice(0, 3).map(activity => (
                        <div key={activity.id} className="d-flex justify-content-between align-items-center mb-2">
                          <span>{activity.titulo}</span>
                          <span className="badge bg-warning">Pendiente</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ofertas Pendientes */}
          {activeTab === 'offers' && (
            <div>
              <h2 className="mb-4">🏷️ Ofertas Pendientes de Aprobación</h2>
              
              {pendingOffers.length === 0 ? (
                <div className="alert alert-success">
                  ✅ No hay ofertas pendientes de aprobación
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Título</th>
                        <th>Empresa</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingOffers.map(offer => (
                        <tr key={offer.id}>
                          <td>{offer.titulo}</td>
                          <td>{offer.empresa}</td>
                          <td>{offer.fecha}</td>
                          <td>
                            <span className="badge bg-warning">{offer.estado}</span>
                          </td>
                          <td>
                            <button 
                              className="btn btn-success btn-sm me-2"
                              onClick={() => handleApprove(offer.id, 'offer')}
                            >
                              ✅ Aprobar
                            </button>
                            <button 
                              className="btn btn-danger btn-sm"
                              onClick={() => handleReject(offer.id, 'offer')}
                            >
                              ❌ Rechazar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Gestión de Usuarios */}
          {activeTab === 'users' && (
            <div>
              <h2 className="mb-4">👥 Gestión de Usuarios</h2>
              
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Rol</th>
                      <th>Fecha Registro</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>{user.nombre}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`badge ${
                            user.rol === 'administrador' ? 'bg-danger' :
                            user.rol === 'oferente' ? 'bg-warning' : 'bg-info'
                          }`}>
                            {user.rol}
                          </span>
                        </td>
                        <td>{user.fechaRegistro}</td>
                        <td>
                          <button className="btn btn-primary btn-sm me-2">
                            👁️ Ver
                          </button>
                          <button className="btn btn-warning btn-sm">
                            ✏️ Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
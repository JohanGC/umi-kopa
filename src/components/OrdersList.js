import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('todos');

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      let url = '/api/orders/public';
      
      if (filter === 'mis-mandados') {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Debes iniciar sesión para ver tus mandados');
          return;
        }
        url = '/api/orders/my-orders';
      }

      const response = await fetch(url, {
        headers: filter === 'mis-mandados' ? {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        } : {}
      });

      if (!response.ok) {
        throw new Error('Error cargando mandados');
      }

      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);



  const getEstadoBadge = (estado) => {
    const estados = {
      pendiente: { class: 'bg-warning', text: '🕒 Pendiente' },
      asignado: { class: 'bg-info', text: '🚗 Asignado' },
      en_proceso: { class: 'bg-primary', text: '📦 En Proceso' },
      completado: { class: 'bg-success', text: '✅ Completado' },
      cancelado: { class: 'bg-danger', text: '❌ Cancelado' }
    };
    
    const estadoInfo = estados[estado] || { class: 'bg-secondary', text: estado };
    return <span className={`badge ${estadoInfo.class}`}>{estadoInfo.text}</span>;
  };

  const getCategoriaIcon = (categoria) => {
    const icons = {
      comida: '🍕',
      mercado: '🛒',
      farmacia: '💊',
      paqueteria: '📦',
      documentos: '📄',
      otros: '🎯'
    };
    return icons[categoria] || '🎯';
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando mandados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>📋 Lista de Mandados</h2>
        <Link to="/create-order" className="btn btn-primary">
          🛵 Crear Nuevo Mandado
        </Link>
      </div>

      {/* Filtros */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn ${filter === 'todos' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilter('todos')}
            >
              🌟 Todos los Mandados
            </button>
            <button
              type="button"
              className={`btn ${filter === 'pendientes' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilter('pendientes')}
            >
              🕒 Solo Pendientes
            </button>
            <button
              type="button"
              className={`btn ${filter === 'mis-mandados' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilter('mis-mandados')}
            >
              👤 Mis Mandados
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <h5>📭 No hay mandados disponibles</h5>
            <p className="text-muted">
              {filter === 'mis-mandados' 
                ? 'Aún no has creado ningún mandado' 
                : 'No hay mandados publicados en este momento'
              }
            </p>
            {filter !== 'mis-mandados' && (
              <Link to="/create-order" className="btn btn-primary">
                🛵 Sé el primero en publicar
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="row">
          {orders.map((order) => (
            <div key={order._id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 shadow-sm">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <span>{getCategoriaIcon(order.categoria)} {order.categoria}</span>
                  {getEstadoBadge(order.estado)}
                </div>
                
                <div className="card-body">
                  <h6 className="card-title">{order.descripcion}</h6>
                  
                  <div className="mb-2">
                    <strong>💰 Precio:</strong> {formatPrice(order.precioOfertado)}
                  </div>
                  
                  <div className="mb-2">
                    <strong>👤 Solicitante:</strong> {order.usuario?.nombre || order.nombreUsuario}
                  </div>
                  
                  {order.telefono && (
                    <div className="mb-2">
                      <strong>📞 Teléfono:</strong> {order.telefono}
                    </div>
                  )}
                  
                  {order.ubicacionRecogida && (
                    <div className="mb-2">
                      <strong>📍 Recogida:</strong> 
                      <small className="d-block text-muted">{order.ubicacionRecogida}</small>
                    </div>
                  )}
                  
                  {order.ubicacionEntrega && (
                    <div className="mb-2">
                      <strong>🏠 Entrega:</strong>
                      <small className="d-block text-muted">{order.ubicacionEntrega}</small>
                    </div>
                  )}
                  
                  {order.notasAdicionales && (
                    <div className="mb-2">
                      <strong>📋 Notas:</strong>
                      <small className="d-block text-muted">{order.notasAdicionales}</small>
                    </div>
                  )}
                  
                  {order.fechaLimite && (
                    <div className="mb-2">
                      <strong>⏰ Límite:</strong>
                      <small className="d-block text-muted">
                        {new Date(order.fechaLimite).toLocaleString()}
                      </small>
                    </div>
                  )}
                  
                  <small className="text-muted">
                    Publicado: {new Date(order.createdAt).toLocaleDateString()}
                  </small>
                </div>
                
                <div className="card-footer bg-transparent">
                  {filter === 'todos' && order.estado === 'pendiente' && (
                    <button className="btn btn-success btn-sm w-100">
                      ✅ Aceptar Mandado
                    </button>
                  )}
                  
                  {filter === 'mis-mandados' && (
                    <div className="btn-group w-100" role="group">
                      <button className="btn btn-outline-primary btn-sm">
                        👀 Ver Detalles
                      </button>
                      {order.estado === 'pendiente' && (
                        <button className="btn btn-outline-danger btn-sm">
                          ❌ Cancelar
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersList;
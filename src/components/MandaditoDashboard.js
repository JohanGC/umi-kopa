// components/MandaditoDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MandaditoMap from './MandaditoMap';
import socketService from '../services/socketService';

const MandaditoDashboard = () => {
  const [ubicacion, setUbicacion] = useState(null);
  const [disponible, setDisponible] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [conectado, setConectado] = useState(false);
  const navigate = useNavigate();

  // ✅ CORREGIDO: Mejor manejo del usuario
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token');
        
        console.log('🔍 Verificando usuario en localStorage:', userData);

        if (!userData || !token) {
          console.warn('❌ No hay usuario o token en localStorage');
          navigate('/login');
          return;
        }

        // ✅ CORREGIDO: Verificación mejorada con manejo de errores
        try {
          const response = await fetch('/api/auth/profile', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          // ✅ Verificar si la respuesta es JSON válido
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('❌ Respuesta no es JSON:', text.substring(0, 100));
            
            // Si no es JSON, usar los datos de localStorage como respaldo
            if (userData.rol === 'mandadito') {
              setUser(userData);
              setLoading(false);
              return;
            } else {
              navigate('/dashboard');
              return;
            }
          }

          if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
          }

          const userInfo = await response.json();
          console.log('✅ Usuario verificado con backend:', userInfo);
          
          if (userInfo.user.rol !== 'mandadito') {
            console.error('❌ Usuario no es mandadito:', userInfo.user.rol);
            navigate('/dashboard');
            return;
          }

          setUser(userInfo.user);
        } catch (error) {
          console.error('❌ Error en verificación de usuario:', error);
          
          // ✅ Respuesta de emergencia: usar datos de localStorage
          if (userData.rol === 'mandadito') {
            console.warn('⚠️ Usando datos de localStorage como respaldo');
            setUser(userData);
          } else {
            navigate('/login');
            return;
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('❌ Error inicializando dashboard:', error);
        navigate('/login');
      }
    };

    initializeUser();
  }, [navigate]);

  // ✅ CORREGIDO: WebSocket con mejor manejo de errores
  useEffect(() => {
    if (!user || !user._id) return;

    const serverUrl = process.env.REACT_APP_WS_URL || 'http://localhost:5000';
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('❌ No se encontró token en localStorage');
      navigate('/login');
      return;
    }

    console.log('🔄 Iniciando conexión WebSocket...');
    const socket = socketService.connect(serverUrl, token);
    
    if (socket) {
      // Configurar listeners
      socketService.onLocationUpdate((data) => {
        console.log('📍 Ubicación actualizada de otro mandadito:', data);
      });

      socketService.onLocationError((error) => {
        console.error('❌ Error en actualización de ubicación:', error);
      });

      // Unirse a la sala después de un breve delay para asegurar conexión
      setTimeout(() => {
        if (socketService.getConnectionStatus()) {
          socketService.joinMandaditoRoom(user._id);
          setConectado(true);
          console.log('✅ WebSocket configurado correctamente');
        } else {
          console.warn('⚠️ WebSocket no conectado después del timeout');
        }
      }, 2000);
    }

    return () => {
      socketService.disconnect();
      setConectado(false);
    };
  }, [user, navigate]);

  // ✅ CORREGIDO: Función mejorada para obtener ubicación
  const obtenerUbicacion = () => {
    if (!user || !user._id) {
      console.error('❌ Usuario no válido para obtener ubicación');
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const nuevaUbicacion = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUbicacion(nuevaUbicacion);
          
          // ✅ Intentar enviar via WebSocket primero
          const enviadoWebSocket = socketService.updateLocation(
            user._id, 
            nuevaUbicacion.lat, 
            nuevaUbicacion.lng
          );

          // ✅ Backup: Enviar via HTTP si WebSocket falla
          if (!enviadoWebSocket) {
            console.log('🔄 Usando HTTP como backup para ubicación');
            fetch('/api/mandaditos/ubicacion', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                lat: nuevaUbicacion.lat,
                lng: nuevaUbicacion.lng
              })
            })
            .then(response => {
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              return response.json();
            })
            .then(data => {
              console.log('✅ Ubicación enviada via HTTP:', data);
            })
            .catch(error => {
              console.error('❌ Error enviando ubicación HTTP:', error);
            });
          }
        },
        (error) => {
          console.error('❌ Error obteniendo ubicación:', error);
          let mensaje = 'Error obteniendo ubicación: ';
          switch(error.code) {
            case error.PERMISSION_DENIED:
              mensaje += 'Permiso denegado por el usuario';
              break;
            case error.POSITION_UNAVAILABLE:
              mensaje += 'Ubicación no disponible';
              break;
            case error.TIMEOUT:
              mensaje += 'Tiempo de espera agotado';
              break;
            default:
              mensaje += 'Error desconocido';
          }
          console.error(mensaje);
        },
        { 
          enableHighAccuracy: true, 
          timeout: 15000, 
          maximumAge: 0 
        }
      );
    } else {
      console.error('❌ Tu navegador no soporta geolocalización.');
    }
  };

  // ✅ CORREGIDO: Actualizar ubicación periódicamente
  useEffect(() => {
    if (!user || !user._id || !conectado) return;

    obtenerUbicacion();
    const interval = setInterval(obtenerUbicacion, 30000);
    return () => clearInterval(interval);
  }, [user, conectado]);

  // ✅ CORREGIDO: Toggle disponibilidad
  const toggleDisponibilidad = async () => {
    if (!user || !user._id) return;

    try {
      const response = await fetch('/api/mandaditos/estado', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          disponible: !disponible
        })
      });

      if (response.ok) {
        const data = await response.json();
        setDisponible(data.disponible);
        console.log('✅ Estado actualizado:', data.disponible ? 'Disponible' : 'No disponible');
      } else {
        const errorData = await response.json();
        console.error('❌ Error en respuesta del servidor:', errorData);
      }
    } catch (error) {
      console.error('❌ Error cambiando estado:', error);
    }
  };

  // Estados de loading
  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando panel de mandadito...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center">
          <h4>Error de autenticación</h4>
          <p>No se pudo cargar la información del usuario.</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/login')}
          >
            Ir al Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Panel de control */}
        <div className="col-md-3 bg-light vh-100 p-4">
          <div className="text-center mb-4">
            <h3>🛵 Panel Mandadito</h3>
            <p className="text-muted">{user.nombre}</p>
            <div className={`badge ${conectado ? 'bg-success' : 'bg-warning'}`}>
              {conectado ? '✅ Conectado' : '⚠️ Desconectado'}
            </div>
          </div>

          <div className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">Estado de Servicio</h5>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={disponible}
                  onChange={toggleDisponibilidad}
                  disabled={!conectado}
                />
                <label className="form-check-label">
                  {disponible ? '🟢 Disponible' : '🔴 No disponible'}
                </label>
              </div>
              <small className="text-muted">
                {disponible ? 'Aparecerás en el mapa para recibir pedidos' : 'No recibirás nuevos pedidos'}
              </small>
            </div>
          </div>

          <div className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">Información</h5>
              <p><strong>Vehículo:</strong> {user.vehiculo?.tipo || 'No especificado'}</p>
              <p><strong>Teléfono:</strong> {user.telefono || 'No especificado'}</p>
              <p><strong>Calificación:</strong> ⭐ {user.calificacion || 5}</p>
              <p><strong>Servicios:</strong> {user.totalServicios || 0} completados</p>
            </div>
          </div>

          <div className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">Ubicación</h5>
              {ubicacion ? (
                <p className="text-success">
                  📍 Activa<br />
                  <small>
                    Lat: {ubicacion.lat.toFixed(6)}<br />
                    Lng: {ubicacion.lng.toFixed(6)}
                  </small>
                </p>
              ) : (
                <p className="text-warning">📍 Esperando primera ubicación...</p>
              )}
            </div>
          </div>

          <button 
            className="btn btn-primary w-100 mb-2"
            onClick={obtenerUbicacion}
            disabled={!conectado}
          >
            📍 Actualizar Ubicación
          </button>

          <button 
            className="btn btn-outline-secondary w-100"
            onClick={() => navigate('/profile')}
          >
            👤 Ver Perfil Completo
          </button>
        </div>

        {/* Mapa */}
        <div className="col-md-9 p-0">
          <MandaditoMap 
            ubicacionActual={ubicacion}
            disponible={disponible}
            usuario={user}
            conectado={conectado}
          />
        </div>
      </div>
    </div>
  );
};

export default MandaditoDashboard;
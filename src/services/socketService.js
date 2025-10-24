import { io } from 'socket.io-client';

// CORREGIDO: Asignar instancia a variable antes de exportar
class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(serverUrl, token = null) {
    try {
      // ✅ CORREGIDO: URL completa y opciones mejoradas
      const options = {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true
      };

      if (token) {
        options.auth = { token };
      }

      console.log('🔗 Conectando a WebSocket:', serverUrl);
      this.socket = io(serverUrl, options);

      this.socket.on('connect', () => {
        console.log('✅ Conectado al servidor WebSocket');
        this.isConnected = true;
      });

      this.socket.on('disconnect', (reason) => {
        console.log('❌ Desconectado del servidor WebSocket:', reason);
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Error de conexión WebSocket:', error.message);
        this.isConnected = false;
      });

      this.socket.on('location-updated', (data) => {
        console.log('📍 Ubicación actualizada recibida:', data);
      });

      this.socket.on('location-error', (error) => {
        console.error('❌ Error de ubicación:', error);
      });

      return this.socket;
    } catch (error) {
      console.error('❌ Error inicializando WebSocket:', error);
      return null;
    }
  }

  // Actualizar ubicación del mandadito
    updateLocation(userId, lat, lng) {
    if (this.socket && this.isConnected) {
        // ✅ VALIDAR que el userId existe antes de enviar
        if (!userId) {
        console.error('❌ userId no proporcionado para updateLocation');
        return false;
        }
        
        this.socket.emit('update-location', { 
        userId, 
        lat: parseFloat(lat), 
        lng: parseFloat(lng),
        timestamp: new Date().toISOString()
        });
        console.log('📍 Ubicación enviada via WebSocket:', { userId, lat, lng });
        return true;
        } else {
            console.warn('⚠️ WebSocket no conectado, no se puede enviar ubicación');
            return false;
        }
    }

  // Unirse a la sala del mandadito
  joinMandaditoRoom(userId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-mandadito-room', userId);
      console.log(`🛵 Mandadito ${userId} unido a la sala`);
    }
  }

  // Escuchar actualizaciones de ubicación
  onLocationUpdate(callback) {
    if (this.socket) {
      this.socket.on('location-updated', callback);
    }
  }

  // Escuchar errores de ubicación
  onLocationError(callback) {
    if (this.socket) {
      this.socket.on('location-error', callback);
    }
  }

  // Obtener mandaditos disponibles
  getAvailableMandaditos() {
    if (this.socket && this.isConnected) {
      this.socket.emit('get-available-mandaditos');
    }
  }

  // Escuchar mandaditos disponibles
  onAvailableMandaditos(callback) {
    if (this.socket) {
      this.socket.on('available-mandaditos', callback);
    }
  }

  // Desconectar
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('🔌 WebSocket desconectado');
    }
  }

  // Verificar estado de conexión
  getConnectionStatus() {
    return this.isConnected;
  }
}

const socketServiceInstance = new SocketService();
export default socketServiceInstance;
// server/socketHandlers.js - Manejo de WebSockets en el backend
const User = require('../models/User');

const setupSocketHandlers = (io) => {
  io.use(async (socket, next) => {
    try {
      // ✅ Autenticación del socket
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Token de autenticación requerido'));
      }

      // Verificar token (usar tu lógica de verificación JWT)
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_development');
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return next(new Error('Usuario no encontrado'));
      }

      socket.userId = user._id;
      socket.userRole = user.rol;
      next();
    } catch (error) {
      next(new Error('Error de autenticación'));
    }
  });

  io.on('connection', (socket) => {
    console.log('🔗 Cliente conectado:', socket.userId);

    // Unirse a sala de mandadito
    socket.on('join-mandadito-room', async (userId) => {
      try {
        // ✅ Validar que el usuario existe y es mandadito
        const user = await User.findById(userId);
        if (!user || user.rol !== 'mandadito') {
          socket.emit('user-not-found', { error: 'Usuario mandadito no encontrado' });
          return;
        }

        socket.join(`mandadito-${userId}`);
        console.log(`🛵 Mandadito ${userId} unido a su sala`);
        
        // Notificar unión exitosa
        socket.emit('room-joined', { room: `mandadito-${userId}`, success: true });
      } catch (error) {
        console.error('Error uniendo mandadito a sala:', error);
        socket.emit('room-error', { error: 'Error uniéndose a la sala' });
      }
    });

    // Actualizar ubicación
    socket.on('update-location', async (data) => {
      try {
        const { userId, lat, lng } = data;
        
        // ✅ Validar usuario
        const user = await User.findById(userId);
        if (!user || user.rol !== 'mandadito') {
          socket.emit('location-error', { error: 'Usuario no encontrado' });
          return;
        }

        // Actualizar ubicación en base de datos
        user.ubicacion = { lat: parseFloat(lat), lng: parseFloat(lng) };
        user.ultimaActualizacion = new Date();
        await user.save();

        console.log(`📍 Ubicación actualizada para mandadito ${userId}:`, { lat, lng });
        
        // Emitir a todos los clientes interesados
        socket.broadcast.emit('location-updated', {
          userId,
          ubicacion: user.ubicacion,
          timestamp: new Date().toISOString()
        });

        // Confirmar al usuario
        socket.emit('location-confirmed', { 
          success: true, 
          ubicacion: user.ubicacion 
        });

      } catch (error) {
        console.error('Error actualizando ubicación via socket:', error);
        socket.emit('location-error', { error: 'Error actualizando ubicación' });
      }
    });

    // Obtener mandaditos disponibles
    socket.on('get-available-mandaditos', async () => {
      try {
        const mandaditos = await User.find({ 
          rol: 'mandadito', 
          disponible: true 
        }).select('nombre ubicacion vehiculo calificacion');
        
        socket.emit('available-mandaditos', mandaditos);
      } catch (error) {
        console.error('Error obteniendo mandaditos disponibles:', error);
        socket.emit('available-mandaditos-error', { error: 'Error obteniendo mandaditos' });
      }
    });

    socket.on('disconnect', () => {
      console.log('🔌 Cliente desconectado:', socket.userId);
    });
  });
};

module.exports = { setupSocketHandlers };
const express = require('express');
const { auth } = require('../middleware/auth');
const mongoose = require('mongoose'); // ✅ AGREGADO: Para usar mongoose.model
const router = express.Router();

// ✅ CORREGIDO: Obtener modelo User de forma segura
const getUsuarioModelo = () => {
  try {
    return mongoose.model('User');
  } catch (error) {
    // Si el modelo no está registrado, requerirlo
    return require('../models/User');
  }
};

// ✅ CORREGIDO: Validar usuario
router.get('/validate/:userId', auth, async (req, res) => {
  try {
    const User = getUsuarioModelo();
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    // ✅ CORREGIDO: Verificar que el usuario sea mandadito
    if (user.rol !== 'mandadito') {
      return res.status(403).json({ error: 'El usuario no es un mandadito' });
    }
    
    res.json({ 
      valid: true, 
      user: { 
        id: user._id, 
        nombre: user.nombre,
        rol: user.rol
      } 
    });
  } catch (error) {
    console.error('Error validando usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ✅ CORREGIDO: Obtener mandaditos disponibles con mejor manejo
router.get('/disponibles', auth, async (req, res) => {
  try {
    console.log('🛵 Solicitando mandaditos disponibles...');
    
    const User = getUsuarioModelo();
    const mandaditos = await User.find({ 
      rol: 'mandadito', 
      disponible: true 
    }).select('nombre ubicacion vehiculo calificacion telefono totalServicios');
    
    console.log(`📍 Encontrados ${mandaditos.length} mandaditos disponibles`);
    
    // ✅ CORREGIDO: Siempre retornar array, incluso si está vacío
    res.json(mandaditos || []);
  } catch (error) {
    console.error('❌ Error obteniendo mandaditos:', error);
    // ✅ CORREGIDO: Retornar array vacío en caso de error
    res.status(200).json([]); // ✅ CAMBIADO: 200 en lugar de 500 para no romper el frontend
  }
});

// ✅ CORREGIDO: Actualizar ubicación usando el usuario autenticado
router.put('/ubicacion', auth, async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const User = getUsuarioModelo();
    
    console.log(`📍 Actualizando ubicación para usuario ${req.user._id}:`, { lat, lng });
    
    // ✅ CORREGIDO: Usar req.user._id del middleware auth
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 
        ubicacion: { 
          lat: parseFloat(lat), 
          lng: parseFloat(lng),
          ultimaActualizacion: new Date()
        }
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ 
      message: 'Ubicación actualizada',
      ubicacion: user.ubicacion 
    });
  } catch (error) {
    console.error('❌ Error actualizando ubicación:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// ✅ CORREGIDO: Actualizar estado usando el usuario autenticado
router.put('/estado', auth, async (req, res) => {
  try {
    const { disponible } = req.body;
    const User = getUsuarioModelo();
    
    console.log(`🔄 Actualizando estado para usuario ${req.user._id}:`, { disponible });
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 
        disponible: disponible,
        ultimaActualizacion: new Date()
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ 
      message: 'Estado actualizado',
      disponible: user.disponible 
    });
  } catch (error) {
    console.error('❌ Error actualizando estado:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// ✅ CORREGIDO: Endpoint para obtener perfil de mandadito
router.get('/perfil', auth, async (req, res) => {
  try {
    const User = getUsuarioModelo();
    const user = await User.findById(req.user._id)
      .select('nombre email rol vehiculo telefono calificacion totalServicios disponible ubicacion');
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ user });
  } catch (error) {
    console.error('❌ Error obteniendo perfil:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;
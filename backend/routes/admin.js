// routes/admin.js
const express = require('express');
const User = require('../models/User');
const Offer = require('../models/Offer');
const Activity = require('../models/Activity');
const { auth, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// Todas las rutas requieren autenticación y privilegios de administrador
router.use(auth);
router.use(requireAdmin);

// Obtener estadísticas del dashboard
router.get('/stats', async (req, res) => {
  try {
    console.log('📊 Obteniendo estadísticas para admin...');
    
    const [
      totalUsers,
      newUsers,
      totalOffers,
      pendingOffers,
      totalActivities,
      pendingActivities,
      approvedOffers
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({
        createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 30)) }
      }),
      Offer.countDocuments(),
      Offer.countDocuments({ estado: 'pendiente' }),
      Activity.countDocuments(),
      Activity.countDocuments({ estado: 'pendiente' }),
      Offer.find({ estado: 'aprobada' })
    ]);

    // Calcular ingresos (ejemplo simplificado)
    const totalRevenue = approvedOffers.reduce((sum, offer) => {
      return sum + (offer.precioDescuento * offer.participantes);
    }, 0);

    const stats = {
      totalUsers,
      newUsers,
      totalOffers,
      pendingOffers,
      totalActivities,
      pendingActivities,
      totalRevenue: Math.round(totalRevenue)
    };

    console.log('✅ Estadísticas obtenidas:', stats);
    res.json(stats);

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    res.status(500).json({ message: 'Error obteniendo estadísticas' });
  }
});

// Obtener todos los usuarios
router.get('/users', async (req, res) => {
  try {
    console.log('👥 Obteniendo lista de usuarios...');
    
    const users = await User.find()
      .select('-password') // Excluir contraseñas
      .sort({ createdAt: -1 });
    
    console.log(`✅ ${users.length} usuarios obtenidos`);
    res.json(users);
  } catch (error) {
    console.error('❌ Error obteniendo usuarios:', error);
    res.status(500).json({ message: 'Error obteniendo usuarios' });
  }
});

// Obtener todas las ofertas
router.get('/offers', async (req, res) => {
  try {
    console.log('🏷️ Obteniendo todas las ofertas...');
    
    const offers = await Offer.find()
      .populate('creador', 'nombre email')
      .sort({ createdAt: -1 });
    
    console.log(`✅ ${offers.length} ofertas obtenidas`);
    res.json(offers);
  } catch (error) {
    console.error('❌ Error obteniendo ofertas:', error);
    res.status(500).json({ message: 'Error obteniendo ofertas' });
  }
});

// Obtener todas las actividades (para admin)
router.get('/activities', auth, async (req, res) => {
  try {
    if (req.user.rol !== 'administrador') {
      return res.status(403).json({ message: 'Se requieren privilegios de administrador' });
    }

    const activities = await Activity.find()
      .populate('creador', 'nombre empresa')
      .sort({ createdAt: -1 });
    
    res.json(activities);
  } catch (error) {
    console.error('Error al obtener actividades:', error);
    res.status(500).json({ message: 'Error al obtener actividades' });
  }
});

// Obtener todas las ofertas (para admin)
router.get('/offers', auth, async (req, res) => {
  try {
    if (req.user.rol !== 'administrador') {
      return res.status(403).json({ message: 'Se requieren privilegios de administrador' });
    }

    const offers = await Offer.find()
      .populate('creador', 'nombre empresa')
      .sort({ createdAt: -1 });
    
    res.json(offers);
  } catch (error) {
    console.error('Error al obtener ofertas:', error);
    res.status(500).json({ message: 'Error al obtener ofertas' });
  }
});

// Obtener estadísticas del admin
router.get('/stats', auth, async (req, res) => {
  try {
    if (req.user.rol !== 'administrador') {
      return res.status(403).json({ message: 'Se requieren privilegios de administrador' });
    }

    const totalUsers = await User.countDocuments();
    const totalOffers = await Offer.countDocuments({ estado: 'aprobada' });
    const totalActivities = await Activity.countDocuments({ estado: 'aprobada' });
    const pendingOffers = await Offer.countDocuments({ estado: 'pendiente' });
    const pendingActivities = await Activity.countDocuments({ estado: 'pendiente' });

    res.json({
      totalUsers,
      totalOffers,
      totalActivities,
      pendingOffers,
      pendingActivities,
      totalRevenue: 0 // Puedes calcular esto según tu lógica de negocio
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas' });
  }
});

// Obtener ofertas pendientes
router.get('/offers/pending', async (req, res) => {
  try {
    const offers = await Offer.find({ estado: 'pendiente' })
      .populate('creador', 'nombre email empresa')
      .sort({ createdAt: -1 });
    
    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo ofertas pendientes' });
  }
});

// Obtener actividades pendientes
router.get('/activities/pending', async (req, res) => {
  try {
    const activities = await Activity.find({ estado: 'pendiente' })
      .populate('creador', 'nombre email empresa')
      .sort({ createdAt: -1 });
    
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo actividades pendientes' });
  }
});

// Aprobar o rechazar oferta
router.put('/offers/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { action, motivo } = req.body;

    const offer = await Offer.findById(id);
    if (!offer) {
      return res.status(404).json({ message: 'Oferta no encontrada' });
    }

    if (action === 'approve') {
      offer.estado = 'aprobada';
    } else if (action === 'reject') {
      offer.estado = 'rechazada';
      offer.motivoRechazo = motivo;
    }

    await offer.save();
    res.json(offer);
  } catch (error) {
    console.error('Error aprobando/rechazando oferta:', error);
    res.status(500).json({ message: 'Error procesando la solicitud' });
  }
});

// Aprobar o rechazar actividad
router.put('/activities/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { action, motivo } = req.body;

    const activity = await Activity.findById(id);
    if (!activity) {
      return res.status(404).json({ message: 'Actividad no encontrada' });
    }

    if (action === 'approve') {
      activity.estado = 'aprobada';
    } else if (action === 'reject') {
      activity.estado = 'rechazada';
      activity.motivoRechazo = motivo;
    }

    await activity.save();
    res.json(activity);
  } catch (error) {
    console.error('Error aprobando/rechazando actividad:', error);
    res.status(500).json({ message: 'Error procesando la solicitud' });
  }
});

// Eliminar usuario
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // No permitir eliminar el propio usuario admin
    if (id === req.user._id.toString()) {
      return res.status(400).json({ message: 'No puedes eliminar tu propia cuenta' });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(500).json({ message: 'Error eliminando usuario' });
  }
});

// Eliminar oferta
router.delete('/offers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const offer = await Offer.findByIdAndDelete(id);
    
    if (!offer) {
      return res.status(404).json({ message: 'Oferta no encontrada' });
    }

    res.json({ message: 'Oferta eliminada correctamente' });
  } catch (error) {
    console.error('Error eliminando oferta:', error);
    res.status(500).json({ message: 'Error eliminando oferta' });
  }
});

// Eliminar actividad
router.delete('/activities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const activity = await Activity.findByIdAndDelete(id);
    
    if (!activity) {
      return res.status(404).json({ message: 'Actividad no encontrada' });
    }

    res.json({ message: 'Actividad eliminada correctamente' });
  } catch (error) {
    console.error('Error eliminando actividad:', error);
    res.status(500).json({ message: 'Error eliminando actividad' });
  }
});

// Actualizar usuario
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // No permitir cambiar ciertos campos sensibles
    delete updateData.password;
    delete updateData.email;

    const user = await User.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({ message: 'Error actualizando usuario' });
  }
});

module.exports = router;
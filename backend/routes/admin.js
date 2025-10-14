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

// Obtener todas las actividades
router.get('/activities', async (req, res) => {
  try {
    console.log('🎯 Obteniendo todas las actividades...');
    
    const activities = await Activity.find()
      .populate('creador', 'nombre email')
      .sort({ fecha: 1 });
    
    console.log(`✅ ${activities.length} actividades obtenidas`);
    res.json(activities);
  } catch (error) {
    console.error('❌ Error obteniendo actividades:', error);
    res.status(500).json({ message: 'Error obteniendo actividades' });
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

module.exports = router;
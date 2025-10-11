const express = require('express');
const Activity = require('../models/Activity');
const User = require('../models/User'); // ✅ AGREGAR ESTA LÍNEA
const { auth, requireOferenteOrAdmin } = require('../middleware/auth');
const router = express.Router();

// Obtener todas las actividades (público)
router.get('/', async (req, res) => {
  try {
    const activities = await Activity.find({ estado: 'aprobada', activa: true })
      .populate('creador', 'nombre empresa')
      .sort({ fecha: 1 });
    
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener actividades' });
  }
});

// Obtener actividades pendientes de aprobación (solo admin)
router.get('/pending', auth, requireOferenteOrAdmin, async (req, res) => {
  try {
    if (!req.user.isAdmin()) {
      return res.status(403).json({ message: 'Se requieren privilegios de administrador' });
    }

    const activities = await Activity.find({ estado: 'pendiente' })
      .populate('creador', 'nombre empresa email')
      .sort({ createdAt: -1 });
    
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener actividades pendientes' });
  }
});

// Obtener actividades del usuario actual
router.get('/my-activities', auth, requireOferenteOrAdmin, async (req, res) => {
  try {
    const activities = await Activity.find({ creador: req.user._id })
      .sort({ fecha: 1 });
    
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener tus actividades' });
  }
});

// Crear nueva actividad
router.post('/', auth, requireOferenteOrAdmin, async (req, res) => {
  try {
    const activityData = {
      ...req.body,
      creador: req.user._id,
      empresa: req.user.empresa || req.user.nombre
    };

    const activity = new Activity(activityData);
    await activity.save();

    // Agregar actividad al array del usuario
    await User.findByIdAndUpdate(req.user._id, {
      $push: { actividadesCreadas: activity._id }
    });

    res.status(201).json({
      message: 'Actividad creada exitosamente. Esperando aprobación.',
      activity
    });
  } catch (error) {
    res.status(400).json({ message: 'Error al crear actividad', error: error.message });
  }
});

// Aprobar/rechazar actividad (solo admin)
router.patch('/:id/approve', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin()) {
      return res.status(403).json({ message: 'Se requieren privilegios de administrador' });
    }

    const { estado, motivoRechazo } = req.body;
    const activity = await Activity.findByIdAndUpdate(
      req.params.id,
      { estado, motivoRechazo: estado === 'rechazada' ? motivoRechazo : null },
      { new: true }
    ).populate('creador', 'nombre email');

    if (!activity) {
      return res.status(404).json({ message: 'Actividad no encontrada' });
    }

    res.json({ message: `Actividad ${estado}`, activity });
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar actividad' });
  }
});

// Participar en actividad
router.post('/:id/participate', auth, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    
    if (!activity || activity.estado !== 'aprobada' || !activity.activa) {
      return res.status(400).json({ message: 'Actividad no disponible' });
    }

    if (activity.participantes >= activity.maxParticipantes) {
      return res.status(400).json({ message: 'Actividad llena' });
    }

    // Verificar si el usuario ya participa
    const user = await User.findById(req.user._id);
    if (user.participaciones.actividades.includes(activity._id)) {
      return res.status(400).json({ message: 'Ya estás registrado en esta actividad' });
    }

    // Actualizar participantes
    activity.participantes += 1;
    await activity.save();

    // Agregar participación al usuario
    user.participaciones.actividades.push(activity._id);
    await user.save();

    res.json({ message: 'Te has registrado en la actividad exitosamente', activity });
  } catch (error) {
    res.status(400).json({ message: 'Error al registrar en la actividad' });
  }
});

module.exports = router;
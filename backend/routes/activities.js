const express = require('express');
const Activity = require('../models/Activity');
const User = require('../models/User');
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
      empresa: req.user.empresa || req.user.nombre,
      estado: 'pendiente', // ✅ CORREGIDO: Agregar estado por defecto
      activa: true, // ✅ CORREGIDO: Agregar activa por defecto
      participantes: 0 // ✅ CORREGIDO: Inicializar participantes
    };

    const activity = new Activity(activityData);
    await activity.save();

    // ✅ CORREGIDO: Verificar que el campo actividadesCreadas existe antes de agregar
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { actividadesCreadas: activity._id }
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
    
    // ✅ CORREGIDO: Validar estado permitido
    if (!['aprobada', 'rechazada'].includes(estado)) {
      return res.status(400).json({ message: 'Estado no válido' });
    }

    const activity = await Activity.findByIdAndUpdate(
      req.params.id,
      { 
        estado, 
        motivoRechazo: estado === 'rechazada' ? motivoRechazo : null,
        ...(estado === 'aprobada' && { activa: true }) // ✅ Activar si es aprobada
      },
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

    // ✅ CORREGIDO: Verificar si el usuario ya participa de manera segura
    const user = await User.findById(req.user._id);
    const userParticipaciones = user.participaciones?.actividades || [];
    
    if (userParticipaciones.includes(activity._id.toString())) {
      return res.status(400).json({ message: 'Ya estás registrado en esta actividad' });
    }

    // Actualizar participantes
    activity.participantes += 1;
    await activity.save();

    // ✅ CORREGIDO: Agregar participación al usuario de manera segura
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { 
        'participaciones.actividades': activity._id 
      }
    });

    res.json({ message: 'Te has registrado en la actividad exitosamente', activity });
  } catch (error) {
    res.status(400).json({ message: 'Error al registrar en la actividad' });
  }
});

module.exports = router;
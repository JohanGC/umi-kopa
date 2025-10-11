const express = require('express');
const Offer = require('../models/Offer');
const User = require('../models/User'); // ✅ IMPORTANTE: Agregar esta línea
const { auth, requireOferenteOrAdmin } = require('../middleware/auth');
const router = express.Router();

// Obtener todas las ofertas (público)
router.get('/', async (req, res) => {
  try {
    const offers = await Offer.find({ estado: 'aprobada', activa: true })
      .populate('creador', 'nombre empresa')
      .sort({ createdAt: -1 });
    
    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener ofertas' });
  }
});

// Obtener ofertas pendientes de aprobación (solo admin)
router.get('/pending', auth, requireOferenteOrAdmin, async (req, res) => {
  try {
    if (!req.user.isAdmin()) {
      return res.status(403).json({ message: 'Se requieren privilegios de administrador' });
    }

    const offers = await Offer.find({ estado: 'pendiente' })
      .populate('creador', 'nombre empresa email')
      .sort({ createdAt: -1 });
    
    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener ofertas pendientes' });
  }
});

// Obtener ofertas del usuario actual
router.get('/my-offers', auth, requireOferenteOrAdmin, async (req, res) => {
  try {
    const offers = await Offer.find({ creador: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener tus ofertas' });
  }
});

// Crear nueva oferta
router.post('/', auth, requireOferenteOrAdmin, async (req, res) => {
  try {
    const offerData = {
      ...req.body,
      creador: req.user._id,
      empresa: req.user.empresa || req.user.nombre
    };

    const offer = new Offer(offerData);
    await offer.save();

    // Agregar oferta al array del usuario
    await User.findByIdAndUpdate(req.user._id, {
      $push: { ofertasCreadas: offer._id }
    });

    res.status(201).json({
      message: 'Oferta creada exitosamente. Esperando aprobación.',
      offer
    });
  } catch (error) {
    res.status(400).json({ message: 'Error al crear oferta', error: error.message });
  }
});

// Aprobar/rechazar oferta (solo admin)
router.patch('/:id/approve', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin()) {
      return res.status(403).json({ message: 'Se requieren privilegios de administrador' });
    }

    const { estado, motivoRechazo } = req.body;
    const offer = await Offer.findByIdAndUpdate(
      req.params.id,
      { estado, motivoRechazo: estado === 'rechazada' ? motivoRechazo : null },
      { new: true }
    ).populate('creador', 'nombre email');

    if (!offer) {
      return res.status(404).json({ message: 'Oferta no encontrada' });
    }

    res.json({ message: `Oferta ${estado}`, offer });
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar oferta' });
  }
});

// Participar en oferta
router.post('/:id/participate', auth, async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    
    if (!offer || offer.estado !== 'aprobada' || !offer.activa) {
      return res.status(400).json({ message: 'Oferta no disponible' });
    }

    if (offer.participantes >= offer.maxParticipantes) {
      return res.status(400).json({ message: 'Oferta llena' });
    }

    // Verificar si el usuario ya participa
    const user = await User.findById(req.user._id);
    if (user.participaciones.ofertas.includes(offer._id)) {
      return res.status(400).json({ message: 'Ya estás participando en esta oferta' });
    }

    // Actualizar participantes
    offer.participantes += 1;
    await offer.save();

    // Agregar participación al usuario
    user.participaciones.ofertas.push(offer._id);
    await user.save();

    res.json({ message: 'Te has unido a la oferta exitosamente', offer });
  } catch (error) {
    res.status(400).json({ message: 'Error al participar en la oferta' });
  }
});

module.exports = router;
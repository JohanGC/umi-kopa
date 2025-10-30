// routes/orders.js - CORREGIDO COMPLETO
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const { auth } = require('../middleware/auth');  // ← CORREGIDO

// Crear nuevo mandado
router.post('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const orderData = {
      ...req.body,
      usuario: req.user.id,
      nombreUsuario: user.nombre,
      telefono: user.telefono || 'No registrado',
      estado: 'pendiente'
    };

    const order = new Order(orderData);
    await order.save();
    await order.populate('usuario', 'nombre telefono');
    
    res.status(201).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error creando mandado:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener todos los mandados (públicos - pendientes)
router.get('/public', async (req, res) => {
  try {
    const orders = await Order.find({ estado: 'pendiente' })  // ← ELIMINAR: const Order = mongoose.model('Order');
      .populate('usuario', 'nombre telefono')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(orders);
  } catch (error) {
    console.error('Error obteniendo mandados públicos:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener mandados del usuario
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ usuario: req.user.id })  // ← ELIMINAR: const Order = mongoose.model('Order');
      .populate('mandadito', 'nombre telefono vehiculo calificacion')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Error obteniendo mis mandados:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener mandados asignados a un mandadito
router.get('/my-deliveries', auth, async (req, res) => {
  try {
    const orders = await Order.find({ mandadito: req.user.id })  // ← ELIMINAR: const Order = mongoose.model('Order');
      .populate('usuario', 'nombre telefono')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Error obteniendo mis entregas:', error);
    res.status(500).json({ error: error.message });
  }
});

// Aceptar mandado (solo mandaditos)
router.put('/:id/accept', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);  // ← ELIMINAR: const User = mongoose.model('User');
    
    if (user.rol !== 'mandadito') {
      return res.status(403).json({ error: 'Solo los mandaditos pueden aceptar mandados' });
    }

    const order = await Order.findById(req.params.id);  // ← ELIMINAR: const Order = mongoose.model('Order');
    if (!order) {
      return res.status(404).json({ error: 'Mandado no encontrado' });
    }

    if (order.estado !== 'pendiente') {
      return res.status(400).json({ error: 'Este mandado ya no está disponible' });
    }

    order.estado = 'asignado';
    order.mandadito = req.user.id;
    await order.save();

    await order.populate('usuario', 'nombre telefono');
    await order.populate('mandadito', 'nombre telefono vehiculo');

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error aceptando mandado:', error);
    res.status(500).json({ error: error.message });
  }
});

// Actualizar estado del mandado
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { estado } = req.body;
    
    const order = await Order.findById(req.params.id);  // ← ELIMINAR: const Order = mongoose.model('Order');
    if (!order) {
      return res.status(404).json({ error: 'Mandado no encontrado' });
    }

    // Verificar permisos
    if (order.usuario.toString() !== req.user.id && order.mandadito?.toString() !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permisos para modificar este mandado' });
    }

    order.estado = estado;
    await order.save();

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error actualizando estado:', error);
    res.status(500).json({ error: error.message });
  }
});

// Calificar mandado completado
router.put('/:id/rate', auth, async (req, res) => {
  try {
    const { calificacion, comentario } = req.body;
    
    const order = await Order.findById(req.params.id);  // ← ELIMINAR: const Order = mongoose.model('Order');
    if (!order) {
      return res.status(404).json({ error: 'Mandado no encontrado' });
    }

    if (order.usuario.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Solo el solicitante puede calificar' });
    }

    if (order.estado !== 'completado') {
      return res.status(400).json({ error: 'Solo se pueden calificar mandados completados' });
    }

    order.calificacion = calificacion;
    order.comentario = comentario;
    await order.save();

    // Actualizar calificación del mandadito
    if (order.mandadito) {
      const mandaditoOrders = await Order.find({ 
        mandadito: order.mandadito, 
        calificacion: { $exists: true } 
      });
      
      const promedio = mandaditoOrders.reduce((sum, o) => sum + o.calificacion, 0) / mandaditoOrders.length;
      
      await User.findByIdAndUpdate(order.mandadito, {  // ← ELIMINAR: const User = mongoose.model('User');
        calificacion: Math.round(promedio * 10) / 10
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error calificando mandado:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();

// Obtener todas las actividades
router.get('/', (req, res) => {
  try {
    // Simular datos de actividades
    const activities = [
      {
        id: 1,
        action: 'offer_created',
        description: 'Se creó una nueva oferta',
        userId: 1,
        timestamp: new Date()
      },
      {
        id: 2,
        action: 'user_registered',
        description: 'Nuevo usuario registrado',
        userId: 2,
        timestamp: new Date()
      }
    ];
    
    res.json({
      success: true,
      activities,
      count: activities.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener actividades',
      error: error.message
    });
  }
});

// Crear nueva actividad
router.post('/', (req, res) => {
  try {
    const { action, description, userId } = req.body;
    
    if (!action || !description) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: action, description'
      });
    }
    
    // Simular creación de actividad
    const newActivity = {
      id: Date.now(),
      action,
      description,
      userId: userId || 1,
      timestamp: new Date()
    };
    
    res.status(201).json({
      success: true,
      message: 'Actividad registrada exitosamente',
      activity: newActivity
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear actividad',
      error: error.message
    });
  }
});

module.exports = router;
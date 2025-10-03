const express = require('express');
const router = express.Router();

// Obtener todas las ofertas
router.get('/', (req, res) => {
  try {
    // Simular datos de ofertas
    const offers = [
      {
        id: 1,
        title: 'Oferta de prueba 1',
        description: 'Descripción de la oferta 1',
        price: 100,
        category: 'tecnologia',
        createdAt: new Date()
      },
      {
        id: 2,
        title: 'Oferta de prueba 2',
        description: 'Descripción de la oferta 2',
        price: 200,
        category: 'hogar',
        createdAt: new Date()
      }
    ];
    
    res.json({ 
      success: true, 
      offers,
      count: offers.length 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener ofertas',
      error: error.message 
    });
  }
});

// Crear nueva oferta
router.post('/', (req, res) => {
  try {
    const { title, description, price, category } = req.body;
    
    // Validar datos requeridos
    if (!title || !description || !price) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: title, description, price'
      });
    }
    
    // Simular creación de oferta
    const newOffer = {
      id: Date.now(),
      title,
      description,
      price,
      category: category || 'general',
      createdAt: new Date()
    };
    
    res.status(201).json({
      success: true,
      message: 'Oferta creada exitosamente',
      offer: newOffer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear oferta',
      error: error.message
    });
  }
});

// Obtener oferta por ID
router.get('/:id', (req, res) => {
  try {
    const offerId = req.params.id;
    
    // Simular búsqueda de oferta
    const offer = {
      id: offerId,
      title: `Oferta ${offerId}`,
      description: `Descripción de la oferta ${offerId}`,
      price: 150,
      category: 'general',
      createdAt: new Date()
    };
    
    res.json({
      success: true,
      offer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener oferta',
      error: error.message
    });
  }
});

module.exports = router;
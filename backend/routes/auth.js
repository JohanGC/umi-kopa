const express = require('express');
const router = express.Router();

// Ruta de registro de usuario
router.post('/register', (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Aquí iría la lógica de registro
    console.log('Intentando registrar usuario:', { email, name });
    
    res.status(201).json({ 
      success: true, 
      message: 'Usuario registrado exitosamente',
      user: { email, name }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error en el registro',
      error: error.message 
    });
  }
});

// Ruta de login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Aquí iría la lógica de autenticación
    console.log('Intentando login:', email);
    
    res.json({ 
      success: true, 
      message: 'Login exitoso',
      token: 'jwt-token-simulado',
      user: { email, name: 'Usuario Demo' }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error en el login',
      error: error.message 
    });
  }
});

// Ruta para obtener perfil de usuario
router.get('/profile', (req, res) => {
  res.json({ 
    success: true, 
    user: { 
      name: 'Usuario Demo', 
      email: 'demo@email.com',
      role: 'user'
    }
  });
});

module.exports = router;
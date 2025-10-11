const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Middleware de logging para debugging
router.use((req, res, next) => {
  console.log(`🔐 Auth Route: ${req.method} ${req.path}`);
  next();
});

// Registro de usuario - MEJORADO
router.post('/register', async (req, res) => {
  try {
    console.log('📝 Intentando registrar usuario:', req.body.email);

    const { nombre, email, password, rol, telefono, empresa, direccion } = req.body;

    // Validaciones básicas
    if (!nombre || !email || !password) {
      return res.status(400).json({ 
        message: 'Nombre, email y password son requeridos' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'La contraseña debe tener al menos 6 caracteres' 
      });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ Usuario ya existe:', email);
      return res.status(400).json({ 
        message: 'El usuario ya existe' 
      });
    }

    // Validar campos requeridos según el rol
    if (rol === 'oferente') {
      if (!telefono || !empresa || !direccion) {
        return res.status(400).json({ 
          message: 'Los campos teléfono, empresa y dirección son requeridos para oferentes' 
        });
      }
    }

    // Crear nuevo usuario
    const userData = { 
      nombre, 
      email, 
      password, 
      rol: rol || 'usuario' 
    };

    // Agregar campos específicos para oferentes
    if (rol === 'oferente') {
      userData.telefono = telefono;
      userData.empresa = empresa;
      userData.direccion = direccion;
    }

    const user = new User(userData);
    await user.save();

    console.log('✅ Usuario registrado exitosamente:', user.email);

    // Generar token
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET || 'fallback_secret_development',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      token,
      user: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        empresa: user.empresa,
        verificada: user.verificada
      }
    });

  } catch (error) {
    console.error('❌ Error en registro:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Error de validación',
        errors 
      });
    }

    res.status(500).json({ 
      message: 'Error interno del servidor',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
});

// Login de usuario - MEJORADO
router.post('/login', async (req, res) => {
  try {
    console.log('🔑 Intentando login:', req.body.email);

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email y password son requeridos' 
      });
    }

    // Buscar usuario
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ Usuario no encontrado:', email);
      return res.status(400).json({ 
        message: 'Credenciales inválidas' 
      });
    }

    // Verificar password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      console.log('❌ Password incorrecto para:', email);
      return res.status(400).json({ 
        message: 'Credenciales inválidas' 
      });
    }

    console.log('✅ Login exitoso:', user.email);

    // Generar token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback_secret_development',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        empresa: user.empresa,
        verificada: user.verificada
      }
    });

  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
});

// Verificar token
router.get('/verify', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        message: 'Token requerido' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ 
        message: 'Token inválido' 
      });
    }

    res.json({
      user: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        empresa: user.empresa,
        verificada: user.verificada
      }
    });

  } catch (error) {
    console.error('❌ Error verificando token:', error);
    res.status(401).json({ 
      message: 'Token inválido' 
    });
  }
});

module.exports = router;
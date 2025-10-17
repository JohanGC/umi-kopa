const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Acceso denegado. Token requerido.' });
    }

    // ✅ CORREGIDO: Usar fallback para JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_development');
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Token inválido.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Error en middleware auth:', error);
    
    // ✅ CORREGIDO: Manejo específico de errores JWT
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token inválido.' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado.' });
    }
    
    res.status(500).json({ message: 'Error de autenticación.' });
  }
};

// ✅ CORREGIDO: Funciones de verificación de roles más robustas
const requireAdmin = (req, res, next) => {
  // Verificar si el usuario es administrador
  if (req.user.rol !== 'administrador') {
    return res.status(403).json({ message: 'Acceso denegado. Se requieren privilegios de administrador.' });
  }
  next();
};

const requireOferente = (req, res, next) => {
  // Verificar si el usuario es oferente o administrador
  if (req.user.rol !== 'oferente' && req.user.rol !== 'administrador') {
    return res.status(403).json({ message: 'Acceso denegado. Se requieren privilegios de oferente.' });
  }
  next();
};

const requireOferenteOrAdmin = (req, res, next) => {
  // Verificar si el usuario es oferente o administrador
  if (req.user.rol !== 'oferente' && req.user.rol !== 'administrador') {
    return res.status(403).json({ message: 'Acceso denegado. Se requieren privilegios de oferente o administrador.' });
  }
  next();
};

module.exports = {
  auth,
  requireAdmin,
  requireOferente,
  requireOferenteOrAdmin
};
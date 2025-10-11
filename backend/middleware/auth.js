const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Acceso denegado. Token requerido.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Token inválido.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido.' });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user.isAdmin()) {
    return res.status(403).json({ message: 'Acceso denegado. Se requieren privilegios de administrador.' });
  }
  next();
};

const requireOferente = (req, res, next) => {
  if (!req.user.isOferente() && !req.user.isAdmin()) {
    return res.status(403).json({ message: 'Acceso denegado. Se requieren privilegios de oferente.' });
  }
  next();
};

const requireOferenteOrAdmin = (req, res, next) => {
  if (!req.user.isOferente() && !req.user.isAdmin()) {
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
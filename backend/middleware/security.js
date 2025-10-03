const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Configuración de seguridad
const securityMiddleware = (app) => {
  // Helmet para headers de seguridad
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // límite de 100 requests por ventana
    message: {
      error: 'Demasiadas solicitudes desde esta IP, intenta nuevamente en 15 minutos.'
    }
  });

  app.use('/api/', limiter);

  // Prevenir MIME type sniffing
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
  });
};

module.exports = securityMiddleware;
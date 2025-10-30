const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ✅ 1. CORS SIMPLIFICADO TEMPORALMENTE
app.use(cors({
  origin: 'http://localhost:3000', // URL de tu frontend
  credentials: true
}));

// ✅ 2. MIDDLEWARE DE BODY-PARSING PRIMERO
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/admin', require('./routes/admin'));

// ✅ 3. MIDDLEWARE DE LOGGING
app.use((req, res, next) => {
  console.log(`\n📨 ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  if (Object.keys(req.body).length > 0) {
    console.log('📦 Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ofertasapp')
  .then(() => console.log('✅ MongoDB Conectado'))
  .catch(err => console.error('❌ Error MongoDB:', err));

// ✅ 4. RUTA DE PRUEBA
app.post('/api/debug', (req, res) => {
  console.log('🔍 DEBUG - Datos completos:');
  console.log('  Headers:', req.headers);
  console.log('  Body:', req.body);
  console.log('  Method:', req.method);
  
  res.json({
    message: 'Debug endpoint',
    received: {
      body: req.body,
      headers: req.headers,
      method: req.method
    }
  });
});

const orderRoutes = require('./routes/orders');
app.use('/api/orders', orderRoutes);

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/offers', require('./routes/offers'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/admin', require('./routes/admin')); // ✅ Si tienes rutas de admin

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('❌ Error del servidor:', err);
  res.status(500).json({ message: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor ejecutándose en http://localhost:${PORT}`);
  console.log('📍 Entorno:', process.env.NODE_ENV || 'development');
  console.log('⏰ Iniciado:', new Date().toISOString());
});
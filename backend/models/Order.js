// models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  nombreUsuario: {
    type: String,
    required: true
  },
  telefono: {
    type: String,
    required: true
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción del mandado es requerida'],
    trim: true,
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  },
  precioOfertado: {
    type: Number,
    required: [true, 'El precio ofertado es requerido'],
    min: [1000, 'El precio mínimo es $1.000']
  },
  estado: {
    type: String,
    enum: ['pendiente', 'asignado', 'en_proceso', 'completado', 'cancelado'],
    default: 'pendiente'
  },
  mandadito: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  ubicacionRecogida: {
    direccion: String,
    lat: Number,
    lng: Number
  },
  ubicacionEntrega: {
    direccion: String,
    lat: Number,
    lng: Number
  },
  fechaLimite: Date,
  categoria: {
    type: String,
    enum: ['comida', 'mercado', 'farmacia', 'paqueteria', 'documentos', 'otros'],
    default: 'otros'
  },
  notasAdicionales: String,
  calificacion: {
    type: Number,
    min: 1,
    max: 5
  },
  comentario: String
}, {
  timestamps: true
});

// Índices para búsquedas eficientes
orderSchema.index({ estado: 1, createdAt: -1 });
orderSchema.index({ usuario: 1 });
orderSchema.index({ mandadito: 1 });

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
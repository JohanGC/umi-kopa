const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true
  },
  descripcion: {
    type: String,
    required: true
  },
  descuento: {
    type: String,
    required: true
  },
  categoria: {
    type: String,
    required: true,
    enum: ['temporada', 'nocturna', 'fin-de-semana', 'flash', 'exclusiva', 'early-bird']
  },
  imagen: {
    type: String,
    default: '🏷️'
  },
  participantes: {
    type: Number,
    default: 0
  },
  maxParticipantes: {
    type: Number,
    required: true
  },
  precioOriginal: {
    type: Number,
    required: true
  },
  precioDescuento: {
    type: Number,
    required: true
  },
  fechaInicio: {
    type: Date,
    required: true
  },
  fechaFin: {
    type: Date,
    required: true
  },
  condiciones: {
    type: String,
    default: ''
  },
  tipoOferta: {
    type: String,
    enum: ['general', 'exclusiva', 'flash'],
    default: 'general'
  },
  activa: {
    type: Boolean,
    default: true
  },
  creador: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  empresa: {
    type: String,
    required: true
  },
  estado: {
    type: String,
    enum: ['pendiente', 'aprobada', 'rechazada'],
    default: 'pendiente'
  },
  motivoRechazo: {
    type: String
  }
}, {
  timestamps: true
});

// ✅ CORREGIDO: Calcular precio con descuento automáticamente
offerSchema.pre('save', function(next) {
  if (this.isModified('descuento') || this.isModified('precioOriginal')) {
    const descuento = parseInt(this.descuento) || 0;
    this.precioDescuento = this.precioOriginal * (1 - descuento / 100);
  }
  next();
});

// ✅ CORREGIDO: Verificar si el modelo ya existe antes de compilar
module.exports = mongoose.models.Offer || mongoose.model('Offer', offerSchema);
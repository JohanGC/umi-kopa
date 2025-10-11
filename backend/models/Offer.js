const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
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
    enum: ['taller', 'tour', 'clase', 'evento', 'conferencia']
  },
  imagen: {
    type: String,
    default: '🎯'
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
  fecha: {
    type: Date,
    required: true
  },
  hora: {
    type: String,
    required: true
  },
  duracion: {
    type: String,
    required: true
  },
  ubicacion: {
    type: String,
    required: true
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
  requisitos: [String],
  estado: {
    type: String,
    enum: ['pendiente', 'aprobada', 'rechazada', 'completada'],
    default: 'pendiente'
  },
  motivoRechazo: {
    type: String
  }
}, {
  timestamps: true
});

activitySchema.pre('save', function(next) {
  if (this.isModified('descuento') || this.isModified('precioOriginal')) {
    const descuento = parseInt(this.descuento) || 0;
    this.precioDescuento = this.precioOriginal * (1 - descuento / 100);
  }
  next();
});

module.exports = mongoose.model('Activity', activitySchema);
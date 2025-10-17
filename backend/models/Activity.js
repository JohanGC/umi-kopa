const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descripcion: { type: String, required: true },
  categoria: { type: String, required: true },
  precioOriginal: { type: Number, required: true },
  precioDescuento: { type: Number, required: true },
  descuento: { type: Number, required: true },
  maxParticipantes: { type: Number, required: true },
  participantes: { type: Number, default: 0 },
  fecha: { type: Date, required: true },
  hora: String,
  duracion: String,
  ubicacion: { type: String, required: true },
  requisitos: String,
  imagen: String,
  estado: { type: String, enum: ['pendiente', 'aprobada', 'rechazada'], default: 'pendiente' },
  activa: { type: Boolean, default: true },
  creador: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  empresa: String,
  motivoRechazo: String
}, {
  timestamps: true
});

// ✅ CORREGIDO: Verificar si el modelo ya existe antes de compilar
module.exports = mongoose.models.Activity || mongoose.model('Activity', activitySchema);
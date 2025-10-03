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
    enum: ['temporada', 'nocturna', 'fin-de-semana', 'flash']
  },
  imagen: {
    type: String,
    default: '🌞'
  },
  participantes: {
    type: Number,
    default: 0
  },
  maxParticipantes: {
    type: Number,
    required: true
  },
  activa: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Offer', offerSchema);
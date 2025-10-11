const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
  },
  rol: {
    type: String,
    enum: ['usuario', 'oferente', 'administrador'],
    default: 'usuario'
  },
  telefono: {
    type: String,
    default: '' // ✅ Cambiar a opcional con valor por defecto
  },
  empresa: {
    type: String,
    default: '' // ✅ Cambiar a opcional con valor por defecto
  },
  direccion: {
    type: String,
    default: '' // ✅ Cambiar a opcional con valor por defecto
  },
  verificada: {
    type: Boolean,
    default: false
  },
  participaciones: {
    ofertas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Offer' }],
    actividades: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Activity' }]
  },
  favoritos: [{
    itemId: { type: mongoose.Schema.Types.ObjectId, refPath: 'favoritos.itemType' },
    itemType: { type: String, enum: ['Offer', 'Activity'] },
    fecha: { type: Date, default: Date.now }
  }],
  ofertasCreadas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Offer' }],
  actividadesCreadas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Activity' }]
}, {
  timestamps: true
});

// Hash password antes de guardar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Comparar password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Verificar si es administrador
userSchema.methods.isAdmin = function() {
  return this.rol === 'administrador';
};

// Verificar si es oferente
userSchema.methods.isOferente = function() {
  return this.rol === 'oferente';
};

module.exports = mongoose.model('User', userSchema);
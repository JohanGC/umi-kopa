const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  participaciones: {
    ofertas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Offer' }],
    actividades: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Activity' }]
  },
  favoritos: [{
    itemId: { type: mongoose.Schema.Types.ObjectId, refPath: 'favoritos.itemType' },
    itemType: { type: String, enum: ['Offer', 'Activity'] },
    fecha: { type: Date, default: Date.now }
  }]
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

module.exports = mongoose.model('User', userSchema);
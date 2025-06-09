const mongoose = require('mongoose');

const reaccionSchema = new mongoose.Schema({
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  tipo: { type: String, enum: ['like', 'love', 'haha', 'wow', 'sad', 'angry'], required: true }
});

const comentarioSchema = new mongoose.Schema({
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  texto: { type: String, required: true },
  fecha: { type: Date, default: Date.now }
});

const publicacionSchema = new mongoose.Schema({
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  texto: { type: String, required: false },
  multimedia: [{
    url: { type: String, required: true },
    tipo: { type: String, enum: ['imagen', 'video'], required: true },
     eliminado: { type: Boolean, default: false }
    
  }],
  ubicacion: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], required: false }
  },
  direccion: { type: String, required: false },
  menciones: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }],
  reacciones: [reaccionSchema],
  comentarios: [comentarioSchema],
  fecha: { type: Date, default: Date.now }
});

publicacionSchema.index({ ubicacion: '2dsphere' });

module.exports = mongoose.model('Publicacion', publicacionSchema, 'Publicaciones');
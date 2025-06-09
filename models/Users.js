const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true
  },
  correoTelefono: {
    type: String,
    required: true,
    unique: true
  },
  contraseña: {
    type: String,
    required: true
  },
  carrera: String,
  imagenPerfil: String,
  amigos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  }],
  solicitudesAmistad: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Usuario', usuarioSchema, 'Usuarios');
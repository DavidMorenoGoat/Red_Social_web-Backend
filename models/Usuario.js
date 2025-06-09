const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nombre: String,
  correoTelefono: String,
  contraseña: String,
  carrera: String,
  // descripcion: String,
  imagenPerfil: String
});

module.exports = mongoose.model('Usuario', usuarioSchema, 'Usuarios');


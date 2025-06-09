const express = require('express');
const router = express.Router();
const Publicacion = require('../models/Publicacion');
const verificarToken = require('../middleware/auths');
const upload = require('../middleware/multer');
const fs = require('fs');
const path = require('path');

// Crear una nueva publicación
router.post('/', verificarToken, upload.array('multimedia', 10), async (req, res) => {
  try {
    const { texto, ubicacion, direccion, menciones } = req.body;
    
    // Procesar archivos multimedia
    const multimedia = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        const tipo = file.mimetype.startsWith('image/') ? 'imagen' : 'video';
        multimedia.push({
          url: `/uploads/${file.filename}`,
          tipo: tipo
        });
      });
    }

    // Procesar ubicación si existe
    let ubicacionObj = null;
    if (ubicacion) {
      const [lat, lng] = ubicacion.split(',').map(Number);
      ubicacionObj = {
        type: 'Point',
        coordinates: [lng, lat] // MongoDB usa [longitud, latitud]
      };
    }

    const nuevaPublicacion = new Publicacion({
      usuarioId: req.userId,
      texto,
      multimedia,
      ubicacion: ubicacionObj,
      direccion,
      menciones: menciones ? JSON.parse(menciones) : []
    });

    await nuevaPublicacion.save();
    res.status(201).json(nuevaPublicacion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al crear la publicación', error });
  }
});

// Obtener publicaciones del usuario y sus amigos (implementarás amigos después)
router.get('/', verificarToken, async (req, res) => {
  try {
    const publicaciones = await Publicacion.find({ usuarioId: req.userId })
      .populate('usuarioId', 'nombre imagenPerfil')
      .populate('menciones', 'nombre imagenPerfil')
      .populate('comentarios.usuarioId', 'nombre imagenPerfil')
      .sort({ fecha: -1 });
    
    res.json(publicaciones);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener publicaciones', error });
  }
});
    
    /* 
    // FUTURO: Cuando tengas amigos, esto debería ser algo como:
    const usuario = await Usuario.findById(req.userId);
    const idsAmigos = usuario.amigos; // Asumiendo que tendrás un campo 'amigos' en el modelo Usuario
    
    const publicaciones = await Publicacion.find({
      $or: [
        { usuarioId: req.userId },
        { usuarioId: { $in: idsAmigos } }
      ]
    })
    .populate('usuarioId', 'nombre imagenPerfil')
    .populate('menciones', 'nombre imagenPerfil')
    .sort({ fecha: -1 });
    
    res.json(publicaciones);
    */

// Añadir reacción a una publicación
router.post('/:id/reaccionar', verificarToken, async (req, res) => {
  try {
    const { tipo } = req.body;
    
    // Primero elimina cualquier reacción previa del usuario
    await Publicacion.updateOne(
      { _id: req.params.id },
      { $pull: { reacciones: { usuarioId: req.userId } } }
    );
    
    // Añade la nueva reacción
    const publicacion = await Publicacion.findByIdAndUpdate(
      req.params.id,
      { $push: { reacciones: { usuarioId: req.userId, tipo } } },
      { new: true }
    );
    
    res.json(publicacion);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al reaccionar', error });
  }
});

// Añadir comentario a una publicación
router.post('/:id/comentar', verificarToken, async (req, res) => {
  try {
    const { texto } = req.body;
    
    let publicacion = await Publicacion.findByIdAndUpdate(
      req.params.id,
      { $push: { comentarios: { usuarioId: req.userId, texto } } },
      { new: true }
    ).populate('comentarios.usuarioId', 'nombre imagenPerfil');
    
    // Obtener el último comentario añadido
    const nuevoComentario = publicacion.comentarios[publicacion.comentarios.length - 1];
    res.json(nuevoComentario);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al comentar', error });
  }
});

router.delete('/:id', verificarToken, async (req, res) => {
  try {
    // Verificar que la publicación pertenece al usuario
    const publicacion = await Publicacion.findOne({
      _id: req.params.id,
      usuarioId: req.userId
    });

    if (!publicacion) {
      return res.status(404).json({ mensaje: 'Publicación no encontrada o no autorizado' });
    }

    // Eliminar archivos multimedia asociados
    publicacion.multimedia.forEach(media => {
      const filePath = path.join(__dirname, '..', 'uploads', path.basename(media.url));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    // Eliminar la publicación de la base de datos
    await Publicacion.deleteOne({ _id: req.params.id });

    res.json({ mensaje: 'Publicación eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar publicación:', error);
    res.status(500).json({ mensaje: 'Error al eliminar la publicación', error: error.message });
  }
});

module.exports = router;
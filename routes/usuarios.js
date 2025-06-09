const express = require('express');
const router = express.Router();
const Usuario = require('../models/Users');

// Buscar usuarios
router.get('/buscar', async (req, res) => {
  try {
    const termino = req.query.termino;
    const usuarios = await Usuario.find({
      $or: [
        { nombre: { $regex: termino, $options: 'i' } },
        { correoTelefono: { $regex: termino, $options: 'i' } }
      ]
    }).select('nombre imagenPerfil carrera');

    res.json(usuarios);
  } catch (error) {
    console.error('Error al buscar usuarios:', error);
    res.status(500).json({ error: 'Error al buscar usuarios' });
  }
});

// Enviar solicitud de amistad
router.post('/solicitud-amistad', async (req, res) => {
  try {
    const { remitenteId, destinatarioId } = req.body;

    // Verificar si ya son amigos o existe solicitud
    const destinatario = await Usuario.findById(destinatarioId);
    if (destinatario.amigos.includes(remitenteId)) {
      return res.status(400).json({ error: 'Ya son amigos' });
    }
    if (destinatario.solicitudesAmistad.includes(remitenteId)) {
      return res.status(400).json({ error: 'Solicitud ya enviada' });
    }

    // Agregar solicitud
    await Usuario.findByIdAndUpdate(destinatarioId, {
      $push: { solicitudesAmistad: remitenteId }
    });

    res.json({ mensaje: 'Solicitud de amistad enviada' });
  } catch (error) {
    console.error('Error al enviar solicitud:', error);
    res.status(500).json({ error: 'Error al enviar solicitud' });
  }
});

// Aceptar solicitud de amistad
router.post('/aceptar-amistad', async (req, res) => {
  try {
    const { usuarioId, solicitanteId } = req.body;

    // Verificar si la solicitud existe
    const usuario = await Usuario.findById(usuarioId);
    if (!usuario.solicitudesAmistad.includes(solicitanteId)) {
      return res.status(400).json({ error: 'Solicitud no encontrada' });
    }

    // Actualizar ambos usuarios
    await Promise.all([
      Usuario.findByIdAndUpdate(usuarioId, {
        $pull: { solicitudesAmistad: solicitanteId },
        $push: { amigos: solicitanteId }
      }),
      Usuario.findByIdAndUpdate(solicitanteId, {
        $push: { amigos: usuarioId }
      })
    ]);

    res.json({ mensaje: 'Solicitud de amistad aceptada' });
  } catch (error) {
    console.error('Error al aceptar solicitud:', error);
    res.status(500).json({ error: 'Error al aceptar solicitud' });
  }
});

module.exports = router;
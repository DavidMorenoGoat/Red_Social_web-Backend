// const upload = require('../middlewares/multer');
// const multerMiddleware = upload.single('imagenPerfil');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET;

const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');



// Registro
router.post('/register', async (req, res) => {
  const { nombre, correoTelefono, contraseña, carrera, imagenPerfil } = req.body;

  try {
    const usuarioExistente = await Usuario.findOne({ correoTelefono });
    if (usuarioExistente) {
      return res.status(400).json({ mensaje: 'Este correo o número ya está registrado' });
    }

    const salt = await bcrypt.genSalt(10);
    const contraseñaEncriptada = await bcrypt.hash(contraseña, salt);

    const nuevoUsuario = new Usuario({
      nombre,
      correoTelefono,
      contraseña: contraseñaEncriptada,
      carrera,
      imagenPerfil
    });

    await nuevoUsuario.save();
    res.status(201).json({ mensaje: 'Usuario registrado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error del servidor', error });
  }
});


// Login con JWT
router.post('/login', async (req, res) => {
  const { correoTelefono, contraseña } = req.body;

  try {
    const usuario = await Usuario.findOne({ correoTelefono });
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const contraseñaValida = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!contraseñaValida) {
      return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
    }

    // ✅ Generar token con el ID del usuario
    const token = jwt.sign({ id: usuario._id }, SECRET_KEY, { expiresIn: '2h' });

    res.status(200).json({
      mensaje: 'Inicio de sesión exitoso',
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        carrera: usuario.carrera,
        imagenPerfil: usuario.imagenPerfil
      }
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error del servidor', error });
  }
});

 

const verificarToken = require('../middleware/auths');

router.get('/perfil', verificarToken, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.userId).select('-contraseña');
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener el perfil', error });
  }
});




module.exports = router;

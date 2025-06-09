require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Inicializar configuración
dotenv.config();

// ✅ Crear la aplicación antes de usarla
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estaticos
app.use(express.static('public')); // Si tienes archivos estáticos en una carpeta public
app.use('/uploads', express.static('uploads')); // Para servir archivos subidos

// Rutas
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Publicaciones rutas
const publicacionRoutes = require('./routes/publicaciones');
app.use('/api/publicaciones', publicacionRoutes);

// Servir archivos estáticos desde la carpeta uploads
app.use('/uploads', express.static('uploads'));

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Conectado a MongoDB Atlas'))
.catch(err => console.error('❌ Error al conectar a MongoDB:', err));

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en el puerto ${PORT}`));



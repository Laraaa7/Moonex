require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');

const setupChat = require('./chat');
const registerRoutes = require('./register');
const loginRoutes = require('./login');
const updateProfileRoutes = require('./updateProfile');
const postRoutes = require('./post');
const previewRoutes = require('./linkPreview');
const likesRoutes = require('./likes');
const socialRoutes = require('./social');
const conversacionesRoutes = require('./conversaciones');
const busquedaRouter = require("./busqueda");
const respuestasRoutes = require('./respuestas');
const notificacionesRoutes = require('./notificaciones');
const verifyEmailRoute = require('./verifyEmail');

const app = express();
const server = http.createServer(app);

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 🟢 En producción, servir el frontend desde /build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// 📦 Rutas API
app.use('/api/register', registerRoutes);
app.use('/login', loginRoutes);
app.use('/verify-email', verifyEmailRoute);
app.use('/usuarios', updateProfileRoutes);
app.use('/', updateProfileRoutes);
app.use('/likes', likesRoutes);
app.use('/social', socialRoutes);
app.use('/', postRoutes);
app.use('/', previewRoutes);
app.use('/api/conversaciones', conversacionesRoutes);
app.use("/api/busqueda", busquedaRouter);
app.use('/respuestas', respuestasRoutes);
app.use('/api/notificaciones', notificacionesRoutes);

// Ruta base de prueba
app.get('/api', (req, res) => {
  res.send('Servidor funcionando');
});

if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// WebSocket
setupChat(server);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

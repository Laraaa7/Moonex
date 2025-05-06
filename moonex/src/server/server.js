require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
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


const app = express();
const server = http.createServer(app);

// Configurar CORS y middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Ruta principal
app.get("/", (req, res) => {
  res.send("Servidor funcionando");
});

// Incluir rutas existentes
app.use('/api/register', registerRoutes);
app.use('/login', loginRoutes);
app.use('/', updateProfileRoutes);
app.use('/usuarios', updateProfileRoutes);
app.use('/likes', likesRoutes);
app.use('/social', socialRoutes);
app.use('/', postRoutes);
app.use('/', previewRoutes);
app.use('/api/conversaciones', conversacionesRoutes);
app.use("/api/busqueda", busquedaRouter);

// Configurar WebSocket
setupChat(server);

// Iniciar el servidor
server.listen(5000, () => {
  console.log("Servidor corriendo en http://localhost:5000");
}); 
// server/server.js

require('dotenv').config(); // Cargar las variables de entorno

const express = require('express');
const http = require('http');
const cors = require('cors');
const setupChat = require('./chat'); // Importa la lógica del chat

const app = express();
const server = http.createServer(app);

// Configurar CORS y middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get("/", (req, res) => {
  res.send("Servidor funcionando");
});

// Configurar WebSocket
setupChat(server);

// Iniciar el servidor
server.listen(5000, () => {
  console.log("🚀 Servidor corriendo en http://localhost:5000");
});

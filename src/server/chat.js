// server/chat.js

const { Server } = require('socket.io');
const db = require('./db'); // Importa la conexión a la base de datos

const setupChat = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.on('connection', (socket) => {
    console.log(`Cliente conectado: ${socket.id}`);

    // Enviar todos los mensajes al conectarse
    db.query("SELECT * FROM mensajes ORDER BY fecha_envio ASC", (err, results) => {
      if (err) {
        console.error("Error al obtener mensajes:", err.message);
        return;
      }
      socket.emit('chat history', results);
    });

    // Recibir nuevo mensaje
    socket.on('new message', (message) => {
      console.log("Mensaje recibido");

      // Guardar el mensaje en la base de datos
      const query = `
        INSERT INTO mensajes (emisor_id, receptor_id, contenido, imagen, fecha_envio)
        VALUES (?, ?, ?, ?, ?)
      `;
      const values = [
        message.emisor_id,
        message.receptor_id,
        message.contenido,
        message.imagen, // Guardamos la imagen en base64
        new Date()
      ];

      db.query(query, values, (err) => {
        if (err) {
          console.error("Error al guardar el mensaje:", err.message);
          return;
        }
        console.log("Mensaje guardado en la base de datos");

        // Emitir el mensaje a todos los clientes
        io.emit('new message', message);
      });
    });

    socket.on('disconnect', () => {
      console.log(`Cliente desconectado: ${socket.id}`);
    });
  });
};

module.exports = setupChat;

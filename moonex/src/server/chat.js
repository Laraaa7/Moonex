const { Server } = require("socket.io");
const db = require("./db"); 

const setupChat = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      perMessageDeflate: true
    },
    transports: ["websocket", "polling"]
  });

  const chatHistoryQuery = `
    SELECT 
        m.id, 
        m.emisor_id, 
        m.receptor_id, 
        m.contenido, 
        m.fecha_envio, 
        m.responde_a,
        COALESCE(
            (SELECT JSON_ARRAYAGG(mi.imagen_url) 
             FROM mensaje_imagenes mi 
             WHERE mi.mensaje_id = m.id), 
            '[]'
        ) AS imagenes
    FROM mensajes m
    ORDER BY m.fecha_envio ASC
  `;

  io.on("connection", async (socket) => {
    console.log(`Cliente conectado: ${socket.id}`);

    try {
      const [results] = await db.query(chatHistoryQuery);
      const processedResults = results.map((result) => ({
        ...result,
        imagenes: result.imagenes ? JSON.parse(result.imagenes) : []
      }));
      socket.emit("chat history", processedResults);
    } catch (err) {
      console.error("Error al obtener mensajes:", err.message);
    }

    // Nuevo mensaje
 // Nuevo mensaje
socket.on("new message", async (message) => {
  console.log("Mensaje recibido");

  const messageQuery = `
    INSERT INTO mensajes (emisor_id, receptor_id, contenido, fecha_envio, responde_a)
    VALUES (?, ?, ?, ?, ?)
  `;
  const messageValues = [
    message.emisor_id,
    message.receptor_id,
    message.contenido || "",
    new Date(),
    message.responde_a || null
  ];

  try {
    // Insertar mensaje
    const [result] = await db.query(messageQuery, messageValues);
    const mensaje_id = result.insertId;
    const messageWithId = { ...message, id: mensaje_id };

    // Guardar imágenes si hay
    if (message.imagenes && message.imagenes.length > 0) {
      const imageValues = message.imagenes.map((img) => [mensaje_id, img]);
      const imageQuery = `
        INSERT INTO mensaje_imagenes (mensaje_id, imagen_url)
        VALUES ?
      `;
      await db.query(imageQuery, [imageValues]);
      console.log("Imágenes guardadas para el mensaje ID:", mensaje_id);
    }

    // Eliminar eliminación lógica si el emisor había borrado la conversación
    await db.query(
      `DELETE FROM conversaciones_eliminadas 
      WHERE usuario_id = ? AND conversacion_id = ?`,
      [message.emisor_id, message.receptor_id]
    );

    // Eliminar eliminación lógica si el receptor había borrado la conversación
    await db.query(
      `DELETE FROM conversaciones_eliminadas 
      WHERE usuario_id = ? AND conversacion_id = ?`,
      [message.receptor_id, message.emisor_id]
    );


    // Emitir el nuevo mensaje a todos
    io.emit("new message", messageWithId);
  } catch (err) {
    console.error("Error al guardar el mensaje:", err.message);
  }
});

    // Eliminar mensaje
    socket.on("delete message", async (messageId) => {
      console.log(`Eliminando mensaje con ID: ${messageId}`);

      try {
        await db.query(`DELETE FROM mensaje_imagenes WHERE mensaje_id = ?`, [messageId]);
        await db.query(`DELETE FROM mensajes WHERE id = ?`, [messageId]);

        console.log("Mensaje eliminado de la base de datos:", messageId);
        io.emit("message deleted", messageId);
      } catch (err) {
        console.error("Error al eliminar el mensaje:", err.message);
      }
    });
  });
};

module.exports = setupChat;

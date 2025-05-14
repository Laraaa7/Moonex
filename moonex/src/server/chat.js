const { Server } = require('socket.io');
const db = require('./db');

const setupChat = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"],
            // Añadir compresión para transferencia más rápida
            perMessageDeflate: true
        },
        // Websocket para mejor rendimiento
        transports: ['websocket', 'polling']
    });

    // Preparar consulta para reutilización
    const chatHistoryQuery = `
        SELECT 
            m.id, 
            m.emisor_id, 
            m.receptor_id, 
            m.contenido, 
            m.fecha_envio, 
            COALESCE(
                (SELECT JSON_ARRAYAGG(mi.imagen_url) 
                 FROM mensaje_imagenes mi 
                 WHERE mi.mensaje_id = m.id), 
                '[]' 
            ) AS imagenes
        FROM mensajes m
        ORDER BY m.fecha_envio ASC
    `;

    io.on('connection', (socket) => {
        console.log(`Cliente conectado: ${socket.id}`);

        // Obtener historial de mensajes con imágenes
        db.query(chatHistoryQuery, (err, results) => {
            if (err) {
                console.error(" Error al obtener mensajes:", err.message);
                return;
            }

            try {
                // Procesar todos los resultados de una vez en lugar de iterar
                const processedResults = results.map(result => ({
                    ...result,
                    imagenes: result.imagenes ? JSON.parse(result.imagenes) : []
                }));

                console.log(`Mensajes cargados correctamente: ${processedResults.length}`);
                // Enviar los resultados en un solo paquete
                socket.emit('chat history', processedResults);
            } catch (error) {
                console.error("Error parseando imágenes:", error.message);
            }
        });

        // Recibir y guardar nuevo mensaje
        socket.on('new message', (message) => {
            console.log(" Mensaje recibido");

            const messageQuery = `
                INSERT INTO mensajes (emisor_id, receptor_id, contenido, fecha_envio)
                VALUES (?, ?, ?, ?)
            `;
            const messageValues = [
                message.emisor_id,
                message.receptor_id,
                message.contenido || '',
                new Date()
            ];

            db.query(messageQuery, messageValues, (err, result) => {
                if (err) {
                    console.error(" Error al guardar el mensaje:", err.message);
                    return;
                }

                const mensaje_id = result.insertId;
                const messageWithId = { ...message, id: mensaje_id };

                if (message.imagenes && message.imagenes.length > 0) {
                    const imageValues = message.imagenes.map(imagen => [mensaje_id, imagen]);
                    
                    const imageQuery = `
                        INSERT INTO mensaje_imagenes (mensaje_id, imagen_url)
                        VALUES ?
                    `;

                    db.query(imageQuery, [imageValues], (err) => {
                        if (err) {
                            console.error(" Error al guardar las imágenes:", err.message);
                            return;
                        }

                        console.log("Imágenes guardadas para el mensaje ID:", mensaje_id);
                        // Emitir a todos los clientes de una vez
                        io.emit('new message', messageWithId);
                    });
                } else {
                    io.emit('new message', messageWithId);
                }
            });
        });

        // Recibir y eliminar mensaje
        socket.on('delete message', (messageId) => {
            console.log(`Eliminando mensaje con ID: ${messageId}`);

            const deleteMessageQuery = `
                DELETE FROM mensajes WHERE id = ?
            `;

            db.query(deleteMessageQuery, [messageId], (err, result) => {
                if (err) {
                    console.error(" Error al eliminar el mensaje:", err.message);
                    return;
                }

                console.log("Mensaje eliminado de la base de datos:", messageId);
                io.emit('message deleted', messageId); // Emitir a todos los clientes que el mensaje ha sido eliminado
            });
        });

        socket.on('disconnect', () => {
            console.log(`Cliente desconectado: ${socket.id}`);
        });
    });
};

module.exports = setupChat;

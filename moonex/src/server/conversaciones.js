const express = require('express');
const router = express.Router();
const db = require('./db');

// Obtener lista de conversaciones únicas de un usuario con último mensaje
router.get('/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId);

  const query = `
    SELECT 
      u.id,
      u.username,
      u.nombre,
      u.foto_perfil,
      m.contenido AS ultimo_mensaje,
      m.fecha_envio,
      EXISTS (
        SELECT 1 FROM mensaje_imagenes mi
        WHERE mi.mensaje_id = m.id
      ) AS tiene_imagen
    FROM usuarios u
    JOIN (
      SELECT m1.*
      FROM mensajes m1
      INNER JOIN (
        SELECT 
          LEAST(emisor_id, receptor_id) AS user1,
          GREATEST(emisor_id, receptor_id) AS user2,
          MAX(fecha_envio) AS max_fecha
        FROM mensajes
        GROUP BY user1, user2
      ) AS last_msgs ON 
        LEAST(m1.emisor_id, m1.receptor_id) = last_msgs.user1 AND
        GREATEST(m1.emisor_id, m1.receptor_id) = last_msgs.user2 AND
        m1.fecha_envio = last_msgs.max_fecha
      WHERE m1.emisor_id = ? OR m1.receptor_id = ?
    ) AS m ON (u.id = m.emisor_id OR u.id = m.receptor_id) AND u.id != ?
    GROUP BY u.id
    ORDER BY m.fecha_envio DESC
  `;

  try {
    const [results] = await db.query(query, [userId, userId, userId]);
    res.json(results);
  } catch (err) {
    console.error("Error al obtener conversaciones:", err.message);
    res.status(500).json({ error: "Error del servidor" });
  }
});

module.exports = router;

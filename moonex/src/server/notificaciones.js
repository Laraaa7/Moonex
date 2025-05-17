const express = require("express");
const router = express.Router();
const db = require("./db"); 

router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const connection = await db.getConnection();

    const [
      [seguidores],
      [posts],
      [mensajes],
      [comentarios],
      [respuestas],
      [likes]
    ] = await Promise.all([
      connection.query(`
        SELECT u.username, u.nombre, u.foto_perfil, s.fecha_seguimiento AS fecha, 'follow' AS tipo
        FROM seguidores s
        JOIN usuarios u ON u.id = s.seguidor_id
        WHERE s.seguido_id = ?
      `, [userId]),

      connection.query(`
        SELECT u.username, u.nombre, u.foto_perfil, p.fecha_publicacion AS fecha, 'post' AS tipo, p.id AS publicacion_id
        FROM publicaciones p
        JOIN usuarios u ON u.id = p.usuario_id
        WHERE p.usuario_id IN (
          SELECT seguido_id FROM seguidores WHERE seguidor_id = ?
        )
      `, [userId]),

      connection.query(`
        SELECT u.username, u.nombre, u.foto_perfil, m.fecha_envio AS fecha, 'mensaje' AS tipo
        FROM mensajes m
        JOIN usuarios u ON u.id = m.emisor_id
        WHERE m.receptor_id = ?
      `, [userId]),

      connection.query(`
        SELECT u.username, u.nombre, u.foto_perfil, c.fecha_comentario AS fecha, 'comentario' AS tipo, c.publicacion_id
        FROM comentarios c
        JOIN publicaciones p ON c.publicacion_id = p.id
        JOIN usuarios u ON u.id = c.usuario_id
        WHERE p.usuario_id = ? AND u.id != ?
      `, [userId, userId]),

      connection.query(`
        SELECT u.username, u.nombre, u.foto_perfil, DATE_ADD(r.fecha_respuesta, INTERVAL 2 HOUR) AS fecha, 'respuesta' AS tipo, c.publicacion_id
        FROM respuestas r
        JOIN comentarios c ON r.comentario_id = c.id
        JOIN usuarios u ON u.id = r.usuario_id
        WHERE c.usuario_id = ? AND u.id != ?
      `, [userId, userId]),

      connection.query(`
        SELECT u.username, u.nombre, u.foto_perfil, l.fecha AS fecha, 'like' AS tipo, l.publicacion_id
        FROM likes l
        JOIN publicaciones p ON l.publicacion_id = p.id
        JOIN usuarios u ON u.id = l.usuario_id
        WHERE p.usuario_id = ? AND u.id != ?
      `, [userId, userId]),
    ]);

    const notificaciones = [
      ...seguidores,
      ...posts,
      ...mensajes,
      ...comentarios,
      ...respuestas,
      ...likes
    ];

    notificaciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    res.json(notificaciones);

  } catch (err) {
    console.error("Error al obtener notificaciones:", err);
    res.status(500).json({ error: "Error al obtener notificaciones" });
  }
});

module.exports = router;

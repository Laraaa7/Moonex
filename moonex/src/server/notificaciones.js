const express = require("express");
const router = express.Router();
const db = require("./db");

router.get("/:userId", (req, res) => {
  const { userId } = req.params;

  let notificaciones = [];
  let pendientes = 6;
  let errorOcurrido = false;

  const finalizar = () => {
    if (errorOcurrido) return;
    pendientes--;
    if (pendientes === 0) {
      notificaciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      res.json(notificaciones);
    }
  };

  const manejarError = (err, tipo) => {
    console.error(`Error en ${tipo}:`, err);
    errorOcurrido = true;
    res.status(500).json({ error: "Error al obtener notificaciones" });
  };

  // NOTIFICACIÓN DE FOLLOW
  db.query(`
    SELECT u.username, u.nombre, u.foto_perfil, s.fecha_seguimiento AS fecha, 'follow' AS tipo
    FROM seguidores s
    JOIN usuarios u ON u.id = s.seguidor_id
    WHERE s.seguido_id = ?
  `, [userId], (err, results) => {
    if (err) return manejarError(err, 'seguidores');
    notificaciones.push(...results);
    finalizar();
  });

  // NOTIFICACIÓN DE NUEVO POST
  db.query(`
    SELECT u.username, u.nombre, u.foto_perfil, p.fecha_publicacion AS fecha, 'post' AS tipo, p.id AS publicacion_id
    FROM publicaciones p
    JOIN usuarios u ON u.id = p.usuario_id
    WHERE p.usuario_id IN (
      SELECT seguido_id FROM seguidores WHERE seguidor_id = ?
    )
  `, [userId], (err, results) => {
    if (err) return manejarError(err, 'posts');
    notificaciones.push(...results);
    finalizar();
  });

  // NOTIFICACIÓN DE MENSAJE
  db.query(`
    SELECT u.username, u.nombre, u.foto_perfil, m.fecha_envio AS fecha, 'mensaje' AS tipo
    FROM mensajes m
    JOIN usuarios u ON u.id = m.emisor_id
    WHERE m.receptor_id = ?
  `, [userId], (err, results) => {
    if (err) return manejarError(err, 'mensajes');
    notificaciones.push(...results);
    finalizar();
  });

  // NOTIFICACIÓN DE COMENTARIO
  db.query(`
    SELECT u.username, u.nombre, u.foto_perfil, c.fecha_comentario AS fecha, 'comentario' AS tipo, c.publicacion_id
    FROM comentarios c
    JOIN publicaciones p ON c.publicacion_id = p.id
    JOIN usuarios u ON u.id = c.usuario_id
    WHERE p.usuario_id = ? AND u.id != ?
  `, [userId, userId], (err, results) => {
    if (err) return manejarError(err, 'comentarios');
    notificaciones.push(...results);
    finalizar();
  });

  // NOTIFICACIÓN DE RESPUESTA A UN COMENTARIO
  db.query(`
        SELECT 
        u.username, 
        u.nombre,
        u.foto_perfil, 
        DATE_ADD(r.fecha_respuesta, INTERVAL 2 HOUR) AS fecha, -- Ajuste horario
        'respuesta' AS tipo, 
        c.publicacion_id
        FROM respuestas r
        JOIN comentarios c ON r.comentario_id = c.id
        JOIN usuarios u ON u.id = r.usuario_id
        WHERE c.usuario_id = ? AND u.id != ?

  `, [userId, userId], (err, results) => {
    if (err) return manejarError(err, 'respuestas');
    notificaciones.push(...results);
    finalizar();
  });

  // NOTIFICACIÓN DE LIKE EN PUBLICACIÓN
  db.query(`
    SELECT u.username, u.nombre, u.foto_perfil, l.fecha AS fecha, 'like' AS tipo, l.publicacion_id
    FROM likes l
    JOIN publicaciones p ON l.publicacion_id = p.id
    JOIN usuarios u ON u.id = l.usuario_id
    WHERE p.usuario_id = ? AND u.id != ?
  `, [userId, userId], (err, results) => {
    if (err) return manejarError(err, 'likes');
    notificaciones.push(...results);
    finalizar();
  });
});

module.exports = router;

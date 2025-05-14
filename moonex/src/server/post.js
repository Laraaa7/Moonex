const express = require('express');
const db = require('./db');

const router = express.Router();

// Crear publicación
router.post('/crear-post', (req, res) => {
  const { usuario_id, titulo, contenido } = req.body;

  if (!usuario_id || !titulo || !contenido) {
    return res.status(400).json({ error: 'Campos requeridos incompletos' });
  }

  const sql = `
    INSERT INTO publicaciones (usuario_id, titulo, contenido, fecha_publicacion)
    VALUES (?, ?, ?, NOW())
  `;

  db.query(sql, [usuario_id, titulo, contenido], (err, result) => {
    if (err) {
      console.error('Error al guardar post:', err);
      return res.status(500).json({ error: 'Error al guardar post' });
    }

    res.status(201).json({ message: 'Post creado correctamente', postId: result.insertId });
  });
});

// Obtener publicaciones con datos del autor + número de comentarios
router.get('/posts', (req, res) => {
  const sql = `
        SELECT p.id, p.titulo, p.contenido, p.imagen, p.fecha_publicacion,
            u.id AS usuario_id, u.username, u.nombre, u.foto_perfil,
            COUNT(DISTINCT c.id) AS comentarios_count,
            COUNT(DISTINCT l.id) AS likes_count
      FROM publicaciones p
      JOIN usuarios u ON p.usuario_id = u.id
      LEFT JOIN comentarios c ON p.id = c.publicacion_id
      LEFT JOIN likes l ON p.id = l.publicacion_id
      GROUP BY p.id
      ORDER BY p.fecha_publicacion DESC

  `;

  db.query(sql, (err, posts) => {
    if (err) {
      console.error('Error al obtener posts:', err);
      return res.status(500).json({ error: 'Error al obtener publicaciones' });
    }

    res.json(posts);
  });
});

// Obtener un post individual por ID
router.get('/posts/:id', (req, res) => {
  const postId = req.params.id;

  const sql = `
    SELECT p.id, p.titulo, p.contenido, p.imagen, p.fecha_publicacion,
           u.id AS usuario_id, u.username, u.nombre, u.foto_perfil
    FROM publicaciones p
    JOIN usuarios u ON p.usuario_id = u.id
    WHERE p.id = ?
  `;

  db.query(sql, [postId], (err, results) => {
    if (err) {
      console.error('Error al obtener el post:', err);
      return res.status(500).json({ error: 'Error al obtener el post' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Post no encontrado' });
    }

    res.json(results[0]);
  });
});

// Crear comentario
router.post('/comentarios', (req, res) => {
  const { usuario_id, publicacion_id, contenido } = req.body;

  if (!usuario_id || !publicacion_id || !contenido) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const fecha = new Date();

  const sql = `
    INSERT INTO comentarios (usuario_id, publicacion_id, contenido, fecha_comentario)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [usuario_id, publicacion_id, contenido, fecha], (err, result) => {
    if (err) {
      console.error('Error al insertar comentario:', err);
      return res.status(500).json({ error: 'Error al insertar comentario' });
    }

    res.status(201).json({ success: true, id: result.insertId });
  });
});

// Obtener comentarios de un post
router.get('/comentarios/:postId', (req, res) => {
  const { postId } = req.params;

  const sql = `
    SELECT c.id, c.contenido, c.fecha_comentario AS fecha,
           u.username, u.nombre, u.foto_perfil
    FROM comentarios c
    JOIN usuarios u ON c.usuario_id = u.id
    WHERE c.publicacion_id = ?
    ORDER BY c.fecha_comentario ASC
  `;

  db.query(sql, [postId], (err, results) => {
    if (err) {
      console.error('Error al obtener comentarios:', err);
      return res.status(500).json({ error: 'Error al obtener comentarios' });
    }

    res.json(results);
  });
});

// Contar comentarios de un post
router.get('/comentarios/count/:postId', (req, res) => {
  const { postId } = req.params;

  const sql = `
    SELECT COUNT(*) AS total
    FROM comentarios
    WHERE publicacion_id = ?
  `;

  db.query(sql, [postId], (err, results) => {
    if (err) {
      console.error('Error al contar comentarios:', err);
      return res.status(500).json({ error: 'Error al contar comentarios' });
    }

    res.json({ total: results[0].total });
  });
});

// Dar like a un comentario
router.post('/comentarios/likes', (req, res) => {
  const { usuario_id, comentario_id } = req.body;

  if (!usuario_id || !comentario_id) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const sql = `
    INSERT IGNORE INTO likes_comentarios (usuario_id, comentario_id)
    VALUES (?, ?)
  `;

  db.query(sql, [usuario_id, comentario_id], (err) => {
    if (err) {
      console.error('Error al dar like al comentario:', err);
      return res.status(500).json({ error: 'Error al dar like' });
    }

    res.status(201).json({ success: true });
  });
});

// Quitar like a un comentario
router.delete('/comentarios/likes', (req, res) => {
  const { usuario_id, comentario_id } = req.body;

  const sql = `
    DELETE FROM likes_comentarios
    WHERE usuario_id = ? AND comentario_id = ?
  `;

  db.query(sql, [usuario_id, comentario_id], (err) => {
    if (err) {
      console.error('Error al quitar like al comentario:', err);
      return res.status(500).json({ error: 'Error al quitar like' });
    }

    res.json({ success: true });
  });
});

// Obtener likes de un usuario (comentarios que ha dado like)
router.get('/comentarios/likes/usuario/:userId', (req, res) => {
  const userId = req.params.userId;

  const sql = `
    SELECT comentario_id FROM likes_comentarios WHERE usuario_id = ?
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Error al obtener likes del usuario:', err);
      return res.status(500).json({ error: 'Error al obtener likes' });
    }

    res.json(results);
  });
});

// Obtener conteo de likes por comentario
router.get('/comentarios/likes/conteo', (req, res) => {
  const sql = `
    SELECT comentario_id, COUNT(*) AS count
    FROM likes_comentarios
    GROUP BY comentario_id
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error al contar likes por comentario:', err);
      return res.status(500).json({ error: 'Error al contar likes' });
    }

    res.json(results);
  });
});

// Remover like a comentario (POST en lugar de DELETE)
router.post('/comentarios/likes/remover', (req, res) => {
  const { usuario_id, comentario_id } = req.body;

  const sql = `
    DELETE FROM likes_comentarios
    WHERE usuario_id = ? AND comentario_id = ?
  `;

  db.query(sql, [usuario_id, comentario_id], (err) => {
    if (err) {
      console.error('Error al quitar like al comentario:', err);
      return res.status(500).json({ error: 'Error al quitar like' });
    }

    res.json({ success: true });
  });
});

// Obtener conteo de respuestas por comentario
router.get('/comentarios/conteo', (req, res) => {
  const sql = `
SELECT comentario_id, COUNT(*) AS count
FROM respuestas
WHERE comentario_id IS NOT NULL
GROUP BY comentario_id

`;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error al contar respuestas:', err);
      return res.status(500).json({ error: 'Error al contar respuestas' });
    }

    res.json(results);
  });
});

module.exports = router;


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

module.exports = router;


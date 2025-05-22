const express = require('express');
const db = require('./db');

const router = express.Router();

// Crear publicación
router.post('/crear-post', async (req, res) => {
  const { usuario_id, titulo, contenido } = req.body;

  if (!usuario_id || !titulo || !contenido) {
    return res.status(400).json({ error: 'Campos requeridos incompletos' });
  }

   try {
    const sql = `
      INSERT INTO publicaciones (usuario_id, titulo, contenido, fecha_publicacion)
      VALUES (?, ?, ?, NOW())
    `;
    const [result] = await db.query(sql, [usuario_id, titulo, contenido]);
    res.status(201).json({ message: 'Post creado correctamente', postId: result.insertId });
  } catch (err) {
    console.error('Error al guardar post:', err);
    res.status(500).json({ error: 'Error al guardar post' });
  }
});

// Obtener publicaciones con datos del autor + número de comentarios
router.get('/posts', async (req, res) => {
  try {
    const [posts] = await db.query(`
      SELECT 
        p.id,
        p.titulo,
        p.contenido,
        p.imagen,
        p.fecha_publicacion,
        u.id AS usuario_id,
        u.username,
        u.nombre,
        u.foto_perfil
      FROM publicaciones p
      JOIN usuarios u ON p.usuario_id = u.id
      ORDER BY p.fecha_publicacion DESC
    `);

    const [comentarios] = await db.query(`
      SELECT publicacion_id, COUNT(*) AS comentarios_count
      FROM comentarios
      GROUP BY publicacion_id
    `);

    const [likes] = await db.query(`
      SELECT publicacion_id, COUNT(*) AS likes_count
      FROM likes
      GROUP BY publicacion_id
    `);

    const comentariosMap = Object.fromEntries(
      comentarios.map(c => [c.publicacion_id, c.comentarios_count])
    );
    const likesMap = Object.fromEntries(
      likes.map(l => [l.publicacion_id, l.likes_count])
    );

    const postsConConteos = posts.map(post => ({
      ...post,
      comentarios_count: comentariosMap[post.id] || 0,
      likes_count: likesMap[post.id] || 0
    }));

    res.json(postsConConteos);
  } catch (err) {
    console.error('Error al obtener posts:', err);
    res.status(500).json({ error: 'Error al obtener publicaciones' });
  }
});

// Obtener un post individual por ID
router.get('/posts/:id', async (req, res) => {
  const postId = req.params.id;

  try {
    const sql = `
      SELECT p.id, p.titulo, p.contenido, p.imagen, p.fecha_publicacion,
             u.id AS usuario_id, u.username, u.nombre, u.foto_perfil
      FROM publicaciones p
      JOIN usuarios u ON p.usuario_id = u.id
      WHERE p.id = ?
    `;
    const [results] = await db.query(sql, [postId]);

    if (results.length === 0) {
      return res.status(404).json({ error: 'Post no encontrado' });
    }

    res.json(results[0]);
  } catch (err) {
    console.error('Error al obtener el post:', err);
    res.status(500).json({ error: 'Error al obtener el post' });
  }
});

// Crear comentario
router.post('/comentarios', async (req, res) => {
  const { usuario_id, publicacion_id, contenido } = req.body;

  if (!usuario_id || !publicacion_id || !contenido) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    const sql = `
      INSERT INTO comentarios (usuario_id, publicacion_id, contenido, fecha_comentario)
      VALUES (?, ?, ?, ?)
    `;
    const fecha = new Date();
    const [result] = await db.query(sql, [usuario_id, publicacion_id, contenido, fecha]);
    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    console.error('Error al insertar comentario:', err);
    res.status(500).json({ error: 'Error al insertar comentario' });
  }
});

// Obtener comentarios de un post
router.get('/comentarios/:postId', async (req, res) => {
  const { postId } = req.params;

  try {
    const sql = `
      SELECT c.id, c.contenido, c.fecha_comentario AS fecha,
            c.usuario_id, u.username, u.nombre, u.foto_perfil
      FROM comentarios c
      JOIN usuarios u ON c.usuario_id = u.id
      WHERE c.publicacion_id = ?
      ORDER BY c.fecha_comentario DESC
    `;
    const [results] = await db.query(sql, [postId]);
    res.json(results);
  } catch (err) {
    console.error('Error al obtener comentarios:', err);
    res.status(500).json({ error: 'Error al obtener comentarios' });
  }
});

// Contar comentarios de un post
router.get('/comentarios/count/:postId', async (req, res) => {
  const { postId } = req.params;

  try {
    const sql = `
      SELECT COUNT(*) AS total
      FROM comentarios
      WHERE publicacion_id = ?
    `;
    const [results] = await db.query(sql, [postId]);
    res.json({ total: results[0].total });
  } catch (err) {
    console.error('Error al contar comentarios:', err);
    res.status(500).json({ error: 'Error al contar comentarios' });
  }
});

// Eliminar publicación
router.delete('/posts/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await db.query("DELETE FROM respuestas WHERE comentario_id IN (SELECT id FROM comentarios WHERE publicacion_id = ?)", [id]);
    await db.query("DELETE FROM comentarios WHERE publicacion_id = ?", [id]);
    await db.query("DELETE FROM likes WHERE publicacion_id = ?", [id]);

    const [result] = await db.query("DELETE FROM publicaciones WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Publicación no encontrada' });
    }

    res.json({ success: true, message: "Publicación eliminada correctamente" });
  } catch (err) {
    console.error('Error al eliminar publicación:', err);
    res.status(500).json({ error: 'Error al eliminar publicación' });
  }
});

module.exports = router;

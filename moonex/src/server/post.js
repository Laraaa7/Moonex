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
  

// Obtener publicaciones con datos del autor
router.get('/posts', (req, res) => {
  const sql = `
    SELECT p.id, p.titulo, p.contenido, p.imagen, p.fecha_publicacion,
           u.id AS usuario_id, u.username, u.nombre, u.foto_perfil
    FROM publicaciones p
    JOIN usuarios u ON p.usuario_id = u.id
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

module.exports = router;

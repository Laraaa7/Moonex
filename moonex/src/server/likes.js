const express = require('express');
const db = require('./db'); 

const router = express.Router();

// Dar like
router.post('/', (req, res) => {
  const { usuario_id, publicacion_id } = req.body;

  if (!usuario_id || !publicacion_id) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  const sql = `
    INSERT INTO likes (usuario_id, publicacion_id)
    VALUES (?, ?)
  `;

  db.query(sql, [usuario_id, publicacion_id], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: "Ya diste like" });
      }
      return res.status(500).json({ error: "Error al dar like", details: err.message });
    }

    res.status(201).json({ message: "Like agregado" });
  });
});

// Quitar like
router.delete('/', (req, res) => {
  const { usuario_id, publicacion_id } = req.body;

  const sql = `DELETE FROM likes WHERE usuario_id = ? AND publicacion_id = ?`;
  db.query(sql, [usuario_id, publicacion_id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error al quitar like", details: err.message });
    }

    res.json({ message: "Like eliminado" });
  });
});

// Obtener todos los likes de un post
router.get('/:publicacion_id', (req, res) => {
  const { publicacion_id } = req.params;

  const sql = `
    SELECT usuario_id FROM likes
    WHERE publicacion_id = ?
  `;

  db.query(sql, [publicacion_id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error al obtener likes" });
    }

    res.json(results); // lista de usuario_id
  });
});

// Obtener publicaciones con like por usuario
router.get('/usuario/:usuario_id', (req, res) => {
  const { usuario_id } = req.params;

  const sql = `
    SELECT publicacion_id FROM likes
    WHERE usuario_id = ?
  `;

  db.query(sql, [usuario_id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error al obtener likes del usuario" });
    }

    const likedPostIds = results.map(row => row.publicacion_id);
    res.json(likedPostIds);
  });
});

module.exports = router;

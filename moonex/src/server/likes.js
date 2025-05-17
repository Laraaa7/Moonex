const express = require('express');
const db = require('./db'); 

const router = express.Router();

// Dar like
router.post('/', async (req, res) => {
  const { usuario_id, publicacion_id } = req.body;

  if (!usuario_id || !publicacion_id) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  const sql = `
    INSERT INTO likes (usuario_id, publicacion_id)
    VALUES (?, ?)
  `;

 try {
    await db.query(sql, [usuario_id, publicacion_id]);
    res.status(201).json({ message: "Like agregado" });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: "Ya diste like" });
    }
    res.status(500).json({ error: "Error al dar like", details: err.message });
  }
});

// Quitar like
router.delete('/', async (req, res) => {
  const { usuario_id, publicacion_id } = req.body;

  const sql = `DELETE FROM likes WHERE usuario_id = ? AND publicacion_id = ?`;
  try {
    await db.query(sql, [usuario_id, publicacion_id]);
    res.json({ message: "Like eliminado" });
  } catch (err) {
    res.status(500).json({ error: "Error al quitar like", details: err.message });
  }
});

// Obtener todos los likes de un post
router.get('/:publicacion_id', async (req, res) => {
  const { publicacion_id } = req.params;

  const sql = `
    SELECT usuario_id FROM likes
    WHERE publicacion_id = ?
  `;

  try {
    const [results] = await db.query(sql, [publicacion_id]);
    res.json(results); // lista de usuario_id
  } catch (err) {
    res.status(500).json({ error: "Error al obtener likes" });
  }
});

// Obtener publicaciones con like por usuario
router.get('/usuario/:usuario_id', async (req, res) => {
  const { usuario_id } = req.params;

  const sql = `
    SELECT publicacion_id FROM likes
    WHERE usuario_id = ?
  `;

   try {
    const [results] = await db.query(sql, [usuario_id]);
    const likedPostIds = results.map(row => row.publicacion_id);
    res.json(likedPostIds);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener likes del usuario" });
  }
});

module.exports = router;

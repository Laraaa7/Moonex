const express = require('express');
const db = require('./db');
const router = express.Router();

// Like a comentario
router.post('/likes', async (req, res) => {
  const { usuario_id, comentario_id } = req.body;
  if (!usuario_id || !comentario_id) return res.status(400).json({ error: 'Faltan datos' });

  try {
    const [exists] = await db.query(
      'SELECT * FROM likes_comentarios WHERE usuario_id = ? AND comentario_id = ?',
      [usuario_id, comentario_id]
    );
    if (exists.length > 0) return res.status(409).json({ error: 'Ya diste like' });

    await db.query(
      'INSERT INTO likes_comentarios (usuario_id, comentario_id) VALUES (?, ?)',
      [usuario_id, comentario_id]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al dar like' });
  }
});

// Quitar like
router.delete('/likes', async (req, res) => {
  const { usuario_id, comentario_id } = req.body;
  if (!usuario_id || !comentario_id) return res.status(400).json({ error: 'Faltan datos' });

  try {
    await db.query(
      'DELETE FROM likes_comentarios WHERE usuario_id = ? AND comentario_id = ?',
      [usuario_id, comentario_id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al quitar like' });
  }
});

// Likes que ha dado un usuario
router.get('/likes/usuario/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const [results] = await db.query(
      'SELECT comentario_id FROM likes_comentarios WHERE usuario_id = ?',
      [userId]
    );
    res.json(results.map(r => r.comentario_id));
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener likes del usuario' });
  }
});

// Conteo de likes por comentario
router.get('/likes/conteo', async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT comentario_id, COUNT(*) AS count
      FROM likes_comentarios
      GROUP BY comentario_id
    `);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Error al contar likes' });
  }
});

// Eliminar comentario
// Función recursiva para eliminar subrespuestas
async function eliminarSubrespuestas(respuestaId) {
    const [subrespuestas] = await db.query(
      'SELECT id FROM respuestas WHERE respuesta_padre_id = ?', 
      [respuestaId]
    );
  
    for (const sub of subrespuestas) {
      await eliminarSubrespuestas(sub.id);
      await db.query('DELETE FROM respuestas WHERE id = ?', [sub.id]);
    }
  }
  
  // Eliminar todas las respuestas de un comentario, incluso anidadas
  async function eliminarRespuestasDeComentario(comentarioId) {
    const [respuestas] = await db.query(
      'SELECT id FROM respuestas WHERE comentario_id = ? AND respuesta_padre_id IS NULL',
      [comentarioId]
    );
  
    for (const respuesta of respuestas) {
      await eliminarSubrespuestas(respuesta.id);
      await db.query('DELETE FROM respuestas WHERE id = ?', [respuesta.id]);
    }
  }
  
  // Ruta DELETE /comentarios/:id
  router.delete('/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      // Eliminar todas las respuestas y subrespuestas del comentario
      await eliminarRespuestasDeComentario(id);
  
      // Eliminar los likes del comentario (opcional)
      await db.query("DELETE FROM likes_comentarios WHERE comentario_id = ?", [id]);
  
      // Eliminar el comentario
      const [result] = await db.query("DELETE FROM comentarios WHERE id = ?", [id]);
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Comentario no encontrado' });
      }
  
      res.json({ success: true, message: "Comentario eliminado correctamente" });
    } catch (err) {
      console.error("Error al eliminar comentario:", err);
      res.status(500).json({ error: "Error al eliminar comentario" });
    }
  });
  
  
module.exports = router;

const express = require('express');
const db = require('./db');
const router = express.Router();

// Crear respuesta
router.post('/', async (req, res) => {
  const { usuario_id, comentario_id, respuesta_padre_id, contenido } = req.body;

  if (!usuario_id || !contenido || (!comentario_id && !respuesta_padre_id)) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }

  try {
    let comentarioIdFinal = comentario_id;

    if (!comentario_id && respuesta_padre_id) {
      const [rows] = await db.query(`SELECT comentario_id FROM respuestas WHERE id = ?`, [respuesta_padre_id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Respuesta padre no encontrada' });
      }
      comentarioIdFinal = rows[0].comentario_id;
    }

    const [result] = await db.query(`
      INSERT INTO respuestas (usuario_id, comentario_id, respuesta_padre_id, contenido)
      VALUES (?, ?, ?, ?)
    `, [usuario_id, comentarioIdFinal, respuesta_padre_id || null, contenido]);

    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error('Error al insertar respuesta:', err);
    res.status(500).json({ error: 'Error al insertar respuesta' });
  }
});

// Obtener respuestas de un comentario (nivel 1)
router.get('/comentario/:comentarioId', async (req, res) => {
  try {
    const { comentarioId } = req.params;
    const [results] = await db.query(`
      SELECT r.*, u.username, u.nombre, u.foto_perfil
      FROM respuestas r
      JOIN usuarios u ON r.usuario_id = u.id
      WHERE r.comentario_id = ? AND r.respuesta_padre_id IS NULL
      ORDER BY r.fecha_respuesta ASC
    `, [comentarioId]);

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener respuestas' });
  }
});

// Obtener subrespuestas (respuestas a respuestas)
router.get('/subrespuestas/:respuestaPadreId', async (req, res) => {
  try {
    const { respuestaPadreId } = req.params;
    const [results] = await db.query(`
      SELECT r.*, u.username, u.nombre, u.foto_perfil
      FROM respuestas r
      JOIN usuarios u ON r.usuario_id = u.id
      WHERE r.respuesta_padre_id = ?
      ORDER BY r.fecha_respuesta ASC
    `, [respuestaPadreId]);

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener subrespuestas' });
  }
});

// Dar like a una respuesta
router.post('/likes', async (req, res) => {
  const { usuario_id, respuesta_id } = req.body;
  if (!usuario_id || !respuesta_id) return res.status(400).json({ error: 'Datos incompletos' });

  try {
    const [exists] = await db.query(
      `SELECT * FROM respuestas_likes WHERE usuario_id = ? AND respuesta_id = ?`,
      [usuario_id, respuesta_id]
    );
    if (exists.length > 0) return res.status(409).json({ error: 'Like duplicado' });

    await db.query(
      `INSERT INTO respuestas_likes (usuario_id, respuesta_id) VALUES (?, ?)`,
      [usuario_id, respuesta_id]
    );

    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al dar like' });
  }
});

// Quitar like
router.delete('/likes', async (req, res) => {
  const { usuario_id, respuesta_id } = req.body;
  if (!usuario_id || !respuesta_id) return res.status(400).json({ error: 'Datos incompletos' });

  try {
    await db.query(`DELETE FROM respuestas_likes WHERE usuario_id = ? AND respuesta_id = ?`, [usuario_id, respuesta_id]);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al quitar like' });
  }
});

// Obtener likes por usuario
router.get('/likes/usuario/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const [results] = await db.query(`SELECT respuesta_id FROM respuestas_likes WHERE usuario_id = ?`, [userId]);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener likes' });
  }
});

// Conteo de likes por respuesta
router.get('/likes/conteo', async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT respuesta_id, COUNT(*) as count
      FROM respuestas_likes
      GROUP BY respuesta_id
    `);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Error al contar likes' });
  }
});

/// Función recursiva para eliminar subrespuestas antes que el padre
async function eliminarSubrespuestas(respuestaId) {
  const [subrespuestas] = await db.query(
    'SELECT id FROM respuestas WHERE respuesta_padre_id = ?', 
    [respuestaId]
  );

  for (const sub of subrespuestas) {
    await eliminarSubrespuestas(sub.id); // eliminar nietas, bisnietas...
    await db.query('DELETE FROM respuestas WHERE id = ?', [sub.id]);
  }
}

// Ruta DELETE mejorada que elimina todo en cascada
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await eliminarSubrespuestas(id); // primero eliminar hijas recursivamente
    const [resultado] = await db.query('DELETE FROM respuestas WHERE id = ?', [id]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Respuesta no encontrada' });
    }

    res.json({ mensaje: 'Respuesta eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar respuesta:', error);
    res.status(500).json({ mensaje: 'Error al eliminar respuesta' });
  }
});

module.exports = router;

const express = require('express');
const db = require('./db'); // ajusta según tu estructura
const router = express.Router();

// Crear respuesta (a comentario o a otra respuesta)
router.post('/', (req, res) => {
    const { usuario_id, comentario_id, respuesta_padre_id, contenido } = req.body;
  
    if (!usuario_id || !contenido || (!comentario_id && !respuesta_padre_id)) {
      return res.status(400).json({ error: 'Datos incompletos' });
    }
  
    const insertarRespuesta = (comentarioIdFinal) => {
      const sql = `
        INSERT INTO respuestas (usuario_id, comentario_id, respuesta_padre_id, contenido)
        VALUES (?, ?, ?, ?)
      `;
      db.query(sql, [usuario_id, comentarioIdFinal, respuesta_padre_id || null, contenido], (err, result) => {
        if (err) {
          console.error('Error al insertar respuesta:', err);
          return res.status(500).json({ error: 'Error al insertar respuesta' });
        }
        res.status(201).json({ id: result.insertId });
      });
    };
  
    if (comentario_id) {
      // Es respuesta directa a comentario
      insertarRespuesta(comentario_id);
    } else {
      // Es respuesta a una respuesta, buscamos el comentario_id del padre
      const buscarSql = `SELECT comentario_id FROM respuestas WHERE id = ?`;
      db.query(buscarSql, [respuesta_padre_id], (err, results) => {
        if (err || results.length === 0) {
          console.error('Error al buscar comentario_id del padre:', err);
          return res.status(500).json({ error: 'Error al obtener comentario_id del padre' });
        }
        const comentarioIdFinal = results[0].comentario_id;
        insertarRespuesta(comentarioIdFinal);
      });
    }
  });
  

// Obtener respuestas de un comentario (nivel 1)
router.get('/comentario/:comentarioId', (req, res) => {
  const { comentarioId } = req.params;

  const sql = `
    SELECT r.*, u.username, u.nombre, u.foto_perfil
    FROM respuestas r
    JOIN usuarios u ON r.usuario_id = u.id
    WHERE r.comentario_id = ? AND r.respuesta_padre_id IS NULL
    ORDER BY r.fecha_respuesta ASC
  `;

  db.query(sql, [comentarioId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener respuestas' });
    res.json(results);
  });
});

// Obtener subrespuestas (respuestas a respuestas)
router.get('/subrespuestas/:respuestaPadreId', (req, res) => {
  const { respuestaPadreId } = req.params;

  const sql = `
    SELECT r.*, u.username, u.nombre, u.foto_perfil
    FROM respuestas r
    JOIN usuarios u ON r.usuario_id = u.id
    WHERE r.respuesta_padre_id = ?
    ORDER BY r.fecha_respuesta ASC
  `;

  db.query(sql, [respuestaPadreId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener subrespuestas' });
    res.json(results);
  });
});

// Dar like a una respuesta
router.post('/likes', (req, res) => {
  const { usuario_id, respuesta_id } = req.body;
  if (!usuario_id || !respuesta_id) return res.status(400).json({ error: 'Datos incompletos' });

  const checkSql = `SELECT * FROM respuestas_likes WHERE usuario_id = ? AND respuesta_id = ?`;
  db.query(checkSql, [usuario_id, respuesta_id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al verificar like' });
    if (results.length > 0) return res.status(409).json({ error: 'Like duplicado' });

    const insertSql = `INSERT INTO respuestas_likes (usuario_id, respuesta_id) VALUES (?, ?)`;
    db.query(insertSql, [usuario_id, respuesta_id], (err2) => {
      if (err2) return res.status(500).json({ error: 'Error al dar like' });
      res.status(201).json({ success: true });
    });
  });
});

// Quitar like
router.delete('/likes', (req, res) => {
  const { usuario_id, respuesta_id } = req.body;
  if (!usuario_id || !respuesta_id) return res.status(400).json({ error: 'Datos incompletos' });

  const sql = `DELETE FROM respuestas_likes WHERE usuario_id = ? AND respuesta_id = ?`;
  db.query(sql, [usuario_id, respuesta_id], (err) => {
    if (err) return res.status(500).json({ error: 'Error al quitar like' });
    res.status(200).json({ success: true });
  });
});

// Obtener likes por usuario
router.get('/likes/usuario/:userId', (req, res) => {
  const { userId } = req.params;
  const sql = `SELECT respuesta_id FROM respuestas_likes WHERE usuario_id = ?`;
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener likes' });
    res.json(results);
  });
});

// Conteo de likes por respuesta
router.get('/likes/conteo', (req, res) => {
  const sql = `
    SELECT respuesta_id, COUNT(*) as count
    FROM respuestas_likes
    GROUP BY respuesta_id
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al contar likes' });
    res.json(results);
  });
});

module.exports = router;

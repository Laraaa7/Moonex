const express = require("express");
const router = express.Router();
const db = require("./db");

// Seguir o dejar de seguir a un usuario
router.post("/", async (req, res) => {
  const { seguidor_id, seguido_id } = req.body;
  const seguidor = parseInt(seguidor_id);
  const seguido = parseInt(seguido_id);

  if (isNaN(seguidor) || isNaN(seguido) || seguidor === seguido) {
    return res.status(400).json({ error: "IDs inválidos o iguales" });
  }

  try {
    const [existing] = await db.query(
      "SELECT * FROM seguidores WHERE seguidor_id = ? AND seguido_id = ?",
      [seguidor, seguido]
    );

    if (existing.length > 0) {
      await db.query(
        "DELETE FROM seguidores WHERE seguidor_id = ? AND seguido_id = ?",
        [seguidor, seguido]
      );
      return res.json({ followed: false });
    } else {
      await db.query(
        "INSERT INTO seguidores (seguidor_id, seguido_id, fecha_seguimiento) VALUES (?, ?, NOW())",
        [seguidor, seguido]
      );
      return res.json({ followed: true });
    }
  } catch (err) {
    console.error("Error al seguir/dejar de seguir:", err);
    res.status(500).json({ error: "Error en la operación", details: err.message });
  }
});

// Obtener estadísticas (seguidores, siguiendo, amigos)
router.get("/estadisticas/:userId", async (req, res) => {
  const id = parseInt(req.params.userId);

  if (isNaN(id)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  try {
    const [exists] = await db.query("SELECT id FROM usuarios WHERE id = ?", [id]);
    if (exists.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const [seguidoresResult] = await db.query("SELECT COUNT(*) AS total FROM seguidores WHERE seguido_id = ?", [id]);
    const [siguiendoResult] = await db.query("SELECT COUNT(*) AS total FROM seguidores WHERE seguidor_id = ?", [id]);
    const [amigosResult] = await db.query(`
      SELECT COUNT(*) AS total 
      FROM seguidores AS s1 
      INNER JOIN seguidores AS s2 
      ON s1.seguidor_id = s2.seguido_id AND s1.seguido_id = s2.seguidor_id 
      WHERE s1.seguidor_id = ?
    `, [id]);

    res.json({
      seguidores: seguidoresResult[0].total,
      siguiendo: siguiendoResult[0].total,
      amigos: amigosResult[0].total,
    });
  } catch (err) {
    console.error("Error al obtener estadísticas:", err);
    res.status(500).json({ error: "Error al obtener estadísticas", details: err.message });
  }
});
// Comprobar si un usuario sigue a otro
router.post('/check', async (req, res) => {
  const { seguidor_id, seguido_id } = req.body;
  const seguidor = parseInt(seguidor_id);
  const seguido = parseInt(seguido_id);

  if (isNaN(seguidor) || isNaN(seguido)) {
    return res.status(400).json({ error: "IDs inválidos", isFollowing: false });
  }

  try {
    const [result] = await db.query(
      "SELECT * FROM seguidores WHERE seguidor_id = ? AND seguido_id = ?",
      [seguidor, seguido]
    );
    res.json({ isFollowing: result.length > 0 });
  } catch (err) {
    console.error("Error al comprobar seguimiento:", err);
    res.status(500).json({ error: "Error al comprobar seguimiento", isFollowing: false });
  }
});

// Obtener lista de usuarios que sigue un usuario
router.get('/siguiendo/:userId', async (req, res) => {
  const id = parseInt(req.params.userId);

  if (isNaN(id)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  const query = `
    SELECT u.id, u.username, u.nombre, u.foto_perfil
    FROM seguidores s
    JOIN usuarios u ON s.seguido_id = u.id
    WHERE s.seguidor_id = ?
  `;

  try {
    const [results] = await db.query(query, [id]);
    res.json(results);
  } catch (err) {
    console.error("Error al obtener la lista de seguidos:", err);
    res.status(500).json({ error: "Error al obtener la lista de seguidos" });
  }
});

// Obtener lista de seguidores de un usuario
router.get('/seguidores/:userId', async (req, res) => {
  const id = parseInt(req.params.userId);

  if (isNaN(id)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  const query = `
    SELECT u.id, u.username, u.nombre, u.foto_perfil
    FROM seguidores s
    JOIN usuarios u ON s.seguidor_id = u.id
    WHERE s.seguido_id = ?
  `;

  try {
    const [results] = await db.query(query, [id]);
    res.json(results);
  } catch (err) {
    console.error("Error al obtener los seguidores:", err);
    res.status(500).json({ error: "Error al obtener los seguidores" });
  }
});
 // Obtener sugerencias de usuarios a los que no sigues
router.get('/sugerencias/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId);

  if (isNaN(userId)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  const query = `
    SELECT u.id, u.username, u.nombre, u.foto_perfil
    FROM usuarios u
    WHERE u.id != ? AND u.id NOT IN (
      SELECT seguido_id FROM seguidores WHERE seguidor_id = ?
    )
    ORDER BY RAND()
    LIMIT 5
  `;

  try {
    const [results] = await db.query(query, [userId, userId]);
    res.json(results);
  } catch (err) {
    console.error("Error al obtener sugerencias:", err);
    res.status(500).json({ error: "Error al obtener sugerencias" });
  }
});

module.exports = router;


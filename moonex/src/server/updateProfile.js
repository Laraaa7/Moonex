const express = require('express');
const db = require('./db');

const router = express.Router();

// Endpoint para verificar si un username está disponible
router.get('/check-username', async (req, res) => {
const { username } = req.query;

if (!username) {
  return res.status(400).json({ error: 'Se requiere un nombre de usuario' });
}

try {
  const [results] = await db.query('SELECT id FROM usuarios WHERE username = ?', [username]);

  if (results.length > 0) {
    return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
  }

  return res.status(200).json({ available: true, message: 'Nombre de usuario disponible' });
} catch (err) {
  console.error('Error al verificar username:', err);
  return res.status(500).json({ error: 'Error al verificar disponibilidad del username' });
}
});
// Endpoint para actualizar el perfil del usuario
router.put('/updateProfile/:id', async (req, res) => {
const userId = req.params.id;
const { nombre, username, nacimiento, ubicacion, foto_perfil, banner } = req.body;

if (!nombre || !username) {
  return res.status(400).json({ error: 'El nombre y el username son obligatorios' });
}

try {
  // Verificar si otro usuario ya tiene ese username
  const [usernameCheck] = await db.query('SELECT id FROM usuarios WHERE username = ? AND id != ?', [username, userId]);

  if (usernameCheck.length > 0) {
    return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
  }

  // Actualizar perfil
  const [result] = await db.query(
    'UPDATE usuarios SET nombre = ?, username = ?, fecha_nacimiento = ?, ubicacion = ?, foto_perfil = ?, banner = ? WHERE id = ?',
    [nombre, username, nacimiento, ubicacion, foto_perfil, banner, userId]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  // Obtener datos actualizados
  const [users] = await db.query(
    'SELECT id, username, nombre, email, foto_perfil, ubicacion, fecha_nacimiento, banner FROM usuarios WHERE id = ?',
    [userId]
  );

  if (users.length === 0) {
    return res.status(404).json({ error: 'Usuario no encontrado después de actualización' });
  }

  return res.status(200).json({
    message: 'Perfil actualizado con éxito',
    user: users[0]
  });

} catch (err) {
  console.error('Error al actualizar perfil:', err);
  return res.status(500).json({ error: 'Error del servidor al actualizar el perfil' });
}
});

// Obtener datos públicos por username
router.get('/username/:username', async (req, res) => {
const { username } = req.params;

try {
  const [results] = await db.query(
    'SELECT id, username, nombre, foto_perfil, banner, fecha_nacimiento, ubicacion FROM usuarios WHERE username = ?',
    [username]
  );

  if (results.length === 0) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  return res.status(200).json(results[0]);
} catch (err) {
  console.error('Error al obtener datos del usuario:', err);
  return res.status(500).json({ error: 'Error al obtener usuario' });
}
});

module.exports = router;

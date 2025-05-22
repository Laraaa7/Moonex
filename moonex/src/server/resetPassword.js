const express = require('express');
const db = require('./db');
const bcrypt = require('bcryptjs');
const router = express.Router();

router.post('/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
  }

  try {
    const [rows] = await db.query(
      'SELECT * FROM tokens_reset WHERE token = ? AND expiracion > NOW()',
      [token]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Token inválido o expirado.' });
    }

    const email = rows[0].email;
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      'UPDATE usuarios SET password = ? WHERE email = ? AND proveedor = "email"',
      [hashedPassword, email]
    );

    await db.query('DELETE FROM tokens_reset WHERE token = ?', [token]);

    res.json({ message: 'Contraseña actualizada correctamente.' });
  } catch (error) {
    console.error('Error en reset-password:', error.message);
    res.status(500).json({ error: 'Error del servidor.' });
  }
});

module.exports = router;
const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('./db'); 

require('dotenv').config();

const router = express.Router();

router.get('/', async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send('Token no proporcionado');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

      // Actualizar a verificado
    const [rows] = await db.query('SELECT verificado FROM usuarios WHERE id = ?', [userId]);

    if (rows.length === 0) {
      return res.status(404).send('Usuario no encontrado');
    }

    const yaVerificado = rows[0].verificado === 1;

    if (yaVerificado) {
      return res.send('Correo verificado correctamente. Ya puedes iniciar sesión.');
    }

  
    await db.query('UPDATE usuarios SET verificado = 1 WHERE id = ?', [userId]);

    return res.send('Correo verificado correctamente. Ya puedes iniciar sesión.');
  } catch (err) {
    console.error('Error al verificar correo:', err.message);
    return res.status(400).send('Token inválido o expirado.');
  }
});

module.exports = router;
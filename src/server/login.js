const express = require('express');
const db = require('./db'); // Importa la conexión a MySQL
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();

//  Endpoint para iniciar sesión
router.post('/', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  // Verificar si el usuario existe
  db.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, results) => {
    if (err) {
      console.error(' Error al buscar usuario:', err);
      return res.status(500).json({ error: 'Error en el servidor' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

    const user = results[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

    //  Generar un token JWT
    const token = jwt.sign({ id: user.id, email: user.email }, 'secreto', { expiresIn: '1h' });

    res.json({ message: ' Login exitoso', token, user });
  });
});

module.exports = router;

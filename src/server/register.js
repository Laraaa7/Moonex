const express = require('express');
const db = require('./db'); 
const bcrypt = require('bcryptjs');

const router = express.Router();

//  Endpoint para registrar usuario
router.post('/', async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    console.log(' Recibido:', nombre, email, password);

    if (!nombre || !email || !password) {
      console.log(' Faltan datos');
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    // ✅ Validación de contraseña segura
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,12}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error: 'La contraseña debe tener entre 6 y 12 caracteres, incluir al menos una mayúscula y un número.'
      });
    }

    // Verificar si el usuario ya existe
    db.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, results) => {
      if (err) {
        console.error(' Error en la base de datos:', err);
        return res.status(500).json({ error: 'Error en la base de datos' });
      }

      if (results.length > 0) {
        console.log(' El usuario ya existe');
        return res.status(400).json({ error: 'El usuario ya está registrado' });
      }

      // 🔹 Encriptar la contraseña
      console.log(' Encriptando contraseña...');
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log(' Contraseña encriptada:', hashedPassword);

      // 🔹 Insertar usuario en la base de datos
      db.query(
        'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)',
        [nombre, email, hashedPassword],
        (err, result) => {
          if (err) {
            console.error(' Error insertando usuario:', err);
            return res.status(500).json({ error: 'Error al registrar usuario' });
          }

          console.log(' Usuario registrado con éxito');
          res.status(201).json({ message: 'Usuario registrado con éxito' });
        }
      );
    });

  } catch (error) {
    console.error(' Error en el registro:', error.message, error.stack);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;

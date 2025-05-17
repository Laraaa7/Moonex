require('dotenv').config();
const express = require('express');
const db = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Login con email + contraseña (solo MySQL)
router.post('/', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const [results] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);

    if (results.length === 0) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

    const user = results[0];

    // Verificar si el usuario fue creado con Google
    if (!user.password) {
      return res.status(401).json({ error: 'Este usuario se registró con Google' });
    }

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

    // Verificar si el correo está confirmado (desde MySQL)
    if (user.verificado === 0) {
      return res.status(403).json({ error: 'Debes verificar tu correo antes de iniciar sesión.' });
    }

    // Generar token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

    // Enviar usuario sin contraseña
    const { password: _, ...userSinPassword } = user;
    res.json({ token, user: userSinPassword });

  } catch (error) {
    console.error('Error en login manual:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Login con Google (sin verificar correo manualmente)
router.post('/google', async (req, res) => {
  const { uid, email, nombre, foto_perfil } = req.body;

  if (!uid || !email) {
    return res.status(400).json({ error: 'Faltan datos de Google' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM usuarios WHERE uid = ?', [uid]);

    let usuario;

    if (rows.length === 0) {
      const username = email.split('@')[0].toLowerCase().replace(/\W/g, '');

      const [result] = await db.query(
        `INSERT INTO usuarios (uid, email, nombre, foto_perfil, proveedor, username, verificado)
         VALUES (?, ?, ?, ?, 'google', ?, 1)`,
        [uid, email, nombre, foto_perfil, username]
      );

      const [newUserRows] = await db.query('SELECT * FROM usuarios WHERE id = ?', [result.insertId]);
      usuario = newUserRows[0];
    } else {
      usuario = rows[0];
    }

    const token = jwt.sign({ id: usuario.id, email: usuario.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: usuario });
  } catch (error) {
    console.error('Error en login con Google:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
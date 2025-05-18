const express = require('express');
const db = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendVerificationEmail } = require('./emailService');

require('dotenv').config();

const router = express.Router();

// Registro manual (email/contraseña)
router.post('/', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    if (username.includes(" ") || username.length > 30) {
      return res.status(400).json({ error: 'Nombre de usuario inválido' });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{10,100}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error: 'La contraseña debe tener entre 10 y 100 caracteres, incluir al menos una mayúscula y un número.'
      });
    }

    const [existingUsers] = await db.query(
      'SELECT * FROM usuarios WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUsers.find(u => u.username === username)) {
      return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
    }

    if (existingUsers.find(u => u.email === email)) {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [insertResult] = await db.query(
      'INSERT INTO usuarios (username, nombre, email, password, proveedor, verificado) VALUES (?, ?, ?, ?, "email", 0)',
      [username, username, email, hashedPassword]
    );

    const userId = insertResult.insertId;
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1d' });

    await sendVerificationEmail(email, token);

    return res.status(201).json({
      message: 'Usuario registrado correctamente. Verifica tu correo electrónico para activar tu cuenta.'
    });

  } catch (error) {
    console.error('Error en el registro manual:', error);
    return res.status(500).json({ error: 'Este usuario ya está registrado. Usa otra cuenta diferente' });
  }
});

// Registro con Google (vía Firebase)
router.post('/google', async (req, res) => {
  const { uid, email, nombre, foto_perfil } = req.body;

  if (!uid || !email) {
    return res.status(400).json({ error: 'Faltan datos de Google' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM usuarios WHERE uid = ?', [uid]);

    if (rows.length > 0) {
      return res.status(400).json({ error: 'Este usuario ya está registrado. Inicia sesión con Google.' });
    }

    const username = email.split('@')[0].toLowerCase().replace(/\W/g, '');

    const [result] = await db.query(
      `INSERT INTO usuarios (uid, email, nombre, foto_perfil, proveedor, username, verificado)
       VALUES (?, ?, ?, ?, 'google', ?, 1)`,
      [uid, email, nombre, foto_perfil, username]
    );

    const [newUserRows] = await db.query('SELECT * FROM usuarios WHERE id = ?', [result.insertId]);
    const usuario = newUserRows[0];

    const token = jwt.sign({ id: usuario.id, email: usuario.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: usuario });

  } catch (error) {
    console.error('Error en registro con Google:', error);
    res.status(500).json({ error: 'Error al registrarse con Google. Este correo ya está en uso.' });
  }
});

module.exports = router;
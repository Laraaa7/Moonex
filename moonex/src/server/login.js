require('dotenv').config();
const express = require('express');
const db = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Función para enviar correo de verificación
const sendVerificationEmail = async (email, userId) => {
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1d' });
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  const msg = {
    to: email,
    from: 'noreply@moonex.com',
    subject: 'Verifica tu cuenta Moonex',
    html: `
      <h2>Bienvenido a Moonex</h2>
      <p>Haz clic en el siguiente enlace para verificar tu cuenta:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
    `
  };

  await sgMail.send(msg);
};

// Login con email + contraseña
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

    // Verificar si es cuenta de Google
    if (!user.password) {
      return res.status(401).json({ error: 'Este usuario se registró con Google' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

    if (user.verificado === 0) {
      const { password: _, ...userSinPassword } = user;
      return res.status(403).json({
        error: 'Debes verificar tu correo antes de iniciar sesión.',
        user: userSinPassword
      });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

    const { password: _, ...userSinPassword } = user;
    res.json({ token, user: userSinPassword });

  } catch (error) {
    console.error('Error en login manual:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// Login con Google
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
    res.status(500).json({ error: 'Error al iniciar sesión con Google. Este correo ya está en uso. Usa otra cuenta diferente' });
  }
});

// Reenviar correo de verificación
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Correo requerido' });
  }

  try {
    const [rows] = await db.query('SELECT id, verificado FROM usuarios WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Correo no registrado.' });
    }

    const usuario = rows[0];

    if (usuario.verificado === 1) {
      return res.status(400).json({ error: 'Este usuario ya está verificado.' });
    }

    await sendVerificationEmail(email, usuario.id);
    res.status(200).json({ message: 'Correo reenviado correctamente.' });
  } catch (err) {
    console.error('Error al reenviar verificación:', err);
    res.status(500).json({ error: 'Error del servidor al reenviar correo.' });
  }
});

module.exports = router;
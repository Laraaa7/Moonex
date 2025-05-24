const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('./db');
const sgMail = require('@sendgrid/mail');
require('dotenv').config();

const router = express.Router();

// Configurar SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Función que envía el correo con el enlace de verificación
const sendVerificationEmail = async (email, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1d' });

  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const msg = {
    to: email,
    from: process.env.SENDGRID_SENDER, // Usa el remitente real de tu cuenta
    subject: 'Verifica tu cuenta Moonex',
    html: `
      <h2>Bienvenido a Moonex</h2>
      <p>Haz clic en el siguiente enlace para verificar tu cuenta:</p>
      <a href="${verificationUrl}" target="_blank">${verificationUrl}</a>
      <p>Este enlace expirará en 24 horas.</p>
    `,
  };

  await sgMail.send(msg);
};

// Ruta GET: Verificación del token cuando el usuario hace clic en el enlace
router.get('/', async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send('Token no proporcionado.');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const [rows] = await db.query('SELECT verificado FROM usuarios WHERE id = ?', [userId]);

    if (rows.length === 0) {
      return res.status(404).send('Usuario no encontrado.');
    }

    if (rows[0].verificado === 1) {
      return res.send('Correo ya verificado. Ya puedes iniciar sesión.');
    }

    await db.query('UPDATE usuarios SET verificado = 1 WHERE id = ?', [userId]);

    return res.send('Correo verificado correctamente. Ya puedes iniciar sesión.');
  } catch (err) {
    console.error('Error al verificar el correo:', err.message);
    return res.status(400).send('Token inválido o expirado.');
  }
});

// Ruta POST: Reenvío del correo de verificación
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Correo requerido.' });
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

    return res.status(200).json({ message: 'Correo reenviado correctamente.' });
  } catch (err) {
    console.error('Error al reenviar verificación:', err);
    return res.status(500).json({ error: 'Error del servidor al reenviar el correo.' });
  }
});

module.exports = router;
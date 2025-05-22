const express = require('express');
const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');
const db = require('./db');
const router = express.Router();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

router.post('/', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'El correo es obligatorio.' });
  }

  try {
    const [users] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'Este correo no está registrado.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiracion = new Date(Date.now() + 3600000); // 1 hora

    await db.query(
      'INSERT INTO tokens_reset (email, token, expiracion) VALUES (?, ?, ?)',
      [email, token, expiracion]
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    const msg = {
      to: email,
      from: process.env.SENDGRID_SENDER,
      subject: 'Recuperación de contraseña - Moonex',
      html: `
        <h2>Recuperación de contraseña</h2>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>Este enlace expirará en 1 hora.</p>
      `,
    };

    await sgMail.send(msg);

    res.json({ message: 'Enlace de recuperación enviado al correo si está registrado.' });
  } catch (error) {
    console.error('Error en /recuperar:', error.response?.body || error.message);
    res.status(500).json({ error: 'Error al enviar correo. Verifica tu cuenta de SendGrid.' });
  }
});

module.exports = router;
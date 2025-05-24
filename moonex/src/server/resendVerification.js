const express = require('express');
const crypto = require('crypto');
const db = require('./db');
const router = express.Router();
const sgMail = require('@sendgrid/mail');

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

    const usuario = users[0];

    if (usuario.verificado === 1) {
      return res.status(400).json({ error: 'Este correo ya ha sido verificado.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiracion = new Date(Date.now() + 3600000); // 1 hora

    await db.query(
      'INSERT INTO tokens_verificacion (email, token, expiracion) VALUES (?, ?, ?)',
      [email, token, expiracion]
    );

    const enlace = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    const msg = {
      to: email,
      from: process.env.SENDGRID_SENDER,
      subject: 'Verifica tu correo electrónico',
      html: `
        <h2>¡Hola!</h2>
        <p>Haz clic en el siguiente enlace para verificar tu cuenta:</p>
        <a href="${enlace}">${enlace}</a>
        <p>Este enlace expirará en 1 hora.</p>
      `,
    };

    await sgMail.send(msg);
    res.json({ message: 'Correo de verificación reenviado correctamente.' });
  } catch (error) {
    console.error('Error en resend-verification:', error.response?.body || error);
    res.status(500).json({ error: 'Error del servidor al reenviar verificación.' });
  }
});

module.exports = router;
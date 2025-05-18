const sgMail = require('@sendgrid/mail');
require('dotenv').config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendVerificationEmail = async (to, token) => {
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const msg = {
    to,
    from: process.env.SENDGRID_SENDER, // este correo ya está verificado
    subject: 'Verifica tu cuenta en Moonex',
    html: `
      <h2>Bienvenido a Moonex</h2>
      <p>Haz clic en el siguiente enlace para verificar tu cuenta:</p>
      <a href="${verificationLink}">${verificationLink}</a>
    `,
  };
 console.log("Enviando correo a:", to);
  console.log("Link:", verificationLink);
  await sgMail.send(msg);
};

module.exports = { sendVerificationEmail };

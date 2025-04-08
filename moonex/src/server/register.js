const express = require('express');
const db = require('./db');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Endpoint para registrar usuario
router.post('/', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
    
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,12}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error: 'La contraseña debe tener entre 6 y 12 caracteres, incluir al menos una mayúscula y un número.'
      });
    }
    
    // Verificar si el correo o el username ya existen
    db.query('SELECT * FROM usuarios WHERE email = ? OR username = ?', [email, username], async (err, results) => {
      if (err) {
        console.error('Error en la base de datos:', err);
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      
      if (results.length > 0) {
        const existsUsername = results.find(u => u.username === username);
        const existsEmail = results.find(u => u.email === email);
        
        if (existsUsername) {
          return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
        }
        
        if (existsEmail) {
          return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
        }
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Insertar usuario con nombre = username y proveedor = 'email'
      db.query(
        'INSERT INTO usuarios (username, nombre, email, password, proveedor) VALUES (?, ?, ?, ?, "email")',
        [username, username, email, hashedPassword],
        (err, result) => {
          if (err) {
            console.error('Error insertando usuario:', err);
            return res.status(500).json({ error: 'Error al registrar usuario' });
          }
          
          // Obtener usuario recién creado
          db.query('SELECT id, username, nombre, email, proveedor FROM usuarios WHERE id = ?', [result.insertId], (err, users) => {
            if (err || users.length === 0) {
              return res.status(500).json({ error: 'Registrado, pero no se pudo recuperar el perfil' });
            }
            
            const user = users[0];
            // Add a token for consistency with social logins
            const token = `user_${user.id}_${Date.now()}`;
            
            res.status(201).json({
              message: 'Usuario registrado con éxito',
              user: {
                ...user,
                token // Include a token in the response
              }
            });
          });
        }
      );
    });
  } catch (error) {
    console.error('Error en el registro:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
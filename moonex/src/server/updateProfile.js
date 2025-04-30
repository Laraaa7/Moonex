  const express = require('express');
  const db = require('./db');

  const router = express.Router();

  // Endpoint para verificar si un username está disponible
  router.get('/check-username', (req, res) => {
    const { username } = req.query;
    
    if (!username) {
      return res.status(400).json({ error: 'Se requiere un nombre de usuario' });
    }
    
    db.query('SELECT id FROM usuarios WHERE username = ?', [username], (err, results) => {
      if (err) {
        console.error('Error al verificar username:', err);
        return res.status(500).json({ error: 'Error al verificar disponibilidad del username' });
      }
      
      if (results.length > 0) {
        return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
      }
      
      return res.status(200).json({ available: true, message: 'Nombre de usuario disponible' });
    });
  });

  // Endpoint para actualizar el perfil del usuario
  router.put('/updateProfile/:id', (req, res) => {
    const userId = req.params.id;
    const { nombre, username, nacimiento, ubicacion, foto_perfil, banner } = req.body;
    
    if (!nombre || !username) {
      return res.status(400).json({ error: 'El nombre y el username son obligatorios' });
    }
    
    // Verificar que el username no esté en uso por otro usuario
    db.query('SELECT id FROM usuarios WHERE username = ? AND id != ?', [username, userId], (err, results) => {
      if (err) {
        console.error('Error al verificar username:', err);
        return res.status(500).json({ error: 'Error al verificar el nombre de usuario' });
      }
      
      if (results.length > 0) {
        return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
      }
      
      // Actualizar los datos del perfil
      db.query(
        'UPDATE usuarios SET nombre = ?, username = ?, fecha_nacimiento = ?, ubicacion = ?, foto_perfil = ?, banner = ? WHERE id = ?',
        [nombre, username, nacimiento, ubicacion, foto_perfil, banner, userId],
        (err, result) => {
          if (err) {
            console.error('Error al actualizar perfil:', err);
            return res.status(500).json({ error: 'Error del servidor al actualizar el perfil' });
          }
          
          if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
          }
          
          // Consultar nuevamente el usuario actualizado incluyendo username
          db.query(
            'SELECT id, username, nombre, email, foto_perfil, ubicacion, fecha_nacimiento, banner FROM usuarios WHERE id = ?',
            [userId],
            (err, users) => {
              if (err) {
                console.error('Error al obtener datos actualizados:', err);
                return res.status(200).json({
                  message: 'Perfil actualizado con éxito, pero no se pudieron recuperar los datos actualizados'
                });
              }
              
              if (users.length === 0) {
                return res.status(404).json({ error: 'Usuario no encontrado después de actualización' });
              }
              
              return res.status(200).json({
                message: 'Perfil actualizado con éxito',
                user: users[0]
              });
            }
          );
        }
      );
    });
  });

  // Endpoint para obtener los datos públicos de un usuario por username
  router.get('/username/:username', (req, res) => {
    const { username } = req.params;

    db.query(
      'SELECT id, username, nombre, foto_perfil, banner, fecha_nacimiento, ubicacion FROM usuarios WHERE username = ?',
      [username],
      (err, results) => {
        if (err) {
          console.error('Error al obtener datos del usuario:', err);
          return res.status(500).json({ error: 'Error al obtener usuario' });
        }

        if (results.length === 0) {
          return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        return res.status(200).json(results[0]);
      }
    );
  });


  module.exports = router;
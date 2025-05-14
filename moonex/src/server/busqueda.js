const express = require("express");
const router = express.Router();
const db = require("./db"); 

router.get("/", (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Falta el parámetro query" });
  }

  // Buscar usuarios
  const sqlUsuarios = `
  SELECT id, nombre, username, foto_perfil
  FROM usuarios
  WHERE nombre LIKE ? OR username LIKE ?
  LIMIT 10
`;

  db.query(sqlUsuarios, [`%${query}%`, `%${query}%`], (errUsuarios, usuarios) => {
    if (errUsuarios) {
      console.error("Error buscando usuarios:", errUsuarios);
      return res.status(500).json({ error: "Error buscando usuarios" });
    }

    // Buscar posts
    const sqlPosts = `
      SELECT id, titulo, fecha_publicacion
      FROM publicaciones
      WHERE titulo LIKE ?
      ORDER BY fecha_publicacion DESC
      LIMIT 10

  `;
  

    db.query(sqlPosts, [`%${query}%`], (errPosts, posts) => {
      if (errPosts) {
        console.error("Error buscando posts:", errPosts);
        return res.status(500).json({ error: "Error buscando posts" });
      }

      res.json({
        usuarios,
        posts,
      });
    });
  });
});

module.exports = router;

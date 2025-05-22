const express = require("express");
const router = express.Router();
const db = require("./db");

router.get("/", async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Falta el parámetro query" });
  }

  try {
    console.log("Ejecutando búsqueda de usuarios...");
    // Buscar usuarios
    const [usuarios] = await db.query(
      `
        SELECT id, nombre, username, foto_perfil
        FROM usuarios
        WHERE nombre LIKE ? OR username LIKE ?
        LIMIT 10
      `,
      [`%${query}%`, `%${query}%`]
    );

    console.log("Ejecutando búsqueda de posts...");
    // Buscar posts
    const [posts] = await db.query(
      `
        SELECT id, titulo, fecha_publicacion
        FROM publicaciones
        WHERE titulo LIKE ?
        ORDER BY fecha_publicacion DESC
        LIMIT 10
      `,
      [`%${query}%`]
    );

    res.json({ usuarios, posts });

  } catch (error) {
    console.error("Error durante la búsqueda:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

module.exports = router;

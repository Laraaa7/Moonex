import React, { useState } from "react";
import "./Comentarios.css";

const API_URL = process.env.REACT_APP_API_URL;

const Comentarios = ({ postId, cerrarComentarios }) => {
  const [nuevoComentario, setNuevoComentario] = useState("");
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (nuevoComentario.trim() === "" || !currentUser.id) return;

    try {
      const res = await fetch(`${API_URL}/comentarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id: currentUser.id,
          publicacion_id: postId,
          contenido: nuevoComentario,
        }),
      });

      if (!res.ok) throw new Error("Error al comentar");
      setNuevoComentario("");
      cerrarComentarios(); // cerrar el modal tras comentar
    } catch (error) {
      console.error("Error al enviar comentario:", error);
    }
  };

  return (
    <div className="comments-container" onClick={(e) => e.stopPropagation()}>
      <div className="comments-divider"></div>

      <form className="comments-form" onSubmit={handleSubmit}>
        <textarea
          value={nuevoComentario}
          onChange={(e) => setNuevoComentario(e.target.value)}
          placeholder="Escribe un comentario..."
        ></textarea>
        <button type="submit">Comentar</button>
      </form>
    </div>
  );
};

export default Comentarios;

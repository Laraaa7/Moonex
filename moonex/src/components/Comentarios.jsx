import React, { useState } from "react";
import "./Comentarios.css";
import { FaTimes} from "react-icons/fa";

const Comentarios = ({ postId, comentarios, agregarComentario, cerrarComentarios }) => {
  const [nuevoComentario, setNuevoComentario] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (nuevoComentario.trim() === "") return;
    agregarComentario(postId, nuevoComentario);
    setNuevoComentario("");
  };

  return (
    <div className="comentarios-container">
      <button className="cerrar-btn" onClick={cerrarComentarios}>
        <FaTimes/> 
      </button>

      <ul className="comentarios-lista">
        {comentarios.length === 0 ? (
          <p>No hay comentarios aún.</p>
        ) : (
          comentarios.map((comentario, index) => (
            <li key={index} className="comentario">
              <strong>{comentario.usuario}</strong>
              <p>{comentario.texto}</p>
            </li>
          ))
        )}
      </ul>

      <form className="comentario-form" onSubmit={handleSubmit}>
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

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MdFavorite, MdFavoriteBorder } from "react-icons/md";
import { FaReply } from "react-icons/fa";
import defaultProfile from "../img/PfpDefecto.png";
import "./Respuestas.css";

const API_URL = process.env.REACT_APP_API_URL;

const Respuestas = ({ comentarioId, currentUser }) => {
  const [respuestas, setRespuestas] = useState([]);
  const [subrespuestas, setSubrespuestas] = useState({});
  const [mostrarForm, setMostrarForm] = useState({});
  const [textoRespuestas, setTextoRespuestas] = useState({});
  const [likes, setLikes] = useState({});
  const [mostrarRespuestas, setMostrarRespuestas] = useState({});
  const [respuestaAEliminar, setRespuestaAEliminar] = useState(null);
  const userId = currentUser?.id;

  useEffect(() => {
    if (comentarioId) cargarTodo();
  }, [comentarioId]);

  const cargarTodo = async () => {
    try {
      const res = await fetch(`${API_URL}/respuestas/comentario/${comentarioId}`);
      const data = await res.json();
      setRespuestas(data);
      const subresMap = await cargarSubrespuestasRecursivo(data);
      setSubrespuestas(subresMap);
      const todasLasRespuestas = [...data];
      Object.values(subresMap).forEach(lista => todasLasRespuestas.push(...lista));
      await fetchLikes(todasLasRespuestas);
    } catch (err) {
      console.error("Error al obtener respuestas:", err);
    }
  };

  const cargarSubrespuestasRecursivo = async (lista) => {
    const map = {};
    const stack = [...lista];
    while (stack.length > 0) {
      const actual = stack.pop();
      const res = await fetch(`${API_URL}/respuestas/subrespuestas/${actual.id}`);
      const hijos = await res.json();
      if (hijos.length > 0) {
        map[actual.id] = hijos;
        stack.push(...hijos);
      }
    }
    return map;
  };

  const fetchLikes = async (respuestasList) => {
    try {
      const [usuarioLikesRes, conteoRes] = await Promise.all([
        fetch(`${API_URL}/respuestas/likes/usuario/${userId}`),
        fetch(`${API_URL}/respuestas/likes/conteo`)
      ]);
      const usuarioLikes = await usuarioLikesRes.json();
      const conteos = await conteoRes.json();
      const likesMap = {};
      respuestasList.forEach(r => {
        likesMap[r.id] = {
          liked: usuarioLikes.some(l => l.respuesta_id === r.id),
          count: conteos.find(c => c.respuesta_id === r.id)?.count || 0
        };
      });
      setLikes(likesMap);
    } catch (err) {
      console.error("Error al cargar likes de respuestas:", err);
    }
  };

  const manejarLike = async (respuestaId) => {
    const isLiked = likes[respuestaId]?.liked || false;
    const count = likes[respuestaId]?.count || 0;
    setLikes(prev => ({
      ...prev,
      [respuestaId]: {
        liked: !isLiked,
        count: isLiked ? count - 1 : count + 1
      }
    }));
    try {
      await fetch(`${API_URL}/respuestas/likes`, {
        method: isLiked ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario_id: userId, respuesta_id: respuestaId })
      });
    } catch (err) {
      console.error("Error al cambiar estado de like:", err);
    }
  };

  const enviarRespuesta = async (padreId, esSubrespuesta = false) => {
    const texto = textoRespuestas[padreId]?.trim();
    if (!texto) return;
    try {
      await fetch(`${API_URL}/respuestas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id: userId,
          contenido: texto,
          comentario_id: comentarioId,
          ...(esSubrespuesta && { respuesta_padre_id: padreId })
        })
      });
      setTextoRespuestas(prev => ({ ...prev, [padreId]: "" }));
      setMostrarForm(prev => ({ ...prev, [padreId]: false }));
      await cargarTodo();
    } catch (err) {
      console.error("Error al enviar respuesta:", err);
    }
  };

  const eliminarRespuesta = async (respuestaId) => {
    try {
      const res = await fetch(`${API_URL}/respuestas/${respuestaId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error al eliminar respuesta");
      await cargarTodo();
    } catch (err) {
      console.error("Error al eliminar respuesta:", err);
    }
  };

  const formatearFecha = (fecha) => {
    const dateUTC = new Date(fecha);
    const date = new Date(dateUTC.getTime() + 2 * 60 * 60 * 1000);
    const ahora = new Date();
    const diff = Math.floor((ahora - date) / 1000);
    if (diff < 60) return `${diff}s`;
    const min = Math.floor(diff / 60);
    if (min < 60) return `${min}min`;
    const h = Math.floor(min / 60);
    if (h < 24) return `${h}h`;
    const d = Math.floor(h / 24);
    return `${d}d`;
  };

  const toggleForm = (id) => setMostrarForm(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleMostrarRespuestas = (id) => setMostrarRespuestas(prev => ({ ...prev, [id]: !prev[id] }));
  const handleInputChange = (id, value) => setTextoRespuestas(prev => ({ ...prev, [id]: value }));

  const renderRespuesta = (respuesta, esSub = false) => (
    <div key={respuesta.id} className={`respuesta-item ${esSub ? "subrespuesta" : ""}`}>
    <div className="respuesta-header">
      <Link to={`/perfilDeUsuario/${respuesta.username}`}>
        <img src={respuesta.foto_perfil || defaultProfile} alt="avatar" className="respuesta-avatar" />
      </Link>
      <div className="respuesta-userinfo">
        <Link to={`/perfilDeUsuario/${respuesta.username}`} className="respuesta-nombre-link">
          <span className="respuesta-nombre">{respuesta.nombre}</span>
        </Link>
        <Link to={`/perfilDeUsuario/${respuesta.username}`} className="respuesta-username-link">
          <span className="respuesta-username">@{respuesta.username}</span>
        </Link>
        <span className="respuesta-fecha">· {formatearFecha(respuesta.fecha_respuesta)}</span>
      </div>
    </div>

      <div className="respuesta-texto">{respuesta.contenido}</div>
      <div className="respuesta-actions">
        <span
          className={`respuesta-like-btn ${likes[respuesta.id]?.liked ? "liked" : ""}`}
          onClick={() => manejarLike(respuesta.id)}
        >
          {likes[respuesta.id]?.liked
            ? <MdFavorite className="like-icon-small active" />
            : <MdFavoriteBorder className="like-icon-small" />} {likes[respuesta.id]?.count || 0}
        </span>
        <span className="respuesta-reply-btn" onClick={() => toggleForm(respuesta.id)}>
          <FaReply className="reply-icon-small" /> Responder
        </span>
        {subrespuestas[respuesta.id]?.length > 0 && (
          <span className="respuesta-toggle-sub" onClick={() => toggleMostrarRespuestas(respuesta.id)}>
            {mostrarRespuestas[respuesta.id]
              ? "Ocultar respuestas"
              : `Ver respuestas (${subrespuestas[respuesta.id].length})`}
          </span>
        )}
        {currentUser?.id === respuesta.usuario_id && (
          <span
            className="comentario-accion-pequena respuesta-eliminar-btn"
            onClick={() => setRespuestaAEliminar(respuesta.id)}
            style={{ color: "#ff6b6b", marginLeft: "auto" }}
          >
            Eliminar
          </span>
        )}
      </div>

      {mostrarForm[respuesta.id] && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            enviarRespuesta(respuesta.id, true);
          }}
          className="respuesta-form"
        >
          <input
            type="text"
            placeholder="Escribe una respuesta..."
            value={textoRespuestas[respuesta.id] || ""}
            onChange={(e) => handleInputChange(respuesta.id, e.target.value)}
            className="respuesta-input"
          />
          <button type="submit" className="respuesta-submit">Enviar</button>
        </form>
      )}

      {mostrarRespuestas[respuesta.id] && subrespuestas[respuesta.id]?.length > 0 && (
        <div className="respuestas-sublista">
          {subrespuestas[respuesta.id].map((sub) => renderRespuesta(sub, true))}
        </div>
      )}
    </div>
  );

  return (
    <div className="respuestas-container">
      {respuestas.map((respuesta) => renderRespuesta(respuesta))}

      {respuestaAEliminar && (
        <div className="modal-overlay">
          <div className="ddelete-confirmation-modal">
            <h4>¿Eliminar respuesta?</h4>
            <p>Esta acción es permanente y no se puede deshacer.</p>
            <div className="modal-buttons">
              <button className="cancel-button" onClick={() => setRespuestaAEliminar(null)}>Cancelar</button>
              <button
                className="confirm-button"
                onClick={async () => {
                  await eliminarRespuesta(respuestaAEliminar);
                  setRespuestaAEliminar(null);
                }}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Respuestas;

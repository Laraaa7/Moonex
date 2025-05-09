import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./PostsUsuario.css";

const PostsUsuario = ({ usuarioId }) => {
  const [allPosts, setAllPosts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(6);
  const [loading, setLoading] = useState(true);
  const [autorUsername, setAutorUsername] = useState("");

  const navigate = useNavigate();
  const topRef = useRef(null);

  useEffect(() => {
    if (!usuarioId) {
      setLoading(false);
      return;
    }

    const fetchPosts = async () => {
      try {
        const res = await fetch("/posts");  // CAMBIO aquí
        const all = await res.json();
        const filtered = all.filter(
          (post) => post.usuario_id === usuarioId || post.user_id === usuarioId
        );
        const ordered = filtered.sort(
          (a, b) => new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion)
        );
        setAllPosts(ordered);

        if (filtered.length > 0) {
          setAutorUsername(filtered[0].username);
        }
      } catch (err) {
        console.error("Error al obtener posts:", err);
        setAllPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [usuarioId]);

  const handleVerMas = () => {
    setVisibleCount((prev) => prev + 6);
  };

  const handleVerMenos = () => {
    setVisibleCount(6);
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const formatearTiempoPublicacion = (fechaString) => {
    const publicadaUTC = new Date(fechaString);
    const publicada = new Date(publicadaUTC.getTime() + 2 * 60 * 60 * 1000);
    const ahora = new Date();
    const diffSegundos = Math.floor((ahora - publicada) / 1000);
    const minutos = Math.floor(diffSegundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);
    const meses = Math.floor(dias / 30);
    const años = Math.floor(dias / 365);

    if (diffSegundos < 60) return `${diffSegundos}s`;
    if (minutos < 60) return `${minutos}min`;
    if (horas < 24) return `${horas}h`;
    if (dias < 30) return `${dias}d`;
    if (meses < 12) return `${meses}mes${meses > 1 ? "es" : ""}`;
    return `${años}año${años > 1 ? "s" : ""}`;
  };

  return (
    <div className="posts-section">
      <h3 ref={topRef}>
        {autorUsername
          ? `Posts de @${autorUsername}`
          : `Posts de @${autorUsername}`}
      </h3>
      {loading ? (
        <>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="post-card loading-card" />
          ))}
          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <button className="ver-mas-btn loading-btn" disabled>
              Ver más
            </button>
          </div>
        </>
      ) : allPosts.length > 0 ? (
        <>
          <div className="posts-scroll-container">
            {allPosts.slice(0, visibleCount).map((post) => (
              <div
                key={post.id}
                className="post-card"
                onClick={() => navigate(`/verPost/${post.id}`)}
                style={{ cursor: "pointer" }}
              >
                <div className="post-titulo-fecha">
                  <h4>{post.titulo}</h4>
                  <span className="post-fecha">· {formatearTiempoPublicacion(post.fecha_publicacion)}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            {visibleCount < allPosts.length && (
              <button className="ver-mas-btn" onClick={handleVerMas}>
                Ver más
              </button>
            )}
            {visibleCount > 6 && (
              <button className="ver-mas-btn" onClick={handleVerMenos}>
                Ver menos
              </button>
            )}
          </div>
        </>
      ) : (
        <p>No hay publicaciones recientes.</p>
      )}
    </div>
  );
};

export default PostsUsuario;

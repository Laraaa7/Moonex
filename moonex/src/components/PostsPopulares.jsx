import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PostsPopulares.css";

const PostsPopulares = () => {
  const [postsPopulares, setPostsPopulares] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPopulares = async () => {
      try {
        const res = await fetch("http://localhost:5000/posts");
        const data = await res.json();

        const ordenados = data
          .filter((post) => (post.comentarios_count || 0) + (post.likes_count || 0) > 0)
          .map((post) => ({
            ...post,
            puntuacion: (post.comentarios_count || 0) * 2 + (post.likes_count || 0),
          }))
          .sort((a, b) => b.puntuacion - a.puntuacion)
          .slice(0, 7); // Top 7

        setPostsPopulares(ordenados);
      } catch (err) {
        console.error("Error al cargar posts populares:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPopulares();
  }, []);

  const formatearTiempo = (fechaString) => {
    const publicadaUTC = new Date(fechaString);
    const publicada = new Date(publicadaUTC.getTime() + 2 * 60 * 60 * 1000);
    const ahora = new Date();
    const diff = Math.floor((ahora - publicada) / 1000);
    const min = Math.floor(diff / 60);
    const h = Math.floor(min / 60);
    const d = Math.floor(h / 24);
    const m = Math.floor(d / 30);
    const a = Math.floor(d / 365);
    if (diff < 60) return `${diff}s`;
    if (min < 60) return `${min}min`;
    if (h < 24) return `${h}h`;
    if (d < 30) return `${d}d`;
    if (m < 12) return `${m}mes${m > 1 ? "es" : ""}`;
    return `${a}año${a > 1 ? "s" : ""}`;
  };

  return (
    <div className="posts-populares">
      <h3>Posts populares</h3>
      {loading ? (
        Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="post-card loading-card" />
        ))
      ) : postsPopulares.length > 0 ? (
        <div className="posts-scroll-container">
          {postsPopulares.map((post) => (
            <div
              key={post.id}
              className="post-card"
              onClick={() => navigate(`/verPost/${post.id}`)}
              style={{ cursor: "pointer" }}
            >
              <div className="post-titulo-fecha">
                <h4>{post.titulo}</h4>
                <span className="post-fecha">· {formatearTiempo(post.fecha_publicacion)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No hay posts populares todavía.</p>
      )}
    </div>
  );
};

export default PostsPopulares;

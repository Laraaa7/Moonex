import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Barranav from "../components/Barranav";
import { FaRegComment, FaReply } from "react-icons/fa";
import { MdFavorite, MdFavoriteBorder } from "react-icons/md";
import VistaEnlace from "../components/VistaEnlace";
import ImageGrid from "../components/ImageGrid";
import ScrollArriba from "../components/ScrollArriba";
import AQuienSeguir from "../components/AQuienSeguir";
import PostButton from "../components/PostButton";
import PostsUsuario from "../components/PostsUsuario";
import defaultProfile from "../img/PfpDefecto.png";
import Respuestas from "../components/Respuestas";
import "./VerPost.css";

const VerPost = () => {
  const { id: postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comentarioLikes, setComentarioLikes] = useState({});
  const [mostrarFormularioRespuesta, setMostrarFormularioRespuesta] = useState({});
  const [mostrarRespuestas, setMostrarRespuestas] = useState({});
  const [respuestasTexto, setRespuestasTexto] = useState({});
  const [conteoRespuestas, setConteoRespuestas] = useState({});
 
  const API_URL = process.env.REACT_APP_API_URL;

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = currentUser?.id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postRes, comentariosRes] = await Promise.all([
          fetch(`${API_URL}/posts/${postId}`),
          fetch(`${API_URL}/comentarios/${postId}`)
        ]);
        const postData = await postRes.json();
        const comentariosData = await comentariosRes.json();
        setPost(postData);
        setComentarios(comentariosData);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchLikes = async () => {
      if (!postId || !userId) return;
      try {
        const [likesRes, userLikesRes] = await Promise.all([
          fetch(`${API_URL}/likes/${postId}`),
          fetch(`${API_URL}/likes/usuario/${userId}`)
        ]);
        const likesData = await likesRes.json();
        const userLikedPosts = await userLikesRes.json();
        setLikeCount(likesData.length || 0);
        setLiked(userLikedPosts.includes(Number(postId)));
      } catch (err) {
        console.error("Error al obtener likes:", err);
      }
    };

    fetchData();
    fetchLikes();
  }, [postId, userId]);

  useEffect(() => {
    if (comentarios.length > 0 && userId) {
      fetchLikesComentarios();
      fetchConteoRespuestas();
    }
  }, [comentarios, userId]);

  const fetchLikesComentarios = async () => {
    try {
      const [usuarioLikesRes, conteoRes] = await Promise.all([
        fetch(`${API_URL}/comentarios/likes/usuario/${userId}`),
        fetch(`${API_URL}/comentarios/likes/conteo`)
      ]);
      const usuarioLikes = await usuarioLikesRes.json();
      const conteos = await conteoRes.json();

      const map = {};
      comentarios.forEach(c => {
        map[c.id] = {
          liked: usuarioLikes.some(l => l.comentario_id === c.id),
          count: conteos.find(cnt => cnt.comentario_id === c.id)?.count || 0
        };
      });
      setComentarioLikes(map);
    } catch (err) {
      console.error("Error al cargar likes de comentarios:", err);
    }
  };

  const fetchConteoRespuestas = async () => {
    try {
      const res = await fetch(`${API_URL}/comentarios/conteo`);
      const data = await res.json();
      const map = {};
      data.forEach(item => {
        map[item.comentario_id.toString()] = item.count;
      });
      setConteoRespuestas(map);
    } catch (err) {
      console.error("Error al obtener conteo de respuestas:", err);
    }
  };
  

  const manejarLikeComentario = async (comentarioId) => {
    const isLiked = comentarioLikes[comentarioId]?.liked || false;
    const count = comentarioLikes[comentarioId]?.count || 0;

    setComentarioLikes(prev => ({
      ...prev,
      [comentarioId]: {
        liked: !isLiked,
        count: isLiked ? count - 1 : count + 1
      }
    }));

    try {
      await fetch(`${API_URL}/comentarios/likes`, {
        method: isLiked ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario_id: userId, comentario_id: comentarioId })
      });
    } catch (err) {
      console.error("Error al cambiar like de comentario:", err);
    }
  };

  const agregarComentario = async (e) => {
    e.preventDefault();
    if (nuevoComentario.trim() === "" || !userId) return;

    try {
      const res = await fetch(`${API_URL}/comentarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id: userId,
          publicacion_id: postId,
          contenido: nuevoComentario,
        }),
      });

      if (!res.ok) throw new Error("Error al comentar");

      const nuevo = await res.json();
      setComentarios(prev => [
        ...prev,
        {
          id: nuevo.id,
          username: currentUser.username,
          nombre: currentUser.nombre,
          foto_perfil: currentUser.foto_perfil,
          contenido: nuevoComentario,
          fecha: new Date().toISOString(),
        },
      ]);
      setNuevoComentario("");
    } catch (error) {
      console.error("Error al enviar comentario:", error);
    }
  };

  const enviarRespuestaComentario = async (comentarioId) => {
    const texto = respuestasTexto[comentarioId]?.trim();
    if (!texto) return;

    try {
      const res = await fetch(`${API_URL}/respuestas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id: userId,
          comentario_id: comentarioId,
          contenido: texto,
        }),
      });

      if (!res.ok) throw new Error("Error al responder");

      setRespuestasTexto(prev => ({ ...prev, [comentarioId]: "" }));
      setMostrarFormularioRespuesta(prev => ({ ...prev, [comentarioId]: false }));
      fetchConteoRespuestas();
    } catch (err) {
      console.error("Error al enviar respuesta:", err);
    }
  };

  const formatearTiempo = (fecha) => {
    const publicada = new Date(fecha);
    const ahora = new Date();
    const diff = Math.floor((ahora - publicada) / 1000);
    if (diff < 60) return `${diff}s`;
    const min = Math.floor(diff / 60);
    if (min < 60) return `${min}min`;
    const h = Math.floor(min / 60);
    if (h < 24) return `${h}h`;
    const d = Math.floor(h / 24);
    return `${d}d`;
  };

  const navigateToProfile = (username, userIdParam) => {
    if (!currentUser.username) return navigate("/login");
    if (currentUser.username === username || currentUser.id === userIdParam) {
      navigate("/perfil");
    } else {
      navigate(`/perfilDeUsuario/${username}`);
    }
  };

  const extraerURLs = (html) => {
    if (!html) return [];
    const hrefMatches = [...html.matchAll(/href=["'](https?:\/\/[^"']+)["']/g)].map(m => m[1]);
    const plainMatches = [...html.matchAll(/(?:^|\s|>)(https?:\/\/[^\s<>"]+)(?=\s|<|$)/g)].map(m => m[1]);
    return [...new Set([...hrefMatches, ...plainMatches])];
  };

  const procesarContenido = (contenido) => {
    if (!contenido) return "";
    const sinImagenes = contenido.replace(/<img[^>]*>/g, "");
    const urls = extraerURLs(sinImagenes);
    return urls.reduce((text, url) => text.replace(url, ""), sinImagenes);
  };

  const obtenerImagenesPost = (post) => {
    if (!post) return [];
    const imgRegex = /<img[^>]+src=["']([^"']+)["']/g;
    const imgs = [];
    let match;
    while ((match = imgRegex.exec(post.contenido)) !== null) {
      imgs.push(match[1]);
    }
    return imgs.length > 0 ? imgs : post.imagen ? [post.imagen] : [];
  };

  if (loading) {
    return (
      <div className="verpost-container">
        <Barranav />
        <div className="verpost-content">
          <div className="rueda-contenedor"><div className="rueda" /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="verpost-container">
      <Barranav />
      <div className="verpost-wrapper">
        <div className="sidebar-left-verpost">
          <AQuienSeguir suggestedUsers={[]} />
          <PostButton />
        </div>

        <div className="verpost-content">
          <div className="verpost-card">
            <div className="post-header">
              <img
                src={post.foto_perfil || defaultProfile}
                className="post-avatar"
                alt=""
                onClick={() => navigateToProfile(post.username, post.usuario_id)}
              />
              <div className="post-userinfo" onClick={() => navigateToProfile(post.username, post.usuario_id)}>
                <h3 className="post-nombre">{post.nombre}</h3>
                <h4 className="post-username">@{post.username}</h4>
                <span className="post-time">· {formatearTiempo(post.fecha_publicacion)}</span>
              </div>
            </div>

            <h5 className="post-title">{post.titulo}</h5>
            <div
              className="post-content"
              dangerouslySetInnerHTML={{ __html: procesarContenido(post.contenido) }}
            />
            {extraerURLs(post.contenido).map((url, i) => (
              <VistaEnlace key={i} url={url} />
            ))}
            {obtenerImagenesPost(post).length > 0 && (
              <ImageGrid images={obtenerImagenesPost(post)} />
            )}

            <div className="post-actions">
              <span className={`likes-btn ${liked ? "liked" : ""}`}>
                {liked ? <MdFavorite className="like-icon active" /> : <MdFavoriteBorder className="like-icon" />}
                {likeCount}
              </span>
              <span className="comentarios-btn">
                <FaRegComment /> {comentarios.length}
              </span>
            </div>

            <div className="comentarios-section">
              <h4 className="comentarios-titulo">Comentarios</h4>
              <form onSubmit={agregarComentario} className="comentario-form">
                <input
                  type="text"
                  className="comentario-input"
                  placeholder="Escribe un comentario..."
                  value={nuevoComentario}
                  onChange={(e) => setNuevoComentario(e.target.value)}
                />
                <button type="submit" className="comentario-submit">Comentar</button>
              </form>

              <div className="comentarios-lista">
                {comentarios.length === 0 ? (
                  <p className="no-comentarios">Aún no hay comentarios.</p>
                ) : (
                  comentarios.map((comentario) => (
                    <div key={comentario.id} className="comentario-item">
                      <div className="comentario-header">
                        <img
                          src={comentario.foto_perfil || defaultProfile}
                          alt="avatar"
                          className="comentario-avatar"
                        />
                        <div className="comentario-userinfo">
                          <span className="comentario-nombre">{comentario.nombre}</span>
                          <span className="comentario-username">@{comentario.username}</span>
                          <span className="comentario-fecha">· {formatearTiempo(comentario.fecha)}</span>
                        </div>
                      </div>
                      <div className="comentario-texto">{comentario.contenido}</div>

                      <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
                        <span
                          className={`comentario-like-btn ${comentarioLikes[comentario.id]?.liked ? "liked" : ""}`}
                          onClick={() => manejarLikeComentario(comentario.id)}
                        >
                          {comentarioLikes[comentario.id]?.liked ? (
                            <MdFavorite className="like-icon-small active" />
                          ) : (
                            <MdFavoriteBorder className="like-icon-small" />
                          )}
                          {comentarioLikes[comentario.id]?.count || 0}
                        </span>
                        <span
                          className="comentario-responder"
                          onClick={() =>
                            setMostrarFormularioRespuesta(prev => ({
                              ...prev,
                              [comentario.id]: !prev[comentario.id],
                            }))
                          }
                        >
                          <FaReply /> Responder
                        </span>
                        <span
                        className="comentario-toggle"
                        onClick={() =>
                          setMostrarRespuestas(prev => ({
                            ...prev,
                            [comentario.id]: !prev[comentario.id],
                          }))
                        }
                      >
                        {mostrarRespuestas[comentario.id]
                          ? "Ocultar respuestas"
                          : `Ver respuestas (${conteoRespuestas[comentario.id.toString()] || 0})`}
                      </span>

                      </div>

                      {mostrarFormularioRespuesta[comentario.id] && (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            enviarRespuestaComentario(comentario.id);
                          }}
                          className="respuesta-form"
                        >
                          <input
                            type="text"
                            value={respuestasTexto[comentario.id] || ""}
                            onChange={(e) =>
                              setRespuestasTexto((prev) => ({
                                ...prev,
                                [comentario.id]: e.target.value,
                              }))
                            }
                            placeholder="Escribe una respuesta..."
                            className="respuesta-input"
                          />
                          <button type="submit" className="respuesta-submit">Enviar</button>
                        </form>
                      )}

                      {mostrarRespuestas[comentario.id] && (
                        <Respuestas comentarioId={comentario.id} currentUser={currentUser} />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="sidebar-right-verpost">
          {post.usuario_id && <PostsUsuario usuarioId={post.usuario_id} />}
        </div>
      </div>
      <ScrollArriba />
    </div>
  );
};

export default VerPost;

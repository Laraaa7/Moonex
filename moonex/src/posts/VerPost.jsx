import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Barranav from "../components/Barranav";
import { FaRegComment } from "react-icons/fa";
import { MdFavorite, MdFavoriteBorder } from "react-icons/md";
import VistaEnlace from "../components/VistaEnlace";
import ImageGrid from "../components/ImageGrid";
import ScrollArriba from "../components/ScrollArriba";
import AQuienSeguir from "../components/AQuienSeguir";
import PostButton from "../components/PostButton";
import PostsUsuario from "../components/PostsUsuario";
import defaultProfile from "../img/PfpDefecto.png";
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

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = currentUser?.id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postRes, comentariosRes] = await Promise.all([
          fetch(`/posts/${postId}`), // Cambiado para Render
          fetch(`/comentarios/${postId}`) // Cambiado para Render
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
          fetch(`/likes/${postId}`), // Cambiado para Render
          fetch(`/likes/usuario/${userId}`) // Cambiado para Render
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

  const manejarLike = async () => {
    if (!userId) return navigate("/login");

    try {
      setLiked(prev => !prev);
      setLikeCount(prev => liked ? prev - 1 : prev + 1);

      const res = await fetch("/likes", { // Cambiado para Render
        method: liked ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id: userId,
          publicacion_id: postId
        })
      });

      if (!res.ok) throw new Error("Error al gestionar like");
    } catch (err) {
      console.error("Error al dar/quitar like:", err);
      setLiked(prev => !prev);
      setLikeCount(prev => liked ? prev + 1 : prev - 1);
    }
  };

  const agregarComentario = async (e) => {
    e.preventDefault();
    if (nuevoComentario.trim() === "" || !userId) return;

    try {
      const res = await fetch("/comentarios", { // Cambiado para Render
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
      setComentarios((prev) => [
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

  const extraerURLs = (html) => {
    if (!html) return [];
    const hrefMatches = [...html.matchAll(/href=["'](https?:\/\/[^"']+)["']/g)].map(m => m[1]);
    const plainMatches = [...html.matchAll(/(?:^|\s|>)(https?:\/\/[^\s<>"']+)(?=\s|<|$)/g)].map(m => m[1]);
    return [...new Set([...hrefMatches, ...plainMatches])];
  };

  const procesarContenido = (contenido) => {
    if (!contenido) return "";
    const sinImagenes = contenido.replace(/<img[^>]*>/g, "");
    const urls = extraerURLs(sinImagenes);
    return urls.reduce((text, url) => text.replace(url, ""), sinImagenes);
  };

  const obtenerImagenesPost = (post) => {
    if (!post || (!post.contenido && post.imagen)) return post?.imagen ? [post.imagen] : [];
    const imgRegex = /<img[^>]+src=["']([^"']+)["']/g;
    const imgs = [];
    let match;
    while ((match = imgRegex.exec(post.contenido)) !== null) {
      if (!match[1].includes("defaultProfile") && !match[1].includes("avatar")) {
        imgs.push(match[1]);
      }
    }
    return imgs.length > 0 ? imgs : post.imagen ? [post.imagen] : [];
  };

  const navigateToProfile = (username, userIdParam) => {
    if (!currentUser.username) return navigate("/login");
    if (currentUser.username === username || currentUser.id === userIdParam) {
      navigate("/perfil");
    } else {
      navigate(`/perfilDeUsuario/${username}`);
    }
  };

  const formatearTiempoPublicacion = (fechaString) => {
    const publicada = new Date(fechaString);
    if (isNaN(publicada)) return "Fecha inválida";

    const ahora = new Date();
    const diffSegundos = Math.floor((ahora - publicada) / 1000);

    if (diffSegundos < 60) return `${diffSegundos}s`;
    const minutos = Math.floor(diffSegundos / 60);
    if (minutos < 60) return `${minutos}min`;
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `${horas}h`;
    const dias = Math.floor(horas / 24);
    if (dias < 30) return `${dias}d`;
    const meses = Math.floor(dias / 30);
    if (meses < 12) return `${meses}mes${meses > 1 ? "es" : ""}`;
    const anos = Math.floor(dias / 365);
    return `${anos}año${anos > 1 ? "s" : ""}`;
  };

  const suggestedUsers = [
    { id: 1, username: "Usuario1" },
    { id: 2, username: "Usuario2" },
    { id: 3, username: "Usuario3" },
    { id: 4, username: "Usuario4" },
    { id: 5, username: "Usuario5" },
  ];

  if (loading) {
    return (
      <div className="verpost-container">
        <Barranav />
        <div className="verpost-content">
          <div className="rueda-contenedor"><div className="rueda"></div></div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="verpost-container">
        <Barranav />
        <div className="verpost-content">
          <div className="verpost-error">Post no encontrado.</div>
        </div>
      </div>
    );
  }

  const urls = extraerURLs(post.contenido);
  const contenidoProcesado = procesarContenido(post.contenido);
  const imagenesPost = obtenerImagenesPost(post);

  return (
    <div className="verpost-container">
      <Barranav />
      <div className="verpost-wrapper">
        <div className="sidebar-left-verpost">
          <AQuienSeguir suggestedUsers={suggestedUsers} />
          <PostButton />
        </div>

        <div className="verpost-content">
          <div className="verpost-card">
            <div className="post-content-wrapper">
              <div className="post-text">
                <div className="post-header">
                  <img
                    src={post.foto_perfil || defaultProfile}
                    alt="Perfil"
                    className="post-avatar"
                    onClick={() => navigateToProfile(post.username, post.usuario_id)}
                  />
                  <div
                    className="post-userinfo"
                    onClick={() => navigateToProfile(post.username, post.usuario_id)}
                  >
                    <h3 className="post-nombre">{post.nombre}</h3>
                    <h4 className="post-username">@{post.username}</h4>
                    <span className="post-time">· {formatearTiempoPublicacion(post.fecha_publicacion)}</span>
                  </div>
                </div>

                <h5 className="post-title">{post.titulo}</h5>

                <div
                  className="post-content"
                  dangerouslySetInnerHTML={{ __html: contenidoProcesado }}
                />
                {urls.map((url, i) => <VistaEnlace key={i} url={url} />)}
                {imagenesPost.length > 0 && <ImageGrid images={imagenesPost} />}
              </div>

              <div className="post-actions">
                <span className={`likes-btn ${liked ? "liked" : ""}`} onClick={manejarLike}>
                  {liked ? <MdFavorite className="like-icon active" /> : <MdFavoriteBorder className="like-icon" />}
                  {likeCount}
                </span>
                <span className="comentarios-btn"><FaRegComment /> {comentarios.length}</span>
              </div>

              <div className="comentarios-section">
                <h4 className="comentarios-titulo">Comentarios</h4>
                <form className="comentario-form" onSubmit={agregarComentario}>
                  <input
                    type="text"
                    placeholder="Escribe un comentario..."
                    value={nuevoComentario}
                    onChange={(e) => setNuevoComentario(e.target.value)}
                    className="comentario-input"
                  />
                  <button type="submit" className="comentario-submit">Comentar</button>
                </form>
                <div className="comentarios-lista">
                  {comentarios.length === 0 ? (
                    <p className="no-comentarios">Aún no hay comentarios. ¡Sé el primero en comentar!</p>
                  ) : (
                    comentarios.map((comentario) => (
                      <div key={comentario.id} className="comentario-item">
                        <div className="comentario-header">
                          <img
                            src={
                              comentario.foto_perfil?.startsWith("data:") || comentario.foto_perfil?.startsWith("http")
                                ? comentario.foto_perfil
                                : defaultProfile
                            }
                            alt="avatar"
                            className="comentario-avatar"
                          />
                          <div className="comentario-userinfo">
                            <span className="comentario-nombre">{comentario.nombre}</span>
                            <span className="comentario-username">@{comentario.username}</span>
                            <span className="comentario-fecha">· {formatearTiempoPublicacion(comentario.fecha)}</span>
                          </div>
                        </div>
                        <div className="comentario-texto">{comentario.contenido}</div>
                      </div>
                    ))
                  )}
                </div>
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

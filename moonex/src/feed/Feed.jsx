import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Barranav from "../components/Barranav";
import Comentarios from "../components/Comentarios";
import AQuienSeguir from "../components/AQuienSeguir";
import ScrollArriba from "../components/ScrollArriba";
import { FaRegComment } from "react-icons/fa";
import { MdFavorite, MdFavoriteBorder } from "react-icons/md";
import { FaBars } from "react-icons/fa";
import VistaEnlace from "../components/VistaEnlace";
import ImageGrid from "../components/ImageGrid";
import PostButton from "../components/PostButton";
import PostsPopulares from "../components/PostsPopulares";
import defaultProfile from "../img/PfpDefecto.png";

import "./Feed.css";

function Feed() {
  const navigate = useNavigate();
  const [allPosts, setAllPosts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [comentariosVisibles, setComentariosVisibles] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [likedPosts, setLikedPosts] = useState({});
  const [likeCounts, setLikeCounts] = useState({});
  const postsPerPage = 5;
  const observer = useRef();

  const API_BASE_URL = process.env.REACT_APP_API_URL;

  const [menuAbierto, setMenuAbierto] = useState(false);
  const toggleMenu = () => setMenuAbierto((prev) => !prev);

  const [suggestedUsers] = useState([
    { id: 1, username: "Usuario1" },
    { id: 2, username: "Usuario2" },
    { id: 3, username: "Usuario3" },
    { id: 4, username: "Usuario4" },
    { id: 5, username: "Usuario5" },
  ]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setCurrentUser(JSON.parse(storedUser));

    const fetchPosts = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/posts`);
        const data = await res.json();
        setAllPosts(data);
        
        // Inicializar contadores de likes
        const counts = {};
        data.forEach(post => {
          counts[post.id] = post.likes_count || 0;
        });
        setLikeCounts(counts);
      } catch (err) {
        console.error("Error al obtener posts:", err);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchPosts();
  }, []);

  // Obtener los likes del usuario actual
  useEffect(() => {const fetchUserLikes = async () => {
    if (!currentUser?.id) return;
  
    try {
      console.log(`Obteniendo likes para usuario ${currentUser.id}`);
      const res = await fetch(`${API_BASE_URL}/likes/usuario/${currentUser.id}`);

      
      if (!res.ok) {
        const text = await res.text();
        console.error(`Error ${res.status}: ${text}`);
        throw new Error(`Error al obtener likes: ${res.status}`);
      }
      
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error(`Respuesta no es JSON: ${text}`);
        throw new Error("La respuesta no es JSON");
      }
      
      const likedPostIds = await res.json();
  
      const likedMap = {};
      likedPostIds.forEach(postId => {
        likedMap[postId] = true;
      });
  
      setLikedPosts(likedMap);
    } catch (err) {
      console.error("Error al obtener likes del usuario:", err);
    }
  };
  
    if (currentUser) {
      fetchUserLikes();
    }
  }, [currentUser]);
  

  useEffect(() => {
    if (!loadingPosts) {
      const nuevos = allPosts.slice(0, page * postsPerPage);
      setPosts(nuevos);
    }
  }, [page, allPosts, loadingPosts]);

  const lastPostRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && posts.length < allPosts.length) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [posts, allPosts]
  );

  const formatearTiempoPublicacion = (fechaString) => {
    const publicadaUTC = new Date(fechaString);
    const publicadaLocal = new Date(publicadaUTC.getTime() + 2 * 60 * 60 * 1000);
    const ahora = new Date();
    const diffSegundos = Math.floor((ahora - publicadaLocal) / 1000);
    const minutos = Math.floor(diffSegundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);
    const meses = Math.floor(dias / 30);
    const anos = Math.floor(dias / 365);
    if (diffSegundos < 60) return `${diffSegundos}s`;
    if (minutos < 60) return `${minutos}min`;
    if (horas < 24) return `${horas}h`;
    if (dias < 30) return `${dias}d`;
    if (meses < 12) return `${meses}mes${meses > 1 ? "es" : ""}`;
    return `${anos}año${anos > 1 ? "s" : ""}`;
  };

  const navigateToProfile = (username, userId) => {
    const user = currentUser || JSON.parse(localStorage.getItem("user") || "{}");
    if (!user.username) return navigate("/login");
    if (user.username === username || user.id === userId) {
      navigate("/perfil");
    } else {
      navigate(`/perfilDeUsuario/${username}`);
    }
  };

  const toggleComentarios = (postId) => {
    setComentariosVisibles(comentariosVisibles === postId ? null : postId);
  };

  const agregarComentario = async (postId, texto) => {
    if (!currentUser?.id) return;

    try {
      const res = await fetch(`${API_BASE_URL}/comentarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id: currentUser.id,
          publicacion_id: postId,
          contenido: texto,
        }),
      });

      if (!res.ok) throw new Error("Error al comentar");
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, comentarios_count: (post.comentarios_count || 0) + 1 }
            : post
        )
      );
    } catch (err) {
      console.error("Error al comentar:", err);
    }
  };

  // Función para dar/quitar like
  const handleLike = async (postId, e) => {
    e.stopPropagation();
    
    if (!currentUser?.id) {
      navigate("/login");
      return;
    }

    try {
      const isLiked = likedPosts[postId];
      
      setLikedPosts(prev => ({
        ...prev,
        [postId]: !isLiked
      }));
      setLikeCounts(prev => {
        const current = prev[postId] ?? 0;
        const nuevoConteo = isLiked ? Math.max(0, current - 1) : current + 1;
      
      
        // Actualiza también el array de posts
        setPosts(prevPosts =>
          prevPosts.map(post =>
            post.id === postId ? { ...post, likes_count: nuevoConteo } : post
          )
        );
      
        return {
          ...prev,
          [postId]: nuevoConteo
        };
      });
      

      if (isLiked) {
        // Quitar like
        await fetch(`${API_BASE_URL}/likes`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuario_id: currentUser.id,
            publicacion_id: postId
          })
        });
      } else {
        // Dar like
        await fetch(`${API_BASE_URL}/likes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuario_id: currentUser.id,
            publicacion_id: postId
          })
        });
      }
    } catch (err) {
      // Revertir cambios en caso de error
      console.error("Error al gestionar like:", err);
      setLikedPosts(prev => ({
        ...prev,
        [postId]: !prev[postId]
      }));
      
      setLikeCounts(prev => ({
        ...prev,
        [postId]: prev[postId] + (likedPosts[postId] ? 1 : -1)
      }));
    }
  };

  const extraerURLs = (html) => {
    if (!html) return [];
    const hrefMatches = [...html.matchAll(/href=["'](https?:\/\/[^"']+)["']/g)].map((m) => m[1]);
    const plainMatches = [...html.matchAll(/(?:^|\s|>)(https?:\/\/[^\s<>"']+)(?=\s|<|$)/g)].map((m) => m[1]);
    return [...new Set([...hrefMatches, ...plainMatches])];
  };

  const procesarContenido = (contenido) => {
    if (!contenido) return "";
    const sinImagenes = contenido.replace(/<img[^>]*>/g, "");
    const urls = extraerURLs(sinImagenes);
    return urls.reduce((text, url) => text.replace(url, ""), sinImagenes);
  };

  const obtenerImagenesPost = (post) => {
    if (!post.contenido && post.imagen) return [post.imagen];
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

  const verPost = (id) => {
    navigate(`/verPost/${id}`);
  };

  return (
    <div className="feed-container">
      <Barranav />

      {/* Botón menú para todos los tamaños excepto desktop */}
      <div className="menu-movil-toggle">
        <button className="menu-movil-btn" onClick={toggleMenu}>
          <FaBars />
        </button>
      </div>

      {/* Panel desplegable lateral en todos los tamaños excepto desktop */}
      {menuAbierto && (
        <div className="menu-movil-panel">
          <div className="menu-columnas">
            <div className="menu-columna izquierda">
              <AQuienSeguir suggestedUsers={suggestedUsers} />
            </div>
            <div className="menu-columna derecha">
              <PostsPopulares />
              <PostButton />
            </div>
          </div>
        </div>
      )}

      <div className="feed-wrapper">
        {/* Sidebar izquierdo solo visible en desktop (>1200px) */}
        <div className="sidebar-left">
          <AQuienSeguir suggestedUsers={suggestedUsers} />
          <PostButton />
        </div>

        <div className="posts-container">
          {loadingPosts ? (
            <div className="spinner-container">
              <div className="spinner"></div>
            </div>
          ) : (
            posts.map((post, i) => {
              const urls = extraerURLs(post.contenido);
              const contenidoProcesado = procesarContenido(post.contenido);
              const imagenesPost = obtenerImagenesPost(post);
              const esUltimo = i === posts.length - 1;
              const isLiked = likedPosts[post.id] || false;

              return (
                <div
                  key={post.id}
                  className="posts-card"
                  ref={esUltimo ? lastPostRef : null}
                  onClick={() => verPost(post.id)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="post-content-wrapper">
                    <div className="post-text">
                      <div className="post-header">
                        <img
                          src={
                            post.foto_perfil?.startsWith("data:") || post.foto_perfil?.startsWith("http")
                              ? post.foto_perfil
                              : defaultProfile
                          }
                          alt="Perfil"
                          className="post-avatar"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigateToProfile(post.username, post.usuario_id);
                          }}
                        />

                        <div
                          className="post-userinfo"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigateToProfile(post.username, post.usuario_id);
                          }}
                        >
                          <h3 className="post-nombre">{post.nombre}</h3>
                          <h4 className="post-username">@{post.username}</h4>
                          <span className="post-time">
                            · {formatearTiempoPublicacion(post.fecha_publicacion)}
                          </span>
                        </div>
                      </div>

                      <h5 className="post-title">{post.titulo}</h5>

                      <div
                        className="post-content"
                        dangerouslySetInnerHTML={{ __html: contenidoProcesado }}
                      />
                      {urls.map((url, i) => (
                        <VistaEnlace key={i} url={url} />
                      ))}
                      {imagenesPost.length > 0 && <ImageGrid images={imagenesPost} />}
                    </div>

                    <div className="post-actions">
                      <span 
                        className={`likes-btn ${isLiked ? 'liked' : ''}`}
                        onClick={(e) => handleLike(post.id, e)}
                      >
                        {isLiked ? <MdFavorite className="like-icon active" /> : <MdFavoriteBorder className="like-icon" />} 
                        {likeCounts[post.id] || 0}
                      </span>
                      <span
                        className="comentarios-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleComentarios(post.id);
                        }}
                      >
                        <FaRegComment /> {post.comentarios_count ?? 0}
                      </span>
                    </div>

                    {comentariosVisibles === post.id && (
                      <div className="comentarios-container">
                        <Comentarios
                          postId={post.id}
                          comentarios={[]} // Comentarios en feed ocultos
                          agregarComentario={agregarComentario}
                          cerrarComentarios={() => setComentariosVisibles(null)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar derecho solo visible en desktop (>1200px) */}
        <div className="sidebar-right">
          <PostsPopulares />
        </div>
      </div>
      <ScrollArriba />
    </div>
  );
}

export default Feed;
import React, { useState } from "react";
import Barranav from "../components/Barranav";
import Comentarios from "../components/Comentarios";
import AQuienSeguir from "../components/AQuienSeguir";
import ScrollArriba from "../components/ScrollArriba";
import { FaRegComment } from "react-icons/fa";
import { MdFavorite } from "react-icons/md";
import bannerDefecto from "../img/bannerDefecto.jpg"; // ✅ Importa la imagen
import "./Feed.css";
 
function Feed() {
  const [posts] = useState([
    {
      id: 1,
      username: "Usuario de Moonex",
      title: "Banner por defecto de Moonex",
      content: "Este es el banner por defecto de Moonex",
      likes: 10,
      comments: [],
      image: bannerDefecto,
    },
    {
      id: 2,
      username: "UserPrueba",
      title: "Probando el texto",
      content: "Nuestra Luna es un satélite natural, es decir, un astro que orbita alrededor de otro. La Luna ayuda a estabilizar nuestro clima y a crear las mareas en nuestros océanos. Aunque no sabemos con seguridad cómo se formó la Luna, los científicos creen que se formó cuando un gran objeto celeste similar a un asteroide chocó contra la Tierra. Los escombros resultantes se incorporaron para formar la Luna que vemos hoy.",
      likes: 15,
      comments: [],
      image: "",
    },
  ]);
 
  const [comentariosVisibles, setComentariosVisibles] = useState(null);
  const [comentarios, setComentarios] = useState({});
  const [suggestedUsers] = useState([
    { id: 1, username: "Usuario1" },
    { id: 2, username: "Usuario2" },
    { id: 3, username: "Usuario3" },
    { id: 4, username: "Usuario4" },
    { id: 5, username: "Usuario5" },
  ]);
 
  const toggleComentarios = (postId) => {
    setComentariosVisibles(comentariosVisibles === postId ? null : postId);
  };
 
  const agregarComentario = (postId, texto) => {
    const nuevoComentario = { usuario: "UsuarioEjemplo", texto };
    setComentarios((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), nuevoComentario],
    }));
  };
 
  return (
    <div className="feed-container">
      <Barranav />
 
      <div className="feed-wrapper">
        <div className="feed-content">
          <AQuienSeguir suggestedUsers={suggestedUsers} />
 
          {/* Contenedor de publicaciones */}
          <div className="posts-container">
            {posts.map((post) => (
              <div key={post.id} className="posts-card">
                <div className="post-content-wrapper">
                <div className="post-text">
                    <h4 className="post-username">{post.username}</h4>
                    <h5 className="post-title">{post.title}</h5>
                    <p className="post-content">{post.content}</p>
 
                    {/* Renderiza la imagen solo si `post.image` tiene valor */}
                    {post.image !== null && post.image !== undefined && post.image !== "" ? (
                      <img src={post.image} alt="Publicación" className="post-image" />
                    ) : null}
                  </div>
 
                  <div className="post-actions">
                    <span className="likes-btn"><MdFavorite /> {post.likes}</span>
                    <span className="comentarios-btn" onClick={() => toggleComentarios(post.id)}>
                      <FaRegComment /> {comentarios[post.id]?.length || 0}
                    </span>
                  </div>
                  {comentariosVisibles === post.id && (
                    <div className="comentarios-container">
                      <Comentarios
                        postId={post.id}
                        comentarios={comentarios[post.id] || []}
                        agregarComentario={agregarComentario}
                        cerrarComentarios={() => setComentariosVisibles(null)}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <ScrollArriba />
    </div>
  );
}
 
export default Feed;
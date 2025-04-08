import React, { useState, useEffect } from "react";
import Barranav from "../components/Barranav";
import Comentarios from "../components/Comentarios";
import AQuienSeguir from "../components/AQuienSeguir";
import ScrollArriba from "../components/ScrollArriba";
import { FaRegComment } from "react-icons/fa";
import { MdFavorite } from "react-icons/md";
import VistaEnlace from "../components/VistaEnlace";
import ImageGrid from "../components/ImageGrid"; // Importa el nuevo componente
import "./Feed.css";

function Feed() {
  const [posts, setPosts] = useState([]);
  const [comentariosVisibles, setComentariosVisibles] = useState(null);
  const [comentarios, setComentarios] = useState({});
  const [suggestedUsers] = useState([
    { id: 1, username: "Usuario1" },
    { id: 2, username: "Usuario2" },
    { id: 3, username: "Usuario3" },
    { id: 4, username: "Usuario4" },
    { id: 5, username: "Usuario5" },
  ]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("http://localhost:5000/posts");
        const data = await res.json();
        setPosts(data);
      } catch (err) {
        console.error("Error al obtener posts:", err);
      }
    };

    fetchPosts();
  }, []);

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

  // Función mejorada para extraer URLs
  const extraerURLs = (html) => {
    if (!html) return [];
    
    // Primero buscar enlaces en atributos href
    const hrefRegex = /href=["'](https?:\/\/[^"']+)["']/g;
    const hrefMatches = [];
    let hrefMatch;
    
    while ((hrefMatch = hrefRegex.exec(html)) !== null) {
      hrefMatches.push(hrefMatch[1]);
    }
    
    // Luego buscar URLs en texto plano (no en href)
    const plaintextRegex = /(?:^|\s|>)(https?:\/\/[^\s<>"']+)(?=\s|<|$)/g;
    const plaintextMatches = [];
    let plaintextMatch;
    
    while ((plaintextMatch = plaintextRegex.exec(html)) !== null) {
      plaintextMatches.push(plaintextMatch[1]);
    }
    
    // Combinar ambos conjuntos de coincidencias y eliminar duplicados
    const allMatches = [...hrefMatches, ...plaintextMatches];
    const uniqueMatches = [...new Set(allMatches)];
    
    return uniqueMatches;
  };

  // Función para ocultar URLs en el contenido del post
  const procesarContenido = (contenido) => {
    if (!contenido) return "";
  
    // Elimina las etiquetas <img ... />
    const sinImagenes = contenido.replace(/<img[^>]*>/g, '');
  
    // Elimina URLs visibles (ya se renderizan como previews)
    const urls = extraerURLs(sinImagenes);
    let procesado = sinImagenes;
  
    urls.forEach(url => {
      const regex = new RegExp(`(?<!href=["'])${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g');
      procesado = procesado.replace(regex, '');
    });
  
    return procesado;
  };
  

  // Función para determinar qué imágenes mostrar en cada post
  const obtenerImagenesPost = (post) => {
    // Si no hay contenido ni imagen, retornar array vacío
    if (!post.contenido && !post.imagen) return [];
    
    // Si hay una imagen principal pero no contenido HTML, retornar solo la imagen principal
    if (!post.contenido && post.imagen) return [post.imagen];
    
    // Si hay contenido HTML, buscar imágenes en él
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/g;
    const imagenesContenido = [];
    let match;
    
    while ((match = imgRegex.exec(post.contenido)) !== null) {
      // Filtrar avatares y otras imágenes que no deben incluirse en la galería
      if (!match[1].includes('defaultProfile') && 
          !match[1].includes('avatar') &&
          !match[1].includes('profile')) {
        imagenesContenido.push(match[1]);
      }
    }
    
    // Si encontramos imágenes en el contenido, usarlas
    if (imagenesContenido.length > 0) {
      return imagenesContenido;
    }
    
    // Si no hay imágenes en el contenido pero sí hay imagen principal
    if (post.imagen) {
      return [post.imagen];
    }
    
    // Si llegamos aquí, no hay imágenes para mostrar
    return [];
  };

  return (
    <div className="feed-container">
      <Barranav />
      <div className="feed-wrapper">
        <div className="feed-content">
          <AQuienSeguir suggestedUsers={suggestedUsers} />

          <div className="posts-container">
            {posts.map((post) => {
              const urls = extraerURLs(post.contenido);
              const contenidoProcesado = procesarContenido(post.contenido);
              const imagenesPost = obtenerImagenesPost(post);
              
              return (
                <div key={post.id} className="posts-card">
                  <div className="post-content-wrapper">
                    <div className="post-text">
                      <div className="post-header">
                        <img
                          src={post.foto_perfil || "/ruta/a/defaultProfile.png"}
                          alt="Perfil"
                          className="post-avatar"
                        />
                        <div className="post-userinfo">
                          <h3 className="post-nombre">{post.nombre}</h3>
                          <h4 className="post-username">@{post.username}</h4>
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

                      {/* Mostrar la cuadrícula de imágenes solo si hay imágenes para mostrar */}
                      {imagenesPost.length > 0 && (
                        <ImageGrid images={imagenesPost} />
                      )}
                    </div>

                    <div className="post-actions">
                      <span className="likes-btn">
                        <MdFavorite /> 0
                      </span>
                      <span
                        className="comentarios-btn"
                        onClick={() => toggleComentarios(post.id)}
                      >
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
              );
            })}
          </div>
        </div>
      </div>
      <ScrollArriba />
    </div>
  );
}

export default Feed;
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { TbCamera } from "react-icons/tb";
import { IoMdSend } from "react-icons/io";
import { HiMenu } from "react-icons/hi";
import { FaTimes } from "react-icons/fa";
import pfpDefecto from "../img/PfpDefecto.png";
import { RiDeleteBin6Line } from "react-icons/ri";
import { MdOutlineDeleteSweep } from "react-icons/md";
import { BiCommentDetail } from "react-icons/bi";
import { FaArrowLeft } from "react-icons/fa";


import "./Chat.css";

const MAX_IMAGE_SIZE = 20 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif"];

// Función para formatear el tiempo de los mensajes
const formatearTiempoChat = (fechaString) => {
  const publicadaLocal = new Date(fechaString);
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


// Función para formatear la fecha de los mensajes
const formatearFechaMensaje = (fechaString) => {
  const fecha = new Date(fechaString);
  const ahora = new Date();

  const esHoy = fecha.toDateString() === ahora.toDateString();

  const ayer = new Date();
  ayer.setDate(ayer.getDate() - 1);
  const esAyer = fecha.toDateString() === ayer.toDateString();

  if (esHoy) {
    return fecha.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  } else if (esAyer) {
    return "Ayer";
  } else {
    return fecha.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }
};

// Modal para mostrar imagen ampliada
const ImageModal = ({ image, onClose }) => {
  const handleClick = (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClick}>
      <img src={image} alt="Zoomed" className="modal-image" />
    </div>
  );
};

const Chat = () => {
  const { username } = useParams(); // username del receptor
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}"); // usuario logueado
  const [receptorId, setReceptorId] = useState(null);
  const [conversaciones, setConversaciones] = useState([]);
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const messagesEndRef = useRef(null);
  const [receptorData, setReceptorData] = useState(null);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // Estado para mostrar el modal de confirmación
  const [mensajeRespondido, setMensajeRespondido] = useState(null);
  const [chatAEliminar, setChatAEliminar] = useState(null);
  const [mostrarConfirmacionChat, setMostrarConfirmacionChat] = useState(false);
  const [mostrarModalEliminarTodo, setMostrarModalEliminarTodo] = useState(false);
  const menuRef = useRef(null);
  const [bloquearClickOutside, setBloquearClickOutside] = useState(false);

  const SOCKET_URL = process.env.REACT_APP_API_URL;
  const API_URL = process.env.REACT_APP_API_URL;
  
  // Función para formatear las imágenes
  const formatImageSrc = (imageString) => {
    if (!imageString) return "";
    if (imageString.startsWith("data:")) return imageString;

    let imageType = "jpeg";
    if (imageString.startsWith("/9j/")) imageType = "jpeg";
    if (imageString.startsWith("iVBORw0KGgo")) imageType = "png";
    if (imageString.startsWith("R0lGODlh")) imageType = "gif";
    if (imageString.startsWith("PHN2Zw")) imageType = "svg+xml";

    return `data:image/${imageType};base64,${imageString}`;
  };

  // Función para comprimir imágenes si son muy grandes
  const compressImage = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > 1200) {
            height = Math.round((height * 1200) / width);
            width = 1200;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              resolve(blob);
            },
            "image/jpeg",
            0.7
          );
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  useEffect(() => {
    const fetchReceiverData = async () => {
      try {
        const res = await fetch(`${API_URL}/usuarios/username/${username}`);
        const data = await res.json();
        setReceptorId(data.id);
        setReceptorData(data);
      } catch (err) {
        console.error("Error al obtener receptor:", err);
      }
    };

    if (username) {
      fetchReceiverData();
    }
  }, [username, API_URL]);

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ["websocket"],
      withCredentials: true,
    });
    
    setSocket(newSocket);

    newSocket.on("chat history", (history) => {
      const filtered = history
        .filter(
          (msg) =>
            (msg.emisor_id === currentUser.id && msg.receptor_id === receptorId) ||
            (msg.receptor_id === currentUser.id && msg.emisor_id === receptorId)
        )
        .map((message) => ({
          ...message,
          imagenes: Array.isArray(message.imagenes)
            ? message.imagenes.map(formatImageSrc)
            : [],
        }));
      setMessages(filtered);
    });

    newSocket.on("new message", (message) => {
      const isRelevant =
        (message.emisor_id === currentUser.id && message.receptor_id === receptorId) ||
        (message.receptor_id === currentUser.id && message.emisor_id === receptorId);

      if (isRelevant) {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            ...message,
            imagenes: Array.isArray(message.imagenes)
              ? message.imagenes.map(formatImageSrc)
              : [],
          },
        ]);
      }
    });

    newSocket.on("message deleted", (messageId) => {
      setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== messageId));
    });

    return () => newSocket.disconnect();
 }, [receptorId, currentUser.id, SOCKET_URL]);

  useEffect(() => {
    const fetchConversaciones = async () => {
      try {
        const res = await fetch(`${API_URL}/api/conversaciones/${currentUser.id}`);
        const data = await res.json();
        setConversaciones(data);
      } catch (err) {
        console.error("Error al obtener conversaciones:", err);
      }
    };

    if (currentUser.id) {
      fetchConversaciones();
    }
  }, [currentUser.id, API_URL]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!username && conversaciones.length > 0) {
      // Ordenar conversaciones por fecha de último mensaje (más reciente primero)
      const ordenadas = [...conversaciones].sort((a, b) => 
        new Date(b.fecha_envio) - new Date(a.fecha_envio)
      );
  
      // Redirigir a la más reciente
      navigate(`/chat/${ordenadas[0].username}`);
    }
  }, [username, conversaciones, navigate]);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 480);
    };
  
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  

const longPressTimeout = useRef(null);

const handleLongPressStart = (msg) => {
  if (!isMobile) return;
  longPressTimeout.current = setTimeout(() => {
    setBloquearClickOutside(true); // Bloquear durante unos milisegundos
    setMessageToDelete(msg.id);
    setTimeout(() => setBloquearClickOutside(false), 300); // Desbloquea tras 300ms
  }, 500);
};

const handleLongPressEnd = () => {
  if (longPressTimeout.current) {
    clearTimeout(longPressTimeout.current);
    longPressTimeout.current = null;
  }
};
useEffect(() => {
  const handleClickOutside = (event) => {
    if (bloquearClickOutside) return;

    const clickedInsideMenu = event.target.closest(".message-options-menu");
    const clickedInsideMessage = event.target.closest(".message-container");

    if (!clickedInsideMenu && !clickedInsideMessage && messageToDelete !== null && isMobile) {
      setMessageToDelete(null);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, [messageToDelete, bloquearClickOutside, isMobile]);




  const triggerImageUpload = () => {
    document.getElementById("image-upload").click();
  };

  
  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    const errorMessages = [];

    for (const file of files) {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        errorMessages.push(`${file.name} no es un tipo de imagen válido`);
        continue;
      }

      try {
        let processedFile = file;
        if (file.size > MAX_IMAGE_SIZE) {
          processedFile = await compressImage(file);
        }
        validFiles.push(processedFile);
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        errorMessages.push(`Error al procesar ${file.name}`);
      }
    }

    if (errorMessages.length > 0) {
      alert(errorMessages.join("\n"));
    }

    const newPreviews = [];
    for (const file of validFiles) {
      try {
        const preview = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        newPreviews.push(preview);
      } catch (error) {
        console.error(`Error creating preview for ${file.name}:`, error);
      }
    }

    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && imagePreviews.length === 0) return;

    try {
      const message = {
        emisor_id: currentUser.id,
        receptor_id: receptorId,
        contenido: newMessage,
        imagenes: imagePreviews,
        fecha_envio: new Date().toISOString(),
        responde_a: mensajeRespondido ? mensajeRespondido.id : null,
      };
      

      if (JSON.stringify(message).length > 5 * 1024 * 1024) {
        throw new Error("El mensaje es demasiado grande para enviar");
      }

      socket.emit("new message", message);
      setMensajeRespondido(null);
      setNewMessage("");
      setImagePreviews([]);
    } catch (error) {
      alert(`Error al enviar el mensaje: ${error.message}`);
    }
  };


  
  const handleClosePreview = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleChatSelect = (username) => {
    navigate(`/chat/${username}`);
  };

  const handleDeleteMessage = (messageId) => {
    setMessageToDelete(messageId); 
    setShowDeleteConfirm(true); // Mostrar el modal de confirmación
  };

  const confirmDeleteMessage = () => {
    socket.emit("delete message", messageToDelete);
    setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== messageToDelete)); 
    setShowDeleteConfirm(false); // Cerrar el modal de confirmación
  };
  const obtenerMensajeOriginal = (id) => {
    return messages.find((m) => m.id === id);
  };
  
  const cancelDeleteMessage = () => {
    setShowDeleteConfirm(false); // Cerrar el modal sin eliminar
  };

  const eliminarChatCompleto = async (conversacionId) => {
    try {
      const res = await fetch(`${API_URL}/api/conversaciones/${conversacionId}?userId=${currentUser.id}`, {
        method: "DELETE"
      });
      
  
      if (!res.ok) throw new Error("Error al eliminar chat");
  
      setConversaciones(prev => prev.filter(c => c.id !== conversacionId && c.usuario_id !== conversacionId));
      setMessages([]);
  
      // Cargar al chat más reciente
      const restantes = conversaciones.filter(c => c.id !== conversacionId && c.usuario_id !== conversacionId);
      if (restantes.length > 0) {
        const ordenadas = [...restantes].sort((a, b) =>
          new Date(b.fecha_envio) - new Date(a.fecha_envio)
        );
        navigate(`/chat/${ordenadas[0].username}`);
      } else {
        navigate("/chat");
      }
  
    } catch (err) {
      console.error("Error al eliminar conversación:", err);
    }
  };
  return (
    <div className="chat-container">
      <div className={`chat-sidebar ${isSidebarOpen ? "open" : "closed"}`}>
        <div className="chat-sidebar-header">
        <div className="chat-sidebar-header-title">
  <button className="back-to-feed-button" onClick={() => navigate('/feed')} title="Volver al feed">
    <FaArrowLeft />
  </button>
  <h3>Chats</h3>
  <div className="chat-header-buttons">
  <button
  className="clear-all-button"
  title="Eliminar todas las conversaciones"
  onClick={() => setMostrarModalEliminarTodo(true)}
>
  <MdOutlineDeleteSweep size={20} />
</button>

    <button className="mobile-close-button" onClick={toggleSidebar}>
      <FaTimes size={18} />
    </button>
  </div>
</div>

</div>
<div className="chat-sidebar-rooms">
  {conversaciones.length === 0 ? (
    <div>No hay chats disponibles</div>
  ) : (
    conversaciones.map((convo) => (
      <div
        key={convo.id}
        className="chat-sidebar-item"
        onClick={() => handleChatSelect(convo.username)}
      >
        <div className="chat-avatar-small">
          <img src={convo.foto_perfil || pfpDefecto} alt="Perfil" />
        </div>

        <div className="chat-sidebar-info">
          {/* Encabezado: nombre, username, tiempo y papelera a la derecha */}
          <div className="chat-sidebar-header-info">
            <div className="chat-sidebar-header-left">
              <span className="chat-sidebar-name">{convo.nombre}</span>
              <span className="chat-sidebar-username">@{convo.username}</span>
              <span className="chat-sidebar-date">• {formatearTiempoChat(convo.fecha_envio)}</span>
            </div>
            <div className="chat-sidebar-actions">
              <button
                className="chat-options-button"
                title="Eliminar conversación"
                aria-label="Eliminar conversación"
                onClick={(e) => {
                  e.stopPropagation();
                  setChatAEliminar(convo.id);
                  setMostrarConfirmacionChat(true);
                }}
              >
                <RiDeleteBin6Line size={18} />
              </button>
            </div>
          </div>

          {/* Último mensaje */}
          <div className="chat-last-message">
            {convo.ultimo_mensaje
              ? convo.ultimo_mensaje
              : convo.tiene_imagen
              ? "📷 Imagen"
              : ""}
          </div>
        </div>
      </div>
    ))
  )}
</div>

   
      </div>
      <div className={`chat-main ${isSidebarOpen ? "with-sidebar" : "full-width"}`}>
        <div className="chat-header">
          <button onClick={toggleSidebar} className="toggle-sidebar-button">
            <HiMenu size={24} color="white" />
          </button>

          {receptorData && (
            <div
              className="chat-header-profile"
              onClick={() => navigate(`/perfilDeUsuario/${receptorData.username}`)}
            >
              <div className="chat-avatar">
                <img
                  src={receptorData.foto_perfil || pfpDefecto}
                  alt="avatar"
                  className="avatar-image"
                />
              </div>
              <div className="chat-header-info">
                <div className="chat-header-name">{receptorData.nombre}</div>
                <div className="chat-header-username">@{receptorData.username}</div>
              </div>
            </div>
          )}
        </div>

        <div className="chat-messages">
  {messages.map((msg, index) => {
    const isSelf = msg.emisor_id === currentUser.id;
    return (
      <div
      key={index}
      className={`message-container ${isSelf ? "self-message" : "other-message"}`}
      onTouchStart={() => handleLongPressStart(msg)}
      onTouchEnd={handleLongPressEnd}
      onTouchMove={handleLongPressEnd}
      onMouseDown={(e) => {
        if (!isMobile) return;
        handleLongPressStart(msg);
      }}
      onMouseUp={handleLongPressEnd}
      onMouseLeave={handleLongPressEnd}
    >
    
        <div className="messages">
        {msg.responde_a && (
  <div className="mensaje-original-preview">
    <span className="mensaje-original-label">Respondiendo a</span>
    {obtenerMensajeOriginal(msg.responde_a)?.contenido && (
      <div className="mensaje-original-texto">
        {obtenerMensajeOriginal(msg.responde_a).contenido}
      </div>
    )}
    {obtenerMensajeOriginal(msg.responde_a)?.imagenes?.length > 0 && (
      <img
        src={obtenerMensajeOriginal(msg.responde_a).imagenes[0]}
        alt="respuesta"
        className="mensaje-original-imagen"
        onClick={() =>
          handleImageClick(obtenerMensajeOriginal(msg.responde_a).imagenes[0])
        }
      />
    )}
  </div>
)}

          {msg.contenido && <p>{msg.contenido}</p>}
          {msg.imagenes?.map((img, i) => (
            <img
              key={i}
              src={img}
              alt="img"
              className="message-image"
              onClick={() => handleImageClick(img)}
              onError={(e) => (e.target.style.display = "none")}
            />
          ))}

          <span className="message-time">
            {formatearFechaMensaje(msg.fecha_envio)}
          </span>
          <div className="message-options-container">
          {window.innerWidth > 480 && (
  <button
    className="message-options-button"
    onClick={(e) => {
      e.stopPropagation();
      setMessageToDelete((prev) => (prev === msg.id ? null : msg.id));
    }}
  >
    ⋯
  </button>
)}

{/* Mostrar el menú si es el mensaje seleccionado, incluso en móvil */}
{messageToDelete === msg.id && (
  <div className="message-options-menu" onClick={(e) => e.stopPropagation()}>


    {isSelf && (
      <div className="message-option" onClick={() => handleDeleteMessage(msg.id)}>
        <RiDeleteBin6Line style={{ marginRight: 8 }} /> Eliminar
      </div>
    )}
    <div
      className="message-option"
      onClick={() => {
        setMensajeRespondido(msg);
        setMessageToDelete(null);
      }}
    >
      <BiCommentDetail style={{ marginRight: 8 }} /> Responder
    </div>
  </div>
)}


            {messageToDelete === msg.id && (
  <div className="message-options-menu" onClick={(e) => e.stopPropagation()}>
    {isSelf && (
      <div className="message-option" onClick={() => handleDeleteMessage(msg.id)}>
        <RiDeleteBin6Line style={{ marginRight: 8 }} /> Eliminar
      </div>
    )}
    <div
      className="message-option"
      onClick={() => {
        setMensajeRespondido(msg);
        setMessageToDelete(null); // Cerrar el menú
      }}
    >
      <BiCommentDetail style={{ marginRight: 8 }} /> Responder
    </div>
  </div>
)}

          </div>
        </div>
      </div>
    );
  })}
  <div ref={messagesEndRef} />
</div>
        {mensajeRespondido && (
  <div className="respuesta-preview">
    <div className="respuesta-contenido">
      <span className="respuesta-label">Respondiendo a:</span>
      {mensajeRespondido.contenido ? (
        <p className="respuesta-texto">{mensajeRespondido.contenido}</p>
      ) : mensajeRespondido.imagenes?.length ? (
        <img
          src={mensajeRespondido.imagenes[0]}
          alt="respuesta"
          className="respuesta-imagen"
        />
      ) : (
        <p className="respuesta-texto">Mensaje sin contenido</p>
      )}
    </div>
    <button
      className="respuesta-cerrar"
      onClick={() => setMensajeRespondido(null)}
    >
      <FaTimes size={14} />
    </button>
  </div>
)}

        {imagePreviews.length > 0 && (
          <div className="image-preview">
            <div className="preview-grid">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="preview-item">
                  <button
                    className="close-preview"
                    onClick={() => handleClosePreview(index)}
                  >
                    <FaTimes size={14} />
                  </button>
                  <img
                    src={preview}
                    alt={`Vista previa ${index + 1}`}
                    className="preview-image"
                  />
                </div>
              ))}
              <label htmlFor="image-upload" className="add-image-preview">
                <span>+</span>
              </label>
            </div>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="chat-input-form">
          <button
            type="button"
            onClick={triggerImageUpload}
            className="chat-image-button"
            aria-label="Subir imagen"
          >
            <TbCamera size={30} color="white" />
          </button>
          <input
            type="file"
            id="image-upload"
            accept="image/*"
            onChange={handleImageChange}
            className="chat-image-input"
            multiple
          />
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="chat-input"
          />
          <button type="submit" className="chat-send-button">
            <IoMdSend size={30} color="white" />
          </button>
        </form>
      </div>

      {selectedImage && (
        <ImageModal image={selectedImage} onClose={() => setSelectedImage(null)} />
      )}

      {/* Modal de confirmación para eliminar mensaje */}
      {showDeleteConfirm && (
  <div className="modal-overlay" onClick={cancelDeleteMessage}>
    <div className="delete-confirmation-modal" onClick={(e) => e.stopPropagation()}>
      <div className="delete-confirmation-box">
        <h4>¿Eliminar mensaje?</h4>
        <p>Esta acción no se puede deshacer.</p>
        <div className="modal-buttons">
          <button className="cancel-button" onClick={cancelDeleteMessage}>Cancelar</button>
          <button className="confirm-button" onClick={confirmDeleteMessage}>Eliminar</button>
        </div>
      </div>
    </div>
  </div>
)}

{mostrarModalEliminarTodo && (
  <div className="modal-overlay" onClick={() => setMostrarModalEliminarTodo(false)}>
    <div className="delete-confirmation-modal" onClick={(e) => e.stopPropagation()}>
      <div className="delete-confirmation-box">
        <h4>¿Eliminar todas las conversaciones?</h4>
        <p>Esta acción no se puede deshacer.</p>
        <div className="modal-buttons">
          <button
            className="cancel-button"
            onClick={() => setMostrarModalEliminarTodo(false)}
          >
            Cancelar
          </button>
          <button
            className="confirm-button"
            onClick={async () => {
              try {
                const res = await fetch(
                  `${process.env.REACT_APP_API_URL}/api/conversaciones/todas/${currentUser.id}`,
                  { method: "DELETE" }
                );
                if (!res.ok) throw new Error("Error al eliminar todas las conversaciones");
                await res.json();
                setConversaciones([]);
                setMessages([]);
                setMostrarModalEliminarTodo(false);
                navigate("/chat");
              } catch (err) {
                console.error(err);
                alert("No se pudo eliminar todas las conversaciones");
              }
            }}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{mostrarConfirmacionChat && (
  <div className="modal-overlay" onClick={() => setMostrarConfirmacionChat(false)}>
    <div className="delete-confirmation-modal" onClick={(e) => e.stopPropagation()}>
      <div className="delete-confirmation-box">
        <h4>¿Eliminar conversación?</h4>
        <p>Esta acción no se puede deshacer.</p>
        <div className="modal-buttons">
          <button className="cancel-button" onClick={() => setMostrarConfirmacionChat(false)}>
            Cancelar
          </button>
          <button
            className="confirm-button"
            onClick={() => {
              eliminarChatCompleto(chatAEliminar);
              setMostrarConfirmacionChat(false);
            }}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
)}


    </div>
  );
};

export default Chat;
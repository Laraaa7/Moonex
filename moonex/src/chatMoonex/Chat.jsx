import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { TbCamera } from "react-icons/tb";
import { IoMdSend } from "react-icons/io";
import { HiMenu } from "react-icons/hi";
import { FaTimes } from "react-icons/fa";
import pfpDefecto from "../img/PfpDefecto.png";
import "./Chat.css";

const SOCKET_URL = "http://localhost:5000";
const MAX_IMAGE_SIZE = 20 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif"];

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
        const res = await fetch(`http://localhost:5000/usuarios/username/${username}`);
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
  }, [username]);
  

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
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

    return () => newSocket.disconnect();
  }, [receptorId, currentUser.id]);

  useEffect(() => {
    const fetchConversaciones = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/conversaciones/${currentUser.id}`);
        const data = await res.json();
        setConversaciones(data);
      } catch (err) {
        console.error("Error al obtener conversaciones:", err);
      }
    };

    if (currentUser.id) {
      fetchConversaciones();
    }
  }, [currentUser.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

    // Process valid files for preview
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

    setImagePreviews(prev => [...prev, ...newPreviews]);
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
      };

      if (JSON.stringify(message).length > 5 * 1024 * 1024) {
        throw new Error("El mensaje es demasiado grande para enviar");
      }

      socket.emit("new message", message);
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

  return (
    <div className="chat-container">
      <div className={`chat-sidebar ${isSidebarOpen ? "open" : "closed"}`}>
        <div className="chat-sidebar-header">
          <h3>Chats</h3>
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
                  {convo.foto_perfil ? (
                    <img
                      src={convo.foto_perfil}
                      alt="Perfil"
                    />
                  ) : (
                    <img
                      src={pfpDefecto}
                      alt="Por defecto"
                    />
                  )}
                </div>
                <div className="chat-sidebar-info">
                  <div className="chat-sidebar-header-info">
                    <span className="chat-sidebar-name">
                      {convo.nombre}
                    </span>
                    <span className="chat-sidebar-username">@{convo.username}</span>
                    <span className="chat-sidebar-date">
                      • {new Date(convo.fecha_envio).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
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

          <div
            className="chat-header-profile"
            onClick={() => navigate(`/perfilDeUsuario/${receptorData?.username}`)}
          >
            <div className="chat-avatar">
              <img
                src={receptorData?.foto_perfil || pfpDefecto}
                alt="avatar"
                className="avatar-image"
              />
            </div>
            <div className="chat-header-info">
              <div className="chat-header-name">
                {receptorData?.nombre || "Usuario"}
              </div>
              <div className="chat-header-username">
                @{receptorData?.username || ""}
              </div>
            </div>
          </div>
        </div>

        <div className="chat-messages">
          {messages.map((msg, index) => {
            const isSelf = msg.emisor_id === currentUser.id;
            return (
              <div
                key={index}
                className={`message-container ${isSelf ? "self-message" : "other-message"}`}
              >
                <div className="messages">
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
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

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
                  <img src={preview} alt={`Vista previa ${index + 1}`} className="preview-image" />
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
    </div>
  );
};

export default Chat;
import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { TbCamera } from "react-icons/tb";
import { IoMdSend } from "react-icons/io";
import { HiMenu } from "react-icons/hi";
import { FaTimes } from "react-icons/fa";
import "./Chat.css";

const SOCKET_URL = "http://localhost:5000";
const MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

const ImageModal = ({ image, onClose }) => {
  const handleClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
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
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState(""); // eslint-disable-next-line
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const messagesEndRef = useRef(null);

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
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          if (width > 1200) {
            height = Math.round((height * 1200) / width);
            width = 1200;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              resolve(blob);
            },
            'image/jpeg',
            0.7
          );
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on("chat history", (history) => {
      const formattedHistory = history.map((message) => ({
        ...message,
        imagenes: Array.isArray(message.imagenes) ? message.imagenes.map(formatImageSrc) : []
      }));
      setMessages(formattedHistory);
    });

    newSocket.on("new message", (message) => {
      setMessages((prevMessages) => {
        const exists = prevMessages.some((msg) => msg.id === message.id);
        if (!exists) {
          return [...prevMessages, { ...message, imagenes: message.imagenes.map(formatImageSrc) }];
        }
        return prevMessages;
      });
    });

    return () => newSocket.disconnect();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const triggerImageUpload = () => {
    document.getElementById('image-upload').click();
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
      alert(errorMessages.join('\n'));
    }

    setSelectedImages((prev) => [...prev, ...validFiles]);

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.onerror = () => {
        alert(`Error al cargar la vista previa de ${file.name}`);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() || imagePreviews.length > 0) {
      try {
        const message = {
          emisor_id: 1,
          receptor_id: 2,
          contenido: newMessage,
          imagenes: imagePreviews,
          fecha_envio: new Date().toISOString(),
        };

        if (JSON.stringify(message).length > 5 * 1024 * 1024) {
          throw new Error('El mensaje es demasiado grande para enviar');
        }

        socket.emit("new message", message);
        setNewMessage("");
        setSelectedImages([]);
        setImagePreviews([]);
      } catch (error) {
        alert(`Error al enviar el mensaje: ${error.message}`);
      }
    }
  };

  const handleClosePreview = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  return (
    <div className="chat-container">
      <div className={`chat-sidebar ${isSidebarOpen ? "open" : "closed"}`}>
        <div className="chat-sidebar-header">
          <h3>Chats</h3>
        </div>
        <div className="chat-sidebar-rooms">
          <div>No hay chats disponibles</div>
        </div>
      </div>
      <div className={`chat-main ${isSidebarOpen ? "with-sidebar" : "full-width"}`}>
        <div className="chat-header">
          <button onClick={toggleSidebar} className="toggle-sidebar-button">
            <HiMenu size={24} color="white" />
          </button>
          <div className="chat-avatar">
            <div className="avatar-circle">N</div>
          </div>
          <h2>Nombre Usuario</h2>
        </div>
        <div className="chat-messages">
  {messages.flatMap((message, index) => {
    const { id, contenido, imagenes, emisor_id } = message;
    const isSelf = emisor_id === 1;
    let messageElements = [];

    if (imagenes && imagenes.length > 0) {
      imagenes.forEach((img, imgIndex) => {
        messageElements.push(
          <div 
            key={`${id}-img-${imgIndex}`} 
            className={`message-container ${isSelf ? "self-message" : "other-message"}`}
          >
            <div className="message">
              {imgIndex === 0 && contenido.trim() && <div className="text-above-image">{contenido}</div>}
              <img
                src={formatImageSrc(img)}
                alt={`Imagen enviada ${imgIndex + 1}`}
                className="message-image cursor-pointer"
                onClick={() => handleImageClick(formatImageSrc(img))}
                onError={(e) => {
                  console.error("Error cargando imagen:", e);
                  e.target.style.display = "none";
                }}
              />
            </div>
          </div>
        );
      });
    } else if (contenido.trim()) {
      // Si solo hay texto sin imágenes, se envía como un mensaje normal
      messageElements.push(
        <div 
          key={`${id}-text`} 
          className={`message-container ${isSelf ? "self-message" : "other-message"}`}
        >
          <div className="message">{contenido}</div>
        </div>
      );
    }

    return messageElements;
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
                    aria-label="Cerrar vista previa"
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
        <ImageModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
};

export default Chat;
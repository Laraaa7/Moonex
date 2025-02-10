import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { TbCamera } from "react-icons/tb";
import { IoMdSend } from "react-icons/io";
import "./Chat.css";

const SOCKET_URL = "http://localhost:5000";

const Chat = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on("chat history", (history) => {
      setMessages(history);
    });

    newSocket.on("new message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => newSocket.disconnect();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() || selectedImage) {
      const message = {
        emisor_id: 1,
        receptor_id: 2,
        contenido: newMessage,
        imagen: imagePreview,
        fecha_envio: new Date().toISOString(),
      };

      socket.emit("new message", message);
      setNewMessage("");
      setSelectedImage(null);
      setImagePreview(null);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <div className="chat-sidebar-header">
          <h3>Chats</h3>
        </div>
        <div className="chat-sidebar-rooms">
          <div>No hay chats disponibles</div>
        </div>
      </div>
      <div className="chat-main">
        <div className="chat-header">
          <div className="chat-avatar">
            <div className="avatar-circle">N</div>
          </div>
          <h2>Nombre Usuario</h2>
        </div>
        <div className="chat-messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message-container ${
                message.emisor_id === 1 ? "self-message" : "other-message"
              }`}
            >
              <div className="message">
                {message.contenido}
                {message.imagen && (
                  <img
                    src={message.imagen}
                    alt="Imagen enviada"
                    className="message-image"
                  />
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSendMessage} className="chat-input-form">
          <label htmlFor="image-upload" className="chat-image-label">
            <TbCamera size={30} color="white" />
          </label>
          <input
            type="file"
            id="image-upload"
            accept="image/*"
            onChange={handleImageChange}
            className="chat-image-input"
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

        {imagePreview && (
          <div className="image-preview">
            <img src={imagePreview} alt="Vista previa" className="preview-image" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;

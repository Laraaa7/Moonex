import React, { useState } from "react";
import { FiMail } from "react-icons/fi"; // Icono de sobre de react-icons
import { useNavigate } from "react-router-dom"; // Para redirigir al chat
import Barranav from "../components/Barranav";
import "./Profile.css"; // Mantiene estilos generales
import "./UserProfile.css"; // Estilos específicos de UserProfile
import defaultBanner from "../img/bannerDefecto.jpg";
import defaultProfile from "../img/PfpDefecto.png";

const UserProfile = () => {
  const [isFollowing, setIsFollowing] = useState(false);
  const navigate = useNavigate();

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
  };

  const handleOpenChat = () => {
    navigate(`/chat/usuarioEjemplo`);
  };

  return (
    <div className="profile-container">
      <Barranav />
      <div className="profile-content">
        <div className="profile-card">
          <div className="banner" style={{ backgroundImage: `url(${defaultBanner})` }}>
            <div className="user-actions">
              <button className={`follow-button ${isFollowing ? "following" : ""}`} onClick={handleFollowToggle}>
                {isFollowing ? "Siguiendo" : "Seguir"}
              </button>
              <button className={`message-button ${isFollowing ? "moved" : ""}`} onClick={handleOpenChat}>
                <FiMail size={16} />
              </button>
            </div>
          </div>
          <div className="profile-info">
            <img className="profile-pic" src={defaultProfile} alt="User Profile" />
            <span className="online-status"></span>
            <h2>Nombre de Usuario</h2>
            <p className="user">@usuarioEjemplo</p>
            <p className="dob">🎂 1 de enero de 2001</p>
            <p className="location">📍 España</p>
          </div>
          <div className="stats">
            <div>
              <p>Amigos</p>
              <p className="stat-number">42</p>
            </div>
            <div>
              <p>Seguidores</p>
              <p className="stat-number">156</p>
            </div>
            <div>
              <p>Siguiendo</p>
              <p className="stat-number">98</p>
            </div>
          </div>
        </div>
        <div className="posts-section">
          <h3>Posts del usuario</h3>
          <div className="post-card">Post sobre videojuegos</div>
          <div className="post-card">Reseña de película</div>
          <div className="post-card">Foto del viaje a Barcelona</div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

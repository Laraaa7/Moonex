import React, { useState, useEffect } from "react";
import Barranav from "../components/Barranav";
import "./Profile.css";
import Seguidores from "../components/Seguidores";
import Siguiendo from "../components/Siguiendo";
import Amigos from "../components/Amigos";
import defaultBanner from "../img/bannerDefecto.jpg";
import defaultProfile from "../img/PfpDefecto.png";
import EditProfile from "../userProfile/EditProfile";
import PostsUsuario from "../components/PostsUsuario";

const Profile = () => {
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showSeguidores, setShowSeguidores] = useState(false);
  const [showSiguiendo, setShowSiguiendo] = useState(false);
  const [showAmigos, setShowAmigos] = useState(false);
  const [user, setUser] = useState(null);

  // Load user data on component mount and when showEditProfile changes
  // This ensures we refresh user data after editing profile
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [showEditProfile]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="profile-container">
      <Barranav />
      <div className="profile-content">
        <div className="profile-card">
          <div
            className="banner"
            style={{ backgroundImage: `url(${user?.banner || defaultBanner})` }}
          >
            <button
              className="edit-profile-button"
              onClick={() => setShowEditProfile(true)}
            >
              Editar perfil
            </button>
          </div>

          <div className="profile-info">
            <img
              className="profile-pic"
              src={user?.foto_perfil || defaultProfile}
              alt="Profile"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultProfile;
              }}
            />
            <span className="online-status"></span>
            <h2>{user?.nombre || "Nombre de Usuario"}</h2>
            <p className="user">
              {user?.username ? `@${user.username}` : "@usuario"}
            </p>

            <p className="dob">🎂 {user?.fecha_nacimiento ? formatDate(user.fecha_nacimiento) : "Fecha de nacimiento"}</p>
            <p className="location">📍 {user?.ubicacion || "Lugar"}</p>
          </div>

          <div className="stats">
            <div
              className="seguidores-stat"
              onClick={() => setShowAmigos(!showAmigos)}
              style={{ position: "relative", cursor: "pointer" }}
            >
              <p>Amigos</p>
              <p className="stat-number">1</p>
              {showAmigos && <Amigos onClose={() => setShowAmigos(false)} />}
            </div>

            <div
              className="seguidores-stat"
              onClick={() => setShowSeguidores(!showSeguidores)}
              style={{ position: "relative", cursor: "pointer" }}
            >
              <p>Seguidores</p>
              <p className="stat-number">1</p>
              {showSeguidores && (
                <Seguidores onClose={() => setShowSeguidores(false)} />
              )}
            </div>

            <div
              className="seguidores-stat"
              onClick={() => setShowSiguiendo(!showSiguiendo)}
              style={{ position: "relative", cursor: "pointer" }}
            >
              <p>Siguiendo</p>
              <p className="stat-number">1</p>
              {showSiguiendo && (
                <Siguiendo onClose={() => setShowSiguiendo(false)} />
              )}
            </div>
          </div>
        </div>

        <PostsUsuario />
      </div>

      {showEditProfile && (
        <EditProfile closeModal={() => setShowEditProfile(false)} />
      )}
    </div>
  );
};

export default Profile;
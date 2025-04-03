import React, { useState } from "react";
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

  return (
    <div className="profile-container">
      <Barranav />
      <div className="profile-content">
        <div className="profile-card">
          <div
            className="banner"
            style={{ backgroundImage: `url(${defaultBanner})` }}
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
              src={defaultProfile}
              alt="Default Profile"
            />
            <span className="online-status"></span>
            <h2>Nombre de Usuario</h2>
            <p className="user">@usuario</p>
            <p className="dob">🎂 8 de diciembre de 2003</p>
            <p className="location">📍 España</p>
          </div>

          <div className="stats">
            <div
              className="seguidores-stat"
              onClick={() => setShowAmigos(!showAmigos)}
              style={{ position: "relative", cursor: "pointer" }}
            >
              <p>Amigos</p>
              <p className="stat-number">1</p>
              {showAmigos && (
                <Amigos onClose={() => setShowAmigos(false)} />
              )}
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

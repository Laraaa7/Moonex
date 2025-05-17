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

const API_BASE_URL = process.env.REACT_APP_API_URL;

const Profile = () => {
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showSeguidores, setShowSeguidores] = useState(false);
  const [showSiguiendo, setShowSiguiendo] = useState(false);
  const [showAmigos, setShowAmigos] = useState(false);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchStats(parsedUser.id);
    } else {
      setLoading(false);
    }
  }, [showEditProfile]);

  const fetchStats = async (userId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/social/estadisticas/${userId}`);
      if (!res.ok) throw new Error("Error al obtener estadísticas");
      const data = await res.json();
      setStats({
        seguidores: data.seguidores ?? 0,
        siguiendo: data.siguiendo ?? 0,
        amigos: data.amigos ?? 0,
      });
    } catch (err) {
      console.error("Error al obtener estadísticas:", err);
      setStats({ seguidores: 0, siguiendo: 0, amigos: 0 });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === "0000-00-00") return "Sin fecha";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES");
    } catch {
      return dateString;
    }
  };

  if (loading || !user || !stats) {
    return (
      <div className="profile-container">
        <Barranav />
        <div className="profile-content">
          <div className="spinner-profile">
            <div className="loader"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <Barranav />
      <div className="profile-content">
        <div className="profile-card">
          <div
            className="banner"
            style={{ backgroundImage: `url(${user.banner || defaultBanner})` }}
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
              src={user.foto_perfil || defaultProfile}
              alt="Profile"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultProfile;
              }}
            />
            <span className="online-status"></span>
            <h2>{user.nombre || "Nombre de Usuario"}</h2>
            <p className="user">@{user.username || "usuario"}</p>
            <p className="dob">
              🎂 {user.fecha_nacimiento ? formatDate(user.fecha_nacimiento) : "Sin fecha"}
            </p>
            <p className="location">
              📍 {user.ubicacion?.trim() ? user.ubicacion : "Sin ubicación"}
            </p>
          </div>

          <div className="stats">
            <div onClick={() => setShowAmigos(!showAmigos)} style={{ cursor: "pointer" }}>
              <p>Amigos</p>
              <p className="stat-number">{stats.amigos}</p>
              {showAmigos && <Amigos onClose={() => setShowAmigos(false)} />}
            </div>

            <div onClick={() => setShowSeguidores(!showSeguidores)} style={{ cursor: "pointer" }}>
              <p>Seguidores</p>
              <p className="stat-number">{stats.seguidores}</p>
              {showSeguidores && <Seguidores onClose={() => setShowSeguidores(false)} />}
            </div>

            <div onClick={() => setShowSiguiendo(!showSiguiendo)} style={{ cursor: "pointer" }}>
              <p>Siguiendo</p>
              <p className="stat-number">{stats.siguiendo}</p>
              {showSiguiendo && <Siguiendo onClose={() => setShowSiguiendo(false)} />}
            </div>
          </div>
        </div>

        {user?.id && <PostsUsuario usuarioId={user.id} />}
      </div>

      {showEditProfile && (
        <EditProfile closeModal={() => setShowEditProfile(false)} />
      )}
    </div>
  );
};

export default Profile;

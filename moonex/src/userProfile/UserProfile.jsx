import React, { useState, useEffect } from "react";
import { FiMail } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { useMediaQuery } from "@mui/material";
import Barranav from "../components/Barranav";
import BarraSuperiorMovil from "../components/BarraSuperiorMovil"; 
import PostsUsuario from "../components/PostsUsuario";
import "./Profile.css";
import "./UserProfile.css";
import defaultBanner from "../img/bannerDefecto.jpg";
import defaultProfile from "../img/PfpDefecto.png";
import Seguidores from "../components/Seguidores";
import Siguiendo from "../components/Siguiendo";
import Amigos from "../components/Amigos";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const UserProfile = () => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({ seguidores: 0, siguiendo: 0, amigos: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { userId: username } = useParams();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
 
  const [showSeguidores, setShowSeguidores] = useState(false);
  const [showSiguiendo, setShowSiguiendo] = useState(false);
  const [showAmigos, setShowAmigos] = useState(false);
  
  const isMobile = useMediaQuery("(max-width: 480px)"); 

  const formatDate = (dateString) => {
    if (!dateString || dateString === "0000-00-00") return "Fecha desconocida";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES");
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_BASE_URL}/usuarios/username/${username}`);
        const data = await res.json();

        if (!res.ok || !data?.id) throw new Error("Usuario no encontrado");

        setUserData(data);

        try {
          const statsRes = await fetch(`${API_BASE_URL}/social/estadisticas/${data.id}`);
          const statsData = await statsRes.json();
          setStats({
            seguidores: statsData.seguidores ?? 0,
            siguiendo: statsData.siguiendo ?? 0,
            amigos: statsData.amigos ?? 0,
          });
        } catch {
          setStats({ seguidores: 0, siguiendo: 0, amigos: 0 });
        }

        if (currentUser.id) {
          try {
            const followRes = await fetch(`${API_BASE_URL}/social/check`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                seguidor_id: currentUser.id,
                seguido_id: data.id,
              }),
            });
            const followStatus = await followRes.json();
            setIsFollowing(followStatus.isFollowing);
          } catch {
            setIsFollowing(false);
          }
        }
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
        setError(error.message || "Error al cargar el perfil");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username, currentUser.id]);

  const handleFollowToggle = async () => {
    if (!currentUser?.id || !userData?.id) {
      alert("Debes iniciar sesión para seguir a otros usuarios");
      return;
    }

    try {
      const newFollowingState = !isFollowing;
      setIsFollowing(newFollowingState);

      setStats(prev => ({
        ...prev,
        seguidores: newFollowingState
          ? prev.seguidores + 1
          : Math.max(0, prev.seguidores - 1),
      }));

      const res = await fetch(`${API_BASE_URL}/social`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seguidor_id: currentUser.id,
          seguido_id: userData.id,
        }),
      });

      const data = await res.json();

      if (data.followed !== newFollowingState) {
        setIsFollowing(data.followed);
      }
    } catch (err) {
      console.error("Error al seguir/dejar de seguir:", err);
      alert("No se pudo actualizar el seguimiento. Inténtalo de nuevo.");
    }
  };

  const handleOpenChat = () => {
    if (!currentUser?.id) {
      alert("Debes iniciar sesión para enviar mensajes");
      return;
    }

    if (userData?.username) {
      navigate(`/chat/${userData.username}`);
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <Barranav />
        {isMobile && <BarraSuperiorMovil />}
        <div className="profile-content">
          <div className="spinner-profile">
            <div className="loader"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <Barranav />
        {isMobile && <BarraSuperiorMovil />}
        <div className="profile-content">
          <div className="error-message">
            <h3>Error</h3>
            <p>{error}</p>
            <button onClick={() => navigate("/")}>Volver al inicio</button>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="profile-container">
        <Barranav />
        {isMobile && <BarraSuperiorMovil />} 
        <div className="profile-content">
          <p>Usuario no encontrado</p>
          <button onClick={() => navigate("/")}>Volver al inicio</button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <Barranav />
      {isMobile && <BarraSuperiorMovil />} 

      <div className="profile-content">
        <div className="profile-card">
          <div
            className="banner"
            style={{ backgroundImage: `url(${userData.banner || defaultBanner})` }}
          >
            <div className="user-actions">
              {currentUser?.id && currentUser?.username !== userData.username && (
                <>
                  <button
                    className={`follow-button ${isFollowing ? "following" : ""}`}
                    onClick={handleFollowToggle}
                  >
                    {isFollowing ? "Siguiendo" : "Seguir"}
                  </button>
                  <button
                    className={`message-button ${isFollowing ? "moved" : ""}`}
                    onClick={handleOpenChat}
                  >
                    <FiMail size={16} />
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="profile-info">
            <img
              className="profile-pic"
              src={userData.foto_perfil || defaultProfile}
              alt="User Profile"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultProfile;
              }}
            />
            <span className="online-status"></span>
            <h2>{userData.nombre}</h2>
            <p className="user">@{userData.username}</p>
            <p className="dob">
              🎂 {userData.fecha_nacimiento && userData.fecha_nacimiento !== "0000-00-00"
                ? formatDate(userData.fecha_nacimiento)
                : "Sin fecha de nacimiento"}
            </p>
            <p className="location">
              📍 {userData.ubicacion?.trim() ? userData.ubicacion : "Sin ubicación"}
            </p>
          </div>

          <div className="stats">
  <div onClick={() => setShowAmigos(!showAmigos)} style={{ cursor: "pointer" }}>
    <p>Amigos</p>
    <p className="stat-number">{stats.amigos}</p>
    {showAmigos && (
      <Amigos onClose={() => setShowAmigos(false)} userId={userData.id} />
    )}
  </div>

  <div onClick={() => setShowSeguidores(!showSeguidores)} style={{ cursor: "pointer" }}>
    <p>Seguidores</p>
    <p className="stat-number">{stats.seguidores}</p>
    {showSeguidores && (
      <Seguidores onClose={() => setShowSeguidores(false)} userId={userData.id} />
    )}
  </div>

  <div onClick={() => setShowSiguiendo(!showSiguiendo)} style={{ cursor: "pointer" }}>
    <p>Siguiendo</p>
    <p className="stat-number">{stats.siguiendo}</p>
    {showSiguiendo && (
      <Siguiendo onClose={() => setShowSiguiendo(false)} userId={userData.id} />
    )}
  </div>
</div>

     
        </div>

        {userData?.id && <PostsUsuario usuarioId={userData.id} />}
      </div>
    </div>
  );
};

export default UserProfile;

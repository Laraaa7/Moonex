import React, { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Siguiendo.css";
import defaultProfile from "../img/PfpDefecto.png";

const API_BASE_URL = "http://localhost:5000";

const Siguiendo = ({ onClose }) => {
  const [siguiendo, setSiguiendo] = useState([]);
  const [estadoBoton, setEstadoBoton] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = currentUser?.id;

  useEffect(() => {
    const fetchSiguiendo = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/social/siguiendo/${userId}`);
        const data = await res.json();
        setSiguiendo(data);

        const estados = {};
        data.forEach(user => {
          estados[user.id] = true;
        });
        setEstadoBoton(estados);
      } catch (error) {
        console.error("Error al obtener usuarios seguidos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchSiguiendo();
    }
  }, [userId]); // Dependencia clara y válida

  const toggleFollow = async (usuarioId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/social`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seguidor_id: userId,
          seguido_id: usuarioId,
        }),
      });

      const data = await res.json();
      setEstadoBoton(prev => ({ ...prev, [usuarioId]: data.followed }));
    } catch (error) {
      console.error("Error al seguir/dejar de seguir:", error);
    }
  };

  const navigateToProfile = (username) => {
    navigate(`/perfilDeUsuario/${username}`);
    onClose();
  };

  const handleModalClick = (e) => e.stopPropagation();

  return (
    <div className="seguidores-overlay" onClick={onClose}>
      <div className="seguidores-modal" onClick={handleModalClick}>
        <div className="seguidores-header">
          <h3>Siguiendo</h3>
          <button onClick={onClose} className="close-button">
            <FaTimes />
          </button>
        </div>
        <div className="seguidores-list">
          {isLoading ? (
            <div className="spinner"></div>
          ) : siguiendo.length === 0 ? (
            <p>No estás siguiendo a nadie todavía.</p>
          ) : (
            siguiendo.map((user) => (
              <div
                className="follower-item"
                key={user.id}
                onClick={() => navigateToProfile(user.username)}
                style={{ cursor: "pointer" }}
              >
              <div className="follower-info">
                <img
                  className="follower-avatar"
                  src={user.foto_perfil || defaultProfile}
                  alt="Foto de perfil"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultProfile;
                  }}
                />
                <div className="follower-text">
                  <p className="follower-name">{user.nombre}</p>
                  <p className="follower-username">@{user.username}</p>
                </div>
              </div>

                <button
                  className={`follow-btn ${estadoBoton[user.id] ? "following" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFollow(user.id);
                  }}
                >
                  {estadoBoton[user.id] ? "Siguiendo" : "Seguir"}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Siguiendo;

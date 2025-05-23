import React, { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Siguiendo.css";
import defaultProfile from "../img/PfpDefecto.png";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const Siguiendo = ({ onClose, userId }) => {
  const [siguiendo, setSiguiendo] = useState([]);
  const [estadoBoton, setEstadoBoton] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchSiguiendo = async (idParaBuscar) => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/social/siguiendo/${idParaBuscar}`);
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

    const idParaBuscar = userId || currentUser?.id;
    if (idParaBuscar) {
      fetchSiguiendo(idParaBuscar);
    }
  }, [userId, currentUser?.id]);

  const toggleFollow = async (usuarioId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/social`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seguidor_id: currentUser.id,
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
            <p>No está siguiendo a nadie todavía.</p>
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

                {!userId && user.id !== currentUser.id && (
                  <button
                    className={`follow-btn ${estadoBoton[user.id] ? "following" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFollow(user.id);
                    }}
                  >
                    {estadoBoton[user.id] ? "Siguiendo" : "Seguir"}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Siguiendo;

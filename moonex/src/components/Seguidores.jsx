import React, { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Seguidores.css";
import defaultProfile from "../img/PfpDefecto.png";

const Seguidores = ({ onClose }) => {
  const [seguidores, setSeguidores] = useState([]);
  const [estadoBotones, setEstadoBotones] = useState({});
  const [isLoading, setIsLoading] = useState(true); 
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchSeguidores = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/social/seguidores/${currentUser.id}`);  // Cambiado aquí
        const data = await res.json();
        setSeguidores(data);

        const estados = {};
        for (const user of data) {
          const checkRes = await fetch(`/social/check`, {   // Cambiado aquí
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              seguidor_id: currentUser.id,
              seguido_id: user.id,
            }),
          });
          const checkData = await checkRes.json();
          estados[user.id] = checkData.isFollowing;
        }

        setEstadoBotones(estados);
      } catch (err) {
        console.error("Error al obtener seguidores:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser?.id) {
      fetchSeguidores();
    }
  }, [currentUser?.id]);

  const toggleFollow = async (usuarioId) => {
    try {
      const res = await fetch(`/social`, {  // Cambiado aquí
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seguidor_id: currentUser.id,
          seguido_id: usuarioId,
        }),
      });

      const data = await res.json();

      setEstadoBotones((prev) => ({
        ...prev,
        [usuarioId]: data.followed,
      }));
    } catch (error) {
      console.error("Error al seguir/dejar de seguir:", error);
    }
  };

  const handleModalClick = (e) => e.stopPropagation();

  const navigateToProfile = (username) => {
    navigate(`/perfilDeUsuario/${username}`);
    onClose();
  };

  return (
    <div className="seguidores-overlay" onClick={onClose}>
      <div className="seguidores-modal" onClick={handleModalClick}>
        <div className="seguidores-header">
          <h3>Seguidores</h3>
          <button onClick={onClose} className="close-button">
            <FaTimes />
          </button>
        </div>
        <div className="seguidores-list">
          {isLoading ? (
            <div className="spinner"></div>
          ) : seguidores.length === 0 ? (
            <p>No tienes seguidores aún.</p>
          ) : (
            seguidores.map((user) => (
              <div
                key={user.id}
                className="follower-item"
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
                {user.id !== currentUser.id && (
                  <button
                    className={`follow-btn ${estadoBotones[user.id] ? "following" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFollow(user.id);
                    }}
                  >
                    {estadoBotones[user.id] ? "Siguiendo" : "Seguir"}
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

export default Seguidores;

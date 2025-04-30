import React, { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import "./Siguiendo.css";

const Siguiendo = ({ onClose }) => {
  const [siguiendo, setSiguiendo] = useState([]);
  const [estadoBoton, setEstadoBoton] = useState({});
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const [isLoading, setIsLoading] = useState(true);

  
  useEffect(() => {
    const fetchSiguiendo = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/social/siguiendo/${currentUser.id}`);
        const data = await res.json();
        setSiguiendo(data);
  
        const inicialEstado = {};
        data.forEach((user) => {
          inicialEstado[user.id] = true;
        });
        setEstadoBoton(inicialEstado);
      } catch (err) {
        console.error("Error al obtener usuarios seguidos:", err);
      } finally {
        setIsLoading(false);
      }
    };
  
    if (currentUser?.id) {
      fetchSiguiendo();
    }
  }, [currentUser?.id]);
  

  const toggleFollow = async (usuarioId) => {
    try {
      const res = await fetch("http://localhost:5000/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seguidor_id: currentUser.id,
          seguido_id: usuarioId,
        }),
      });

      const data = await res.json();

      // Cambiar estado del botón sin eliminar de la lista
      setEstadoBoton((prev) => ({
        ...prev,
        [usuarioId]: data.followed,
      }));
    } catch (error) {
      console.error("Error al seguir/dejar de seguir:", error);
    }
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
                <div key={user.id} className="follower-item">
                  <div className="follower-info">
                    <p className="follower-name">{user.nombre}</p>
                    <p className="follower-username">@{user.username}</p>
                  </div>
                  <button
                    className={`follow-btn ${estadoBoton[user.id] ? "following" : ""}`}
                    onClick={() => toggleFollow(user.id)}
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

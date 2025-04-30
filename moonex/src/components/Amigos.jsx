import React, { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import "./Amigos.css";

const API_BASE_URL = "http://localhost:5000";

const Amigos = ({ onClose }) => {
  const [amigos, setAmigos] = useState([]);
  const [estadoBotones, setEstadoBotones] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchAmigos = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/social/siguiendo/${currentUser.id}`);
        const seguidos = await res.json();

        const amigosMutuos = [];
        const nuevosEstados = {};

        for (const user of seguidos) {
          const checkRes = await fetch(`${API_BASE_URL}/social/check`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              seguidor_id: user.id,
              seguido_id: currentUser.id,
            }),
          });

          const { isFollowing } = await checkRes.json();

          if (isFollowing) {
            amigosMutuos.push(user);
            nuevosEstados[user.id] = true;
          }
        }

        setAmigos(amigosMutuos);
        setEstadoBotones(nuevosEstados);
      } catch (err) {
        console.error("Error al obtener amigos:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser?.id) {
      fetchAmigos();
    }
  }, [currentUser?.id]);

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

      setEstadoBotones((prev) => ({
        ...prev,
        [usuarioId]: data.followed,
      }));
    } catch (error) {
      console.error("Error al seguir/dejar de seguir:", error);
    }
  };

  const handleModalClick = (e) => e.stopPropagation();

  return (
    <div className="amigos-overlay" onClick={onClose}>
      <div className="amigos-modal" onClick={handleModalClick}>
        <div className="amigos-header">
          <h3>Amigos</h3>
          <button onClick={onClose} className="close-button">
            <FaTimes />
          </button>
        </div>
        <div className="amigos-list">
          {isLoading ? (
            <div className="spinner"></div>
          ) : amigos.length === 0 ? (
            <p>No tienes amigos aún.</p>
          ) : (
            amigos.map((user) => (
              <div key={user.id} className="amigo-item">
                <div className="amigo-info">
                  <p className="amigo-name">{user.nombre}</p>
                  <p className="amigo-username">@{user.username}</p>
                </div>
                {user.id !== currentUser.id && (
                  <button
                    className={`amigo-btn ${estadoBotones[user.id] ? "amigos" : ""}`}
                    onClick={() => toggleFollow(user.id)}
                  >
                    {estadoBotones[user.id] ? "Amigos" : "Seguir"}
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

export default Amigos;

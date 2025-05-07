import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AQuienSeguir.css";
import defaultProfile from "../img/PfpDefecto.png";

const AQuienSeguir = () => {
  const [sugerencias, setSugerencias] = useState([]);
  const [estadoBoton, setEstadoBoton] = useState({});
  const [loading, setLoading] = useState(true);
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSugerencias = async () => {
      try {
        const res = await fetch(`/social/sugerencias/${currentUser.id}`);
        const data = await res.json();
        setSugerencias(data);

        const estados = {};
        data.forEach(user => {
          estados[user.id] = false;
        });
        setEstadoBoton(estados);
      } catch (error) {
        console.error("Error al obtener sugerencias:", error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.id) {
      fetchSugerencias();
    }
  }, [currentUser?.id]);

  const toggleFollow = async (usuarioId) => {
    try {
      const res = await fetch(`/social`, {
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
      console.error("Error al seguir:", error);
    }
  };

  const navigateToProfile = (username) => {
    navigate(`/perfilDeUsuario/${username}`);
  };

  return (
    <div className="follow-suggestions">
      <h3>A quién seguir</h3>
      <div className="suggested-users">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="suggested-user loading-card">
              <div className="suggested-user-info">
              </div>
            </div>
          ))
        ) : sugerencias.length === 0 ? (
          <p>No hay sugerencias por ahora.</p>
        ) : (
          sugerencias.map((user) => (
            <div
              className="suggested-user"
              key={user.id}
              onClick={() => navigateToProfile(user.username)}
              style={{ cursor: "pointer" }}
            >
              <div className="suggested-user-info">
                <img
                  className="suggested-profile-pic"
                  src={user.foto_perfil || defaultProfile}
                  alt="Foto de perfil"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultProfile;
                  }}
                />
                <div className="suggested-names">
                  <p className="suggested-name">{user.nombre}</p>
                  <p className="suggested-username">@{user.username}</p>
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
  );
};

export default AQuienSeguir;

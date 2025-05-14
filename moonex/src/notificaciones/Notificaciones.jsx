import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Notificaciones.css";
import Barranav from "../components/Barranav";
import defaultProfile from "../img/PfpDefecto.png";
import ScrollArriba from "../components/ScrollArriba";

const Notificaciones = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      fetch(`/api/notificaciones/${user.id}`) // URL corregida para Render
        .then((res) => res.json())
        .then((data) => {
          setNotificaciones(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error al cargar notificaciones:", err);
          setLoading(false);
        });
    }
  }, [user?.id]);

  const renderTexto = (n) => {
    switch (n.tipo) {
      case "follow":
        return "te ha seguido";
      case "post":
        return "ha creado una nueva publicación";
      case "mensaje":
        return "te ha enviado un mensaje";
      case "comentario":
        return "comentó tu publicación";
      case "respuesta":
        return "respondió a tu comentario";
      case "like":
        return "le dio like a tu publicación";
      default:
        return "tienes una nueva notificación";
    }
  };

  const handleClick = (n) => {
    switch (n.tipo) {
      case "follow":
        navigate(`/perfilDeUsuario/${n.username}`);
        break;
      case "post":
      case "comentario":
      case "respuesta":
      case "like":
        navigate(`/verPost/${n.publicacion_id}`);
        break;
      case "mensaje":
        navigate(`/chat/${n.username}`);
        break;
      default:
        break;
    }
  };

  return (
    <div className="notificaciones-container">
      <Barranav />
      <div className="notificaciones-content">
        <h2>Notificaciones</h2>

        {loading ? (
          <div className="loader-wrapper">
            <div className="loader"></div>
          </div>
        ) : notificaciones.length === 0 ? (
          <p>No tienes notificaciones.</p>
        ) : (
          notificaciones.map((n, i) => (
            <div
              className="notificacion-item"
              key={i}
              onClick={() => handleClick(n)}
              style={{ cursor: "pointer" }}
            >
              <img
                src={n.foto_perfil || defaultProfile}
                alt="Perfil"
                className="notif-avatar"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/perfilDeUsuario/${n.username}`);
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = defaultProfile;
                }}
              />
              <div className="notif-text">
                <span
                  className="notif-user"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/perfilDeUsuario/${n.username}`);
                  }}
                >
                  {n.nombre}{" "}
                  <span className="notif-username">@{n.username}</span>
                </span>{" "}
                {renderTexto(n)}
                <div className="notif-time">
                  {new Date(n.fecha).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  - {new Date(n.fecha).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <ScrollArriba />
    </div>
  );
};

export default Notificaciones;

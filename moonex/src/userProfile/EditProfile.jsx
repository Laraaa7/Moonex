import React, { useState, useEffect, useRef } from "react";
import "./EditProfile.css";
import defaultBanner from "../img/bannerDefecto.jpg";
import defaultProfile from "../img/PfpDefecto.png";
import { FaTimes, FaCamera } from "react-icons/fa";
import imageCompression from "browser-image-compression";

const EditProfile = ({ closeModal }) => {
  const [bannerImage, setBannerImage] = useState(defaultBanner);
  const [profileImage, setProfileImage] = useState(defaultProfile);
  const [nombre, setNombre] = useState("");
  const [username, setUsername] = useState("");
  const [originalUsername, setOriginalUsername] = useState(""); 
  const [nacimiento, setNacimiento] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); 
  
  const API_URL = process.env.REACT_APP_API_URL;

  const bannerInputRef = useRef(null);
  const profileInputRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setNombre(user.nombre || "");
      setUsername(user.username || "");
      setOriginalUsername(user.username || "");
      setUbicacion(user.ubicacion || "");
      setNacimiento(user.fecha_nacimiento?.split("T")[0] || "");
      if (user.banner) setBannerImage(user.banner);
      if (user.foto_perfil) setProfileImage(user.foto_perfil);
    }
  }, []);

  const handleBannerClick = () => bannerInputRef.current.click();
  const handleProfileClick = () => profileInputRef.current.click();

  const handleBannerChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setBannerImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleProfileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 1.5,
          maxWidthOrHeight: 600,
          useWebWorker: true,
        });
        const reader = new FileReader();
        reader.onload = (e) => setProfileImage(e.target.result);
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error("Error al comprimir imagen de perfil:", error);
      }
    }
  };
  

  const checkUsernameAvailability = async (newUsername) => {
    if (newUsername === originalUsername) return true;
    
    try {
      const response = await fetch(`${API_URL}/check-username?username=${newUsername}`);
      return response.ok;
    } catch (error) {
      console.error("Error al verificar username:", error);
      return false;
    }
  };

  const handleSave = async () => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser?.id) return;

    setError("");
    setIsLoading(true);

    try {
      if (username !== originalUsername) {
        const isUsernameAvailable = await checkUsernameAvailability(username);
        
        if (!isUsernameAvailable) {
          setError("El nombre de usuario ya está en uso.");
          setIsLoading(false);
          return;
        }
      }

      const response = await fetch(`${API_URL}/updateProfile/${storedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          username,
          nacimiento: nacimiento.trim() === "" ? null : nacimiento,
          ubicacion: ubicacion.trim() === "" ? null : ubicacion,
          foto_perfil: profileImage,
          banner: bannerImage,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        closeModal();
      } else {
        setError(data.error || "Error al actualizar perfil");
      }
    } catch (err) {
      console.error("Error al guardar perfil:", err);
      setError("Hubo un error al actualizar el perfil.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={closeModal}>
          <FaTimes />
        </button>

        <h2>Editar Perfil</h2>

        <div className="banner" style={{ backgroundImage: `url(${bannerImage})` }}>
          <div className="image-overlay" onClick={handleBannerClick}>
            <div className="camera-icon">
              <FaCamera />
            </div>
          </div>

          {/* Ícono X para quitar banner */}
          {bannerImage !== defaultBanner && (
            <div className="remove-banner-icon" onClick={() => setBannerImage(defaultBanner)}>
              <FaTimes />
            </div>
          )}

          <input
            type="file"
            ref={bannerInputRef}
            onChange={handleBannerChange}
            style={{ display: "none" }}
            accept="image/*"
          />
        </div>

        <div className="profile-pic-container" onClick={handleProfileClick}>
          <img src={profileImage} alt="Profile" className="profile-picture" />
          <div className="profile-pic-overlay">
            <FaCamera className="camera-icon-small" />
          </div>
          <input
            type="file"
            ref={profileInputRef}
            onChange={handleProfileChange}
            style={{ display: "none" }}
            accept="image/*"
          />
        </div>

        <label htmlFor="nombre">Nombre</label>
        <input
          type="text"
          id="nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          maxLength={30}
        />

        <label htmlFor="username">Username (@)</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => {
            const cleanUsername = e.target.value.toLowerCase().trim().replace(/\s+/g, '');
            setUsername(cleanUsername);
          }}
          maxLength={30}
        />

        <label htmlFor="birthdate">Fecha de Nacimiento</label>
        <input
          type="date"
          id="birthdate"
          value={nacimiento}
          onChange={(e) => setNacimiento(e.target.value)}
        />

        <label htmlFor="location">Ubicación</label>
        <input
          type="text"
          id="location"
          value={ubicacion}
          onChange={(e) => setUbicacion(e.target.value)}
          maxLength={20}
        />

        {error && <p className="error-message">{error}</p>}

        <div className="modal-buttons">
          <button className="save-button" onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Guardando..." : "Guardar"}
          </button>
          <button className="cancel-button" onClick={closeModal}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;

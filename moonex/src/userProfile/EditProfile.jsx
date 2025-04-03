import React, { useState } from "react";
import "./EditProfile.css";
import defaultBanner from "../img/bannerDefecto.jpg";
import defaultProfile from "../img/PfpDefecto.png";
import { FaTimes, FaCamera } from "react-icons/fa";

const EditProfile = ({ closeModal }) => {
  const [bannerImage, setBannerImage] = useState(defaultBanner);
  const [profileImage, setProfileImage] = useState(defaultProfile);

  const bannerInputRef = React.useRef(null);
  const profileInputRef = React.useRef(null);

  const handleBannerClick = () => {
    bannerInputRef.current.click();
  };

  const handleProfileClick = () => {
    profileInputRef.current.click();
  };

  const handleBannerChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBannerImage(e.target.result);
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  };

  const handleProfileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target.result);
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={closeModal}>
          <FaTimes />
        </button>
        
        <h2>Editar Perfil</h2>
        
        {/* Banner*/}
        <div className="banner" style={{ backgroundImage: `url(${bannerImage})` }} onClick={handleBannerClick}>
          <div className="image-overlay">
            <div className="camera-icon">
              <FaCamera />
            </div>
          </div>
          <input
            type="file"
            ref={bannerInputRef}
            onChange={handleBannerChange}
            style={{ display: "none" }}
            accept="image/*"
          />
        </div>

        {/* Contenedor foto de perfil */}
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

        <label htmlFor="username">Nombre de Usuario</label>
        <input type="text" id="username" name="username" />

        <label htmlFor="birthdate">Fecha de Nacimiento</label>
        <input type="date" id="birthdate" name="birthdate" />

        <label htmlFor="location">Ubicación</label>
        <input type="text" id="location" name="location" />

        <div className="modal-buttons">
          <button className="save-button">Guardar</button>
          <button className="cancel-button" onClick={closeModal}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
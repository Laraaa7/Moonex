import React, { useState } from "react";
import { IconButton, Menu, MenuItem } from "@mui/material";
import { FaUserCircle, FaBell } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Barranav.css";
import MoonexLogo from "../img/MoonexLogo.png";
import { UserAuth } from "../context/AuthContext";
import SearchBar from "./SearchBar";

const Barranav = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const open = Boolean(anchorEl);
  const { logOut } = UserAuth();

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    try {
      await logOut();
      setAnchorEl(null);
      navigate("/");
      window.location.reload();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <a href="/feed">
          <img src={MoonexLogo} alt="Moonex Logo" />
        </a>
      </div>

      <div className="search-bar-container">
        <SearchBar />
      </div>

      <div className="nav-links">
        <a href="/feed">Inicio</a>
        <a href="/chat">Chats</a>
        <a href="/crearpost">Postear</a>

        <IconButton className="notification-icon" onClick={() => navigate("/notificaciones")}>
          <FaBell size={22} color="white" />
        </IconButton>

        <div className="user-menu">
          <IconButton onClick={handleMenuOpen} className="user-icon">
            <FaUserCircle size={28} color="white" />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            slotProps={{
              paper: {
                className: "custom-menu",
              },
            }}
            disableScrollLock
          >
            <MenuItem onClick={() => { navigate("/perfil"); handleMenuClose(); }}>
              Ver Perfil
            </MenuItem>
            <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
          </Menu>
        </div>
      </div>
    </nav>
  );
};

export default Barranav;

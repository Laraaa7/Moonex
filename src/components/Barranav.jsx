import React, { useState } from "react";
import { TextField, InputAdornment, Menu, MenuItem, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useNavigate } from "react-router-dom";
import "./Barranav.css";
import MoonexLogo from "../img/MoonexLogo.png";
import { UserAuth } from "../context/AuthContext";

const Barranav = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const open = Boolean(anchorEl);
  const { logOut } = UserAuth();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logOut(); // limpia sesión
      setAnchorEl(null);
      navigate("/"); // redirige al login
      window.location.reload(); // 🔄 fuerza recarga para limpiar todo
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

      <div className="search-bar">
        <TextField
          placeholder="Buscar en Moonex"
          size="small"
          className="search-input"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </div>

      <div className="nav-links">
        <a href="/">Inicio</a>
        <a href="/chat">Chats</a>
        <a href="/crearpost">Postear</a>

        <div className="user-menu">
          <IconButton onClick={handleMenuOpen} className="user-icon">
            <AccountCircleIcon fontSize="large" />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            className="user-menu-dropdown"
          >
            <MenuItem onClick={() => { navigate('/perfil'); handleMenuClose(); }}>Ver Perfil</MenuItem>
            <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
          </Menu>
        </div>
      </div>
    </nav>
  );
};

export default Barranav;
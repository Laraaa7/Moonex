import React, { useState } from "react";
import { TextField, InputAdornment, IconButton, Menu, MenuItem } from "@mui/material";
import { FaSearch, FaUserCircle } from "react-icons/fa"; // Usamos react-icons
import { useNavigate } from "react-router-dom";
import "./Barranav.css";
import MoonexLogo from "../img/MoonexLogo.png";
import { UserAuth } from "../context/AuthContext";

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

      <div className="search-bar">
        <TextField
          placeholder="Buscar en Moonex"
          size="small"
          sx={{
            backgroundColor: "#DAE0EE",
            borderRadius: "20px",
            width: "250px",
            '& .MuiOutlinedInput-root': {
              borderRadius: "20px",
              '& fieldset': { border: 'none' },
              '&:hover fieldset': { border: 'none' },
              '&.Mui-focused fieldset': { border: 'none' }
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FaSearch />
              </InputAdornment>
            ),
          }}
        />
      </div>

      <div className="nav-links">
        <a href="/feed">Inicio</a>
        <a href="/chat">Chats</a>
        <a href="/crearpost">Postear</a>

        <div className="user-menu">
          <IconButton onClick={handleMenuOpen} className="user-icon">
            <FaUserCircle size={28} color="white" />
          </IconButton>
          <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
            <MenuItem onClick={() => { navigate('/perfil'); handleMenuClose(); }}>
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

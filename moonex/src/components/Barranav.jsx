import React from "react";
import { TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import "./Barranav.css";
import MoonexLogo from "../img/MoonexLogo.png";

const Barranav = () => {
  return (
    <nav className="navbar">
      <div className="logo">
        <a href="/feed"> {/* Enlace que redirige a la página de inicio */}
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
              '& fieldset': {
                  border: 'none',
              },
              '&:hover fieldset': {
                  border: 'none',
              },
              '&.Mui-focused fieldset': {
                  border: 'none',
              }
            }
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}          
        />
      </div>
      <div className="nav-links">
        <a href="/feed">Inicio</a>
        <a href="/chat">Chats</a>
        <a href="/crearpost">Postear</a>
        <div className="user-menu">
          <a href="/perfil">Perfil</a>
        </div>
      </div>
    </nav>
  );
};

export default Barranav;

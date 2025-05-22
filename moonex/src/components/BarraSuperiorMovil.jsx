import React from "react";
import { useNavigate } from "react-router-dom";
import { IconButton } from "@mui/material";
import { FiLogOut } from "react-icons/fi";
import { UserAuth } from "../context/AuthContext";
import MoonexLogo from "../img/MoonexLogo.png";
import SearchBar from "./SearchBar";
import "./BarraSuperiorMovil.css";

const BarraSuperiorMovil = () => {
  const navigate = useNavigate();
  const { logOut } = UserAuth();

  const handleLogout = async () => {
    try {
      await logOut();
      navigate("/login");
      window.location.reload();
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
  };

  return (
    <div className="barra-superior-movil">
      <div className="barra-logo" onClick={() => navigate("/feed")}>
        <img src={MoonexLogo} alt="Moonex Logo" />
      </div>
      <div className="barra-search">
        <SearchBar />
      </div>
      <IconButton className="btn-logout" onClick={handleLogout} title="Cerrar sesión">
        <FiLogOut color="white" />
      </IconButton>
    </div>
  );
};

export default BarraSuperiorMovil;

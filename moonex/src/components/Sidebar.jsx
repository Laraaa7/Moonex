import React, { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import AQuienSeguir from "./AQuienSeguir";
import PostsPopulares from "./PostsPopulares";
import "./Sidebar.css";

const Sidebar = ({ suggestedUsers }) => {
  const [abierto, setAbierto] = useState(false);

  const toggleSidebar = () => {
    setAbierto(!abierto);
  };

  return (
    <div className="menu-movil-container">
      <button className="menu-icon-btn" onClick={toggleSidebar}>
        {abierto ? <FaTimes /> : <FaBars />}
      </button>

      <div className={`menu-desplegable ${abierto ? "abierto" : ""}`}>
        <AQuienSeguir suggestedUsers={suggestedUsers} />
        <PostsPopulares />
      </div>
    </div>
  );
};

export default Sidebar;

import React from "react";
import { useNavigate } from "react-router-dom";
import { MdEdit } from "react-icons/md";
import "./PostButton.css";

const PostButton = () => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate("/crearpost");
  };
  
  return (
    <div className="post-button-container">
      <button className="post-button" onClick={handleClick}>
        <MdEdit />
        Postear
      </button>
    </div>
  );
};

export default PostButton;
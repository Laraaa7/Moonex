import React from "react";
import "./AQuienSeguir.css";

const AQuienSeguir = ({ suggestedUsers }) => {
  return (
    <div className="follow-suggestions">
      <h3>A quién seguir</h3>
      <div className="suggested-users">
        {suggestedUsers.map((user) => (
          <div key={user.id} className="suggested-user">
            <span>{user.username}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AQuienSeguir;

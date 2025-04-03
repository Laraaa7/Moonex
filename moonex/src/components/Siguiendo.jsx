import React from 'react';
import { FaTimes } from 'react-icons/fa';
import './Siguiendo.css'; 

const Siguiendo = ({ onClose }) => {
  const following = [
    { username: '@User1', name: 'User 1' },
    { username: '@User2', name: 'User 2' },
    { username: '@User3', name: 'User 3' },
    { username: '@User4', name: 'User 4' },
  ];
// hace que no se cierre al clicar
const handleModalClick = (e) => {
  e.stopPropagation();
};
  return (
    <div className="seguidores-overlay">
      <div className="seguidores-modal" onClick={handleModalClick}>
        <div className="seguidores-header">
          <h3>Siguiendo</h3>
          <button onClick={onClose} className="close-button">
            <FaTimes />
          </button>
        </div>
        <div className="seguidores-list">
          {following.map((user, index) => (
            <div key={index} className="follower-item">
              <div className="follower-info">
                <p className="follower-name">{user.name}</p>
                <p className="follower-username">{user.username}</p>
              </div>
              <button className="follow-btn following">Siguiendo</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Siguiendo;

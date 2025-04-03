import React from 'react';
import { FaTimes } from 'react-icons/fa';
import './Seguidores.css';

const Seguidores = ({ onClose }) => {
  const followers = [
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
    <div className="seguidores-overlay" onClick={onClose}>
      <div className="seguidores-modal" onClick={handleModalClick}>
        <div className="seguidores-header">
          <h3>Seguidores</h3>
          <button onClick={onClose} className="close-button">
            <FaTimes />
          </button>
        </div>
        <div className="seguidores-list">
          {followers.map((follower, index) => (
            <div key={index} className="follower-item">
              <div className="follower-info">
                <p className="follower-name">{follower.name}</p>
                <p className="follower-username">{follower.username}</p>
              </div>
              <button className="follow-btn">Seguir</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Seguidores;
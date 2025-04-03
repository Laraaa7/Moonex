import React from 'react';
import { FaTimes } from 'react-icons/fa';
import './Amigos.css';

const Amigos = ({ onClose }) => {
  const friends = [
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
    <div className="amigos-overlay" onClick={onClose}>
      <div className="amigos-modal" onClick={handleModalClick}>
        <div className="amigos-header">
          <h3>Amigos</h3>
          <button onClick={onClose} className="close-button">
            <FaTimes />
          </button>
        </div>
        <div className="amigos-list">
          {friends.map((friend, index) => (
            <div key={index} className="amigo-item">
              <div className="amigo-info">
                <p className="amigo-name">{friend.name}</p>
                <p className="amigo-username">{friend.username}</p>
              </div>
              <button className="amigo-btn">Amigos</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Amigos;
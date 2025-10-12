import React, { useState } from 'react';
import axios from 'axios';

const StartGameButton = ({ roomCode, adminName }) => {
  const [message, setMessage] = useState('');
  const [isGameStarted, setIsGameStarted] = useState(false);

  const startGame = async () => {
    try {
      const response = await axios.post(`/api/rooms/${roomCode}/start`, { playerName: adminName });

      if (response.status === 200) {
        setMessage('Game started successfully!');
        setIsGameStarted(true);
      }
    } catch (error) {
      console.error('Error starting game:', error);
      setMessage(error.response?.data?.message || 'Something went wrong!');
    }
  };

  return (
    <div>
      <button 
        onClick={startGame} 
        disabled={isGameStarted}
        style={{ padding: '10px 20px', backgroundColor: isGameStarted ? 'gray' : 'blue', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
      >
        {isGameStarted ? 'Game Started' : 'Start Game'}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default StartGameButton;

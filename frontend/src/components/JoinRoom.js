import React, { useState } from 'react';
import axios from 'axios';

function JoinRoom({ setRoomCode }) {
  const [roomCode, setRoomCodeInput] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isJoined, setIsJoined] = useState(false);

  const handleJoinRoom = async () => {
    if (!playerName || !roomCode) {
      setErrorMessage("Please fill in both fields!");
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/rooms/join', { roomCode, playerName });
      setRoomCode(roomCode);
      setIsJoined(true); // Set isJoined to true on successful join
      setErrorMessage(''); // Clear the error message on successful join
    } catch (err) {
      setErrorMessage("Room not found or error joining!");
    }
  };

  return (
    <div>
      <h2>Join a Room</h2>
      {!isJoined ? (
        <>
          <input
            type="text"
            placeholder="Enter Room Code"
            value={roomCode}
            onChange={(e) => setRoomCodeInput(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter Your Name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <button onClick={handleJoinRoom}>Join Room</button>
          {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        </>
      ) : (
        <p>You have successfully joined the room!</p>
      )}
    </div>
  );
}

export default JoinRoom;

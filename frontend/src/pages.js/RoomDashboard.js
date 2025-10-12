import React from 'react';
import StartGameButton from './StartGameButton';

const RoomDashboard = () => {
  const roomCode = 'ABC123'; // Replace with actual room code
  const adminName = 'AdminUser'; // Replace with the logged-in admin's name

  return (
    <div>
      <h1>Room Dashboard</h1>
      <p>Room Code: {roomCode}</p>
      <StartGameButton roomCode={roomCode} adminName={adminName} />
    </div>
  );
};

export default RoomDashboard;

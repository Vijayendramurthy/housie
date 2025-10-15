import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css'; // Import the CSS file

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000'

function Home({ setRoomCode }) {
  const [joinRoomCode, setJoinRoomCode] = useState('');
  const [joinPlayerName, setJoinPlayerName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [joinPlayerEmail, setJoinPlayerEmail] = useState('');
  const navigate = useNavigate();

  // Get logged-in user details from localStorage (or context)
  const user = JSON.parse(localStorage.getItem('user'));

  const handleJoinRoom = async () => {
    if (!joinPlayerName || !joinRoomCode || !joinPlayerEmail) {
      setErrorMessage("Please fill in all fields!");
      return;
    }

    setIsJoining(true);
    try {
  await axios.post(`${API_BASE}/api/rooms/join`, { 
        roomCode: joinRoomCode, 
        playerName: joinPlayerName,
        playerEmail: joinPlayerEmail
      });
      setRoomCode(joinRoomCode);
      setErrorMessage('');
      navigate(`/${joinRoomCode}/${joinPlayerName}`);
    } catch (err) {
      if (err.response?.data?.error === 'admin-trying-to-join') {
        navigate(`/admin/${joinRoomCode}`);
        return;
      }
      setErrorMessage("Room not found or error joining!");
    } finally {
      setIsJoining(false);
    }
  };

  const handleCreateRoom = async () => {
    const user = JSON.parse(localStorage.getItem('user')); // Always get the latest user info
    if (!user || !user.name || !user.email) {
      setErrorMessage("User details not found. Please log in again.");
      return;
    }

    setIsCreating(true);
    try {
  const response = await axios.post(`${API_BASE}/api/rooms/create`, { 
        playerName: user.name,
        playerEmail: user.email
      });
      const newRoomCode = response.data.roomCode;
      setRoomCode(newRoomCode);
      setErrorMessage('');
      navigate(`/admin/${newRoomCode}`);
    } catch (err) {
      setErrorMessage("Error creating room!");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">Game Rooms</h1>
        
        <div className="section">
          <h2 className="section-title">Join a Room</h2>
          <div className="form-group">
            <input
              type="text"
              className="form-input"
              placeholder="Enter Room Code"
              value={joinRoomCode}
              onChange={(e) => setJoinRoomCode(e.target.value)}
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              className="form-input"
              placeholder="Enter Your Name"
              value={joinPlayerName}
              onChange={(e) => setJoinPlayerName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <input
              type="email"
              className="form-input"
              placeholder="Enter Your Email"
              value={joinPlayerEmail}
              onChange={(e) => setJoinPlayerEmail(e.target.value)}
            />
          </div>
          <button 
            className={`btn btn-primary ${isJoining ? 'loading' : ''}`}
            onClick={handleJoinRoom}
            disabled={isJoining}
          >
            {isJoining ? '' : 'Join Room'}
          </button>
        </div>

        <div className="divider"></div>

        <div className="section">
          <h2 className="section-title">Create a Room</h2>
          {/* Remove name/email input fields for creating a room */}
          <button 
            className={`btn btn-secondary ${isCreating ? 'loading' : ''}`}
            onClick={handleCreateRoom}
            disabled={isCreating}
          >
            {isCreating ? '' : 'Create Room'}
          </button>
        </div>

        {errorMessage && (
          <div className="error-message">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
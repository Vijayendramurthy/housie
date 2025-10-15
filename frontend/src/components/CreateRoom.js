import React, { useState } from 'react';
import axios from 'axios';
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000'

function CreateRoom({ setRoomCode }) {
  const [adminName, setAdminName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleCreateRoom = async () => {
    const user = JSON.parse(localStorage.getItem('user')); // Fetch fresh user info
    if (!user || !user.name || !user.email) {
      setErrorMessage("User details not found. Please log in again.");
      return;
    }

    if (!adminName) {
      alert("Please enter your name!");
      return;
    }
    
    const response = await axios.post(`${API_BASE}/api/rooms/create`, { 
      playerName: user.name,
      playerEmail: user.email
    });
    setRoomCode(response.data.roomCode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        const res = await axios.post(`${API_BASE}/api/auth/login`, { email, password });
        setUser({ name: res.data.name, email: res.data.email });
        localStorage.setItem('user', JSON.stringify({ name: res.data.name, email: res.data.email }));
        navigate('/');
      } else {
        await axios.post(`${API_BASE}/api/auth/register`, { name, email, password });
        setIsLogin(true);
        setError('Registration successful! Please login.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <div>
      <h2>Create a Room</h2>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      <input
        type="text"
        placeholder="Enter your name"
        value={adminName}
        onChange={(e) => setAdminName(e.target.value)}
      />
      <button onClick={handleCreateRoom}>Create Room</button>
    </div>
  );
}

export default CreateRoom;

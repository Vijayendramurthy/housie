import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar'; // <-- import the Navbar
import './App.css';
import Home from './components/Home';
import Game from './components/Game';
import PlayerTicket from './components/PlayerTicket';
import AdminPage from './components/AdminPage';
import Authentication from './components/authentication';
import Profile from './components/Profile';

function App() {
  // Initialize user from localStorage if available
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [roomCode, setRoomCode] = useState(null);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/auth'; // or use navigate('/auth') if using hooks
  };

  return (
    <Router>
      <div className="App" style={{ paddingTop: 60 }}>
        {user && <Navbar user={user} onLogout={handleLogout} />}
        <Routes>
          <Route path="/auth" element={<Authentication setUser={setUser} />} />
          <Route path="/" element={user ? <Home setRoomCode={setRoomCode} /> : <Authentication setUser={setUser} />} />
          <Route path="/game" element={<Game roomCode={roomCode} />} />
          <Route path="/:roomCode/:playerName" element={<PlayerTicket />} />
          <Route path="/admin/:roomCode" element={<AdminPage />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000'

function Profile() {
  const [games, setGames] = useState([]);
  const [pending, setPending] = useState([]);
  const user = JSON.parse(localStorage.getItem('user')) || null;

  useEffect(() => {
    if (!user) return;

    const fetchGames = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/users/${encodeURIComponent(user.email)}/games`);
        setGames(res.data.games || []);
      } catch (err) {
        console.error('Failed to fetch user games', err);
      }
    };

    const fetchPending = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/admin/${encodeURIComponent(user.email)}/pending`);
        setPending(res.data.pending || []);
      } catch (err) {
        console.error('Failed to fetch pending games', err);
      }
    };

    fetchGames();
    fetchPending();
  }, [user]);

  if (!user) return <div style={{ padding: 24 }}>Please login to view your profile.</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2>{user.name}'s Profile</h2>
      <h3>Pending Games (you are admin)</h3>
      {pending.length === 0 ? <p>No pending games.</p> : (
        <ul>
          {pending.map(p => <li key={p.roomCode}>{p.roomCode} — created {new Date(p.createdAt).toLocaleString()}</li>)}
        </ul>
      )}

      <h3>Games played / participated</h3>
      {games.length === 0 ? <p>No games found.</p> : (
        games.map(g => (
          <div key={g.roomCode} style={{ border: '1px solid #eee', padding: 12, borderRadius: 8, marginBottom: 12 }}>
            <strong>Room:</strong> {g.roomCode} — <em>{g.gameStatus}</em>
            <div>Admin: {g.adminName}</div>
            <div>Players: {g.players.map(p => p.name).join(', ')}</div>
            <div>Created: {new Date(g.createdAt).toLocaleString()}</div>
          </div>
        ))
      )}
    </div>
  );
}

export default Profile;

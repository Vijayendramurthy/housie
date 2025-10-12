import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io("http://localhost:5000");

function Game({ roomCode }) {
  const [roomDetails, setRoomDetails] = useState(null);
  const [currentUser, setCurrentUser] = useState({ name: '', isAdmin: false });
  const [chat, setChat] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const user = JSON.parse(localStorage.getItem('user'));

  const fetchRoomDetails = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/rooms/${roomCode}`);
      setRoomDetails(response.data);

      // Mock current user (replace with actual logic to get logged-in user)
      const currentUserName = prompt("Enter your name"); // Replace with actual user authentication
      const isAdmin = response.data.adminName === currentUserName;

      setCurrentUser({ name: currentUserName, isAdmin });
    } catch (error) {
      console.error('Error fetching room details:', error);
      alert('Failed to fetch room details. Please try again.');
    }
  }, [roomCode]);

  useEffect(() => {
    fetchRoomDetails();
  }, [fetchRoomDetails]);

  useEffect(() => {
    // Join room for chat
    socket.emit('joinRoom', roomCode);

    // Fetch chat history
    const fetchChat = async () => {
      const res = await axios.get(`http://localhost:5000/api/rooms/${roomCode}/chat`);
      setChat(res.data.chat);
    };
    fetchChat();

    // Listen for new messages
    socket.on("chatMessage", (msg) => {
      setChat((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("chatMessage");
    };
  }, [roomCode]);

  const startGame = async () => {
    try {
      await axios.post(`http://localhost:5000/api/rooms/${roomCode}/start`, {
        playerName: currentUser.name,
      });
      alert('Game started successfully!');
      fetchRoomDetails(); // Refresh room details after starting the game
    } catch (error) {
      console.error('Error starting the game:', error);
      alert('Failed to start the game. Ensure you are the admin.');
    }
  };

  const sendMessage = async () => {
    if (!chatInput.trim()) return;
    await axios.post(`http://localhost:5000/api/rooms/${roomCode}/chat`, {
      sender: user.name,
      message: chatInput
    });
    setChatInput("");
  };

  if (!roomDetails) {
    return <p>Loading room details...</p>;
  }

  return (
    <div>
      <h1>Game Room: {roomCode}</h1>
      <h2>Players:</h2>
      <ul>
        {roomDetails.players.map((player, index) => (
          <li key={index}>
            {player.name} {player.isAdmin ? '(Admin)' : ''}
            <div>
              <h4>Ticket:</h4>
              {player.ticket ? (
                <table>
                  <tbody>
                    {player.ticket.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} style={{ border: '1px solid black', padding: '5px' }}>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>Loading ticket...</p>
              )}
            </div>
          </li>
        ))}
      </ul>

      <p>Game Status: {roomDetails?.gameStatus || 'waiting'}</p>

      {currentUser.isAdmin && roomDetails.gameStatus !== 'started' && (
        <button onClick={startGame}>Start Game</button>
      )}
      {roomDetails.gameStatus === 'started' && <p>The game has already started!</p>}

      {roomDetails?.gameStatus !== "started" ? (
        <div className="waiting-message">
          Waiting for admin to start the game...
        </div>
      ) : null}

      <div className="chat-container">
        <div className="chat-messages" style={{ maxHeight: 200, overflowY: 'auto', background: '#f7fafc', padding: 10, borderRadius: 8 }}>
          {chat.map((msg, idx) => (
            <div key={idx}><b>{msg.sender}:</b> {msg.message}</div>
          ))}
        </div>
        <div style={{ display: 'flex', marginTop: 8 }}>
          <input
            type="text"
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            placeholder="Type a message"
            style={{ flex: 1, marginRight: 8 }}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default Game;

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import '../App.css';
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000'
const socket = io(API_BASE);

function PlayerTicket() {
  const { roomCode, playerName } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [generatedNumbers, setGeneratedNumbers] = useState([]);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
  const response = await axios.get(`${API_BASE}/api/rooms/${roomCode}/ticket/${playerName}`);
        setTicket(response.data.ticket);
      } catch (err) {
        console.error("Error fetching ticket:", err);
      }
    };

    const fetchGeneratedNumbers = async () => {
      try {
  const response = await axios.get(`${API_BASE}/api/rooms/${roomCode}/generated-numbers`);
        setGeneratedNumbers(response.data.generatedNumbers);
      } catch (err) {
        console.error("Error fetching generated numbers:", err);
      }
    };

    fetchTicket();
    fetchGeneratedNumbers();

    socket.emit('joinRoom', roomCode);

    socket.on('numberGenerated', (number) => {
      setGeneratedNumbers((prevNumbers) => [...prevNumbers, number]);
    });

    return () => {
      socket.off('numberGenerated');
    };
  }, [roomCode, playerName]);

  const isNumberGenerated = (number) => generatedNumbers.includes(number);

  const checkJaldiFive = () => {
    if (!ticket) return false;
    let count = 0;
    ticket.forEach(row => {
      row.forEach(cell => {
        if (cell && isNumberGenerated(cell)) count++;
      });
    });
    return count >= 5;
  };

  const checkRowWinner = () => {
    if (!ticket) return false;
    return ticket.some(row => row.filter(cell => cell && isNumberGenerated(cell)).length === 5);
  };

  const checkFullHousie = () => {
    if (!ticket) return false;
    return ticket.every(row => row.every(cell => !cell || isNumberGenerated(cell)));
  };

  const handleLeaveRoom = async () => {
    try {
  await axios.post(`${API_BASE}/api/rooms/${roomCode}/leave`, { playerName });
      alert('You have left the room.');
      navigate('/'); // Redirect to home or login
    } catch (err) {
      alert('Failed to leave room');
    }
  };

  return (
    <div className="ticket-container">
      <h2>Player Ticket</h2>
      <p>Room Code: {roomCode}</p>
      <p>Player Name: {playerName}</p>
      <div className="generated-numbers">
        {generatedNumbers.map((number, index) => (
          <span key={index} className="generated-number">{number}</span>
        ))}
      </div>
      {ticket ? (
        <>
          <table className="ticket-table">
            <tbody>
              {ticket.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className={cell ? (isNumberGenerated(cell) ? 'crossed-cell' : 'filled-cell') : 'empty-cell'}>
                      {cell ? (isNumberGenerated(cell) ? 'X' : cell) : ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="status-messages">
            <p>{checkJaldiFive() ? "Jaldi Five Winner!" : "Not yet Jaldi Five"}</p>
            <p>{checkRowWinner() ? "Row Winner!" : "No row completed yet"}</p>
            <p>{checkFullHousie() ? "Full Housie Winner!" : "Not yet Full Housie"}</p>
          </div>
        </>
      ) : (
        <p>Loading ticket...</p>
      )}
      <button onClick={handleLeaveRoom} style={{ marginTop: '20px', background: '#f44336', color: '#fff' }}>
        Leave Room
      </button>
    </div>
  );
}

export default PlayerTicket;
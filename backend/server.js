const express = require('express');
const http = require('http'); // <-- add this
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const Room = require('./models/Room');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const app = express();
const server = http.createServer(app); // <-- use http server
const io = require('socket.io')(server, { cors: { origin: '*' } }); // <-- initialize socket.io

const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/housieGame', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Helper functions
const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const generateTicket = () => {
  const ticket = Array.from({ length: 3 }, () => Array(9).fill(null));
  const columns = Array.from({ length: 9 }, (_, i) => i);

  // Generate numbers for each column
  const columnNumbers = columns.map(col => {
    const start = col * 10 + 1;
    const end = col * 10 + 10;
    return Array.from({ length: 10 }, (_, i) => start + i).filter(n => n <= 90);
  });

  // Distribute numbers across rows
  for (let i = 0; i < 3; i++) {
    let count = 0;
    while (count < 5) {
      const col = Math.floor(Math.random() * 9);
      if (ticket[i][col] === null && columnNumbers[col].length > 0) {
        const numberIndex = Math.floor(Math.random() * columnNumbers[col].length);
        ticket[i][col] = columnNumbers[col].splice(numberIndex, 1)[0];
        count++;
      }
    }
  }

  return ticket;
};

// Routes
app.post('/api/rooms/join', async (req, res) => {
  const { roomCode, playerName, playerEmail } = req.body;
  try {
    const room = await Room.findOne({ roomCode });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    if (room.gameStatus === 'end') return res.status(403).json({ error: 'Room has ended' });

    // Prevent admin from joining as player and generating extra ticket
    const adminEmail = room.players[0]?.email;
    if (playerEmail === adminEmail) {
      return res.status(403).json({ error: 'admin-trying-to-join' });
    }

    // Prevent duplicate player join
    if (room.players.some(p => p.email === playerEmail)) {
      return res.status(400).json({ error: 'Player already joined' });
    }

    // Normal player join
    const player = { name: playerName, email: playerEmail, isAdmin: false, ticket: generateTicket() };
    room.players.push(player);
    await room.save();
    res.json({ success: true });
  } catch (err) {
    console.error('Error joining room:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update Room model to include winner and endTime (do this in models/Room.js):
/*
winner: {
  jaldiFive: { type: String, default: null },
  firstRow: { type: String, default: null },
  secondRow: { type: String, default: null },
  thirdRow: { type: String, default: null },
  fullHousie: { type: String, default: null }
},
endTime: { type: Date }
*/

// Room creation with validation, winner, and endTime
app.post('/api/rooms/create', async (req, res) => {
  const { playerName, playerEmail } = req.body;
  if (!playerName || !playerEmail) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  try {
    const newRoomCode = generateRoomCode();
    const endTime = new Date(Date.now() + 5 * 60 * 60 * 1000); // 5 hours from now
    const room = new Room({
      roomCode: newRoomCode,
      adminName: playerName,
      players: [{
        name: playerName,
        email: playerEmail,
        isAdmin: true,
        ticket: generateTicket()
      }],
      ticket: generateTicket(),
      generatedNumbers: [],
      winner: {
        jaldiFive: null,
        firstRow: null,
        secondRow: null,
        thirdRow: null,
        fullHousie: null
      },
      endTime
    });
    await room.save();
    res.json({ roomCode: newRoomCode });
  } catch (err) {
    console.error('Error creating room:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/rooms/:roomCode/generate-number', async (req, res) => {
  const { roomCode } = req.params;
  try {
    const room = await Room.findOne({ roomCode });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    if (room.gameStatus === 'end') return res.status(403).json({ error: 'Room has ended' });
    const availableNumbers = Array.from({ length: 99 }, (_, i) => i + 1).filter(n => !room.generatedNumbers.includes(n));
    if (availableNumbers.length === 0) return res.status(400).json({ error: 'All numbers have been generated' });
    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    const generatedNumber = availableNumbers[randomIndex];
    room.generatedNumbers.push(generatedNumber);
    await room.save();
    res.json({ generatedNumber });
  } catch (err) {
    console.error('Error generating number:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/rooms/:roomCode/generated-numbers', async (req, res) => {
  const { roomCode } = req.params;
  try {
    const room = await Room.findOne({ roomCode });
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json({ generatedNumbers: room.generatedNumbers });
  } catch (err) {
    console.error('Error fetching generated numbers:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/rooms/:roomCode/ticket/:playerName', async (req, res) => {
  const { roomCode, playerName } = req.params;
  try {
    const room = await Room.findOne({ roomCode });
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    const player = room.players.find(player => player.name === playerName);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    res.json({ ticket: player.ticket });
  } catch (err) {
    console.error('Error fetching ticket:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/rooms/:roomCode/players', async (req, res) => {
  const { roomCode } = req.params;
  try {
    const room = await Room.findOne({ roomCode });
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json({ players: room.players });
  } catch (err) {
    console.error('Error fetching players:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// End the game (admin only)
app.post('/api/rooms/:roomCode/end', async (req, res) => {
  const { roomCode } = req.params;
  try {
    const room = await Room.findOne({ roomCode });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    room.gameStatus = 'end';
    await room.save();
    res.json({ success: true });
  } catch (err) {
    console.error('Error ending game:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark player as left
app.post('/api/rooms/:roomCode/leave', async (req, res) => {
  const { roomCode } = req.params;
  const { playerName } = req.body;
  try {
    const room = await Room.findOne({ roomCode });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    const player = room.players.find(p => p.name === playerName);
    if (!player) return res.status(404).json({ error: 'Player not found' });
    player.left = true;
    await room.save();
    res.json({ success: true });
  } catch (err) {
    console.error('Error leaving room:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Register
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already exists' });
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed });
    await user.save();
    res.json({ success: true });
  } catch (err) {
    console.error('Registration error:', err); // Add this for debugging
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });
    res.json({ success: true, name: user.name, email: user.email });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Middleware to auto-end game after 5 hours
async function checkRoomEnded(req, res, next) {
  const { roomCode } = req.body.roomCode ? req.body : req.params;
  if (!roomCode) return next();
  const room = await Room.findOne({ roomCode });
  if (room && room.endTime && new Date() > room.endTime && room.gameStatus !== 'end') {
    room.gameStatus = 'end';
    await room.save();
  }
  next();
}

// Apply checkRoomEnded to relevant routes
app.post('/api/rooms/join', checkRoomEnded, async (req, res) => {
  const { roomCode, playerName, playerEmail } = req.body;
  try {
    const room = await Room.findOne({ roomCode });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    if (room.gameStatus === 'end') return res.status(403).json({ error: 'Room has ended' });

    // Prevent admin from joining as player and generating extra ticket
    const adminEmail = room.players[0]?.email;
    if (playerEmail === adminEmail) {
      return res.status(403).json({ error: 'admin-trying-to-join' });
    }

    // Prevent duplicate player join
    if (room.players.some(p => p.email === playerEmail)) {
      return res.status(400).json({ error: 'Player already joined' });
    }

    // Normal player join
    const player = { name: playerName, email: playerEmail, isAdmin: false, ticket: generateTicket() };
    room.players.push(player);
    await room.save();
    res.json({ success: true });
  } catch (err) {
    console.error('Error joining room:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.post('/api/rooms/:roomCode/generate-number', checkRoomEnded, async (req, res) => {
  const { roomCode } = req.params;
  try {
    const room = await Room.findOne({ roomCode });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    if (room.gameStatus === 'end') return res.status(403).json({ error: 'Room has ended' });
    const availableNumbers = Array.from({ length: 99 }, (_, i) => i + 1).filter(n => !room.generatedNumbers.includes(n));
    if (availableNumbers.length === 0) return res.status(400).json({ error: 'All numbers have been generated' });
    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    const generatedNumber = availableNumbers[randomIndex];
    room.generatedNumbers.push(generatedNumber);
    await room.save();
    res.json({ generatedNumber });
  } catch (err) {
    console.error('Error generating number:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.get('/api/rooms/:roomCode/players', checkRoomEnded, async (req, res) => {
  const { roomCode } = req.params;
  try {
    const room = await Room.findOne({ roomCode });
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json({ players: room.players });
  } catch (err) {
    console.error('Error fetching players:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start game endpoint (admin only)
app.post('/api/rooms/:roomCode/start', async (req, res) => {
  const { roomCode } = req.params;
  try {
    const room = await Room.findOne({ roomCode });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    room.gameStatus = 'started';
    await room.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to start game' });
  }
});

// Add a chat message
app.post('/api/rooms/:roomCode/chat', async (req, res) => {
  const { roomCode } = req.params;
  const { sender, message } = req.body;
  try {
    const room = await Room.findOne({ roomCode });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    room.chat.push({ sender, message, timestamp: new Date() });
    await room.save();
    io.to(roomCode).emit('chatMessage', { sender, message, timestamp: new Date() }); // emit to room
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get chat messages
app.get('/api/rooms/:roomCode/chat', async (req, res) => {
  const { roomCode } = req.params;
  try {
    const room = await Room.findOne({ roomCode });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json({ chat: room.chat });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch chat' });
  }
});

// Example socket.io usage (add this near the end of your file)
io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
  socket.on('joinRoom', (roomCode) => {
    socket.join(roomCode);
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

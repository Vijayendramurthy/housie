const Room = require('../models/Room');
const TicketGenerator = require('../utils/TicketGenerator'); // For generating tickets

// Create a room with admin and a generated room code
exports.createRoom = async (req, res) => {
  try {
    const { adminName } = req.body;

    if (!adminName) {
      return res.status(400).json({ message: 'Admin name is required!' });
    }

    // Generate a unique room code
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Generate a ticket for the admin
    const adminTicket = TicketGenerator.generateHousieTicket();

    // Create the room with the admin and their ticket
    const room = new Room({
      roomCode,
      adminName,
      players: [{ name: adminName, isAdmin: true, ticket: adminTicket }],
      gameStatus: 'waiting', // Game is in 'waiting' status initially
    });

    // Save room to the database
    await room.save();

    return res.status(201).json({ message: 'Room created successfully!', roomCode });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Join an existing room with a room code
exports.joinRoom = async (req, res) => {
  try {
    const { roomCode, playerName } = req.body;

    if (!playerName || !roomCode) {
      return res.status(400).json({ message: 'Room code and player name are required!' });
    }

    // Check if the room exists
    const room = await Room.findOne({ roomCode });

    if (!room) {
      return res.status(404).json({ message: 'Room not found!' });
    }

    // Check if the player already exists in the room
    if (room.players.some((player) => player.name === playerName)) {
      return res.status(400).json({ message: 'Player already joined the room!' });
    }

    // Generate a unique ticket for the player
    const playerTicket = TicketGenerator.generateHousieTicket();

    // Add the player to the room with their ticket
    room.players.push({ name: playerName, isAdmin: false, ticket: playerTicket });

    // Save the room after adding the player
    await room.save();

    return res.status(200).json({ message: 'Player added to the room!', roomCode });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get room details along with the tickets and players
// Get room details along with the tickets and players
exports.getRoomDetails = async (req, res) => {
  try {
    const { roomCode } = req.params;

    if (!roomCode) {
      return res.status(400).json({ message: 'Room code is required!' });
    }

    const room = await Room.findOne({ roomCode });

    if (!room) {
      return res.status(404).json({ message: 'Room not found!' });
    }

    return res.status(200).json({
      roomCode: room.roomCode,
      adminName: room.adminName,
      players: room.players, // Each player should include a ticket
      gameStatus: room.gameStatus,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


// Start the game
exports.startGame = async (req, res) => {
  try {
    const { roomCode } = req.params;
    const { playerName } = req.body; // This should come from the request body to verify the admin

    if (!roomCode || !playerName) {
      return res.status(400).json({ message: 'Room code and admin player name are required!' });
    }

    // Find the room by room code
    const room = await Room.findOne({ roomCode });

    if (!room) {
      return res.status(404).json({ message: 'Room not found!' });
    }

    // Check if the player trying to start the game is the admin
    const admin = room.players.find(player => player.isAdmin);
    if (!admin || admin.name !== playerName) {
      return res.status(403).json({ message: 'Only the admin can start the game!' });
    }

    // Check if the game has already started
    if (room.gameStatus === 'started') {
      return res.status(400).json({ message: 'Game already started!' });
    }

    // Generate tickets for all players except the admin
    const tickets = room.players
      .filter(player => !player.isAdmin)
      .map(player => TicketGenerator.generateHousieTicket());

    // Update the game status to 'started'
    room.gameStatus = 'started';
    room.ticket = tickets; // Assuming ticket should be added to the room document
    await room.save();

    return res.status(200).json({ message: 'Game started successfully!', roomCode, tickets });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

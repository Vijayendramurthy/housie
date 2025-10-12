const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

// Create a room
router.post('/create', roomController.createRoom);

// Join an existing room
router.post('/join', roomController.joinRoom);

// Get room details (ticket and players)
router.get('/:roomCode', roomController.getRoomDetails);

// Start the game
router.post('/:roomCode/start', roomController.startGame);

module.exports = router;

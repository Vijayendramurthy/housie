// models/Room.js
const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  roomCode: {
    type: String,
    required: true,
    unique: true,
  },
  adminName: {
    type: String,
    required: true,
  },
  players: [
    {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      isAdmin: {
        type: Boolean,
        required: true,
      },
      ticket: {
        type: Array, // Store the ticket for the player
      },
      left: {
        type: Boolean,
        default: false,
      }, // <-- add this line
    },
  ],
  ticket: {
    type: Array,
    required: true,
  },
  winner: {
  jaldiFive: { type: String, default: null },
  firstRow: { type: String, default: null },
  secondRow: { type: String, default: null },
  thirdRow: { type: String, default: null },
  fullHousie: { type: String, default: null }
},
endTime: { type: Date },
  gameStatus: {
    type: String,
    default: 'waiting', // "waiting", "started"
  },
  minPlayers: {
    type: Number,
    default: 2, // You can adjust this as needed
  },
  generatedNumbers: {
    type: [Number], // Store the generated numbers
    default: [],
  },
  chat: [
    {
      sender: String,
      message: String,
      timestamp: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Room', RoomSchema);

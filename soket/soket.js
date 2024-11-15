const socketIo = require('socket.io');
const http = require('http');
const { assignSocketIdToUser } = require('./socketUtils');
const UserModel = require('../models/userModel'); // Import your user model

// Create HTTP server and WebSocket server
const server = http.createServer();
const io = socketIo(server);

// Handle socket connections
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Get user ID from the query params (or from the token)
  const userId = socket.handshake.query.userId;  // e.g., sent via the query param or token
  if (!userId) {
    socket.emit('error', 'User ID is required');
    socket.disconnect();
    return;
  }

  // Assign socketId to user
  assignSocketIdToUser(userId, socket.id)
    .then((user) => {
      console.log('Socket ID assigned:', user.socketId);
      socket.emit('success', 'Socket ID assigned successfully');
    })
    .catch((err) => {
      console.error('Error assigning socket ID:', err);
      socket.emit('error', 'Error assigning socket ID');
    });

  // Handle other socket events (e.g., message, disconnection)
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

module.exports = { server, io };

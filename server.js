const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

// Track messages per room (optional)
const messages = { general: [] };

io.on('connection', (socket) => {
  console.log('🔌 New connection:', socket.id);

  // User joins a room
  socket.on('join-room', ({ username = 'Guest', role = 'agent', room = 'general' }) => {
    socket.username = username;
    socket.role = role;
    socket.room = room;
    socket.join(room);

    console.log(`${username} joined room: ${room} with role: ${role}`);

    // Send role info to client (to show Clear button)
    socket.emit('user-info', { role });

    // Send chat history (optional)
    if (messages[room]) {
      socket.emit('chat-history', messages[room]);
    }

    // Broadcast system message
    socket.to(room).emit('system-message', `${username} has joined the room.`);
  });

  // Handle chat messages
  socket.on('message', ({ room, username, text }) => {
    const msg = { username, text };
    messages[room] = messages[room] || [];
    messages[room].push(msg);

    io.to(room).emit('message', msg);
  });

  // Moderator clears chat (visual only)
  socket.on('clear-room', ({ room }) => {
    console.log('🟢 clear-room event received from:', socket.username, 'role:', socket.role, 'room:', room);

    if (socket.role === 'moderator') {
      console.log(`🧹 Moderator ${socket.username} cleared messages in room: ${room}`);
      io.to(room).emit('clear-messages');
      // Optionally also clear stored messages:
      messages[room] = [];
    } else {
      console.log('❌ Not a moderator, cannot clear');
      socket.emit('system-message', 'You do not have permission to clear the room.');
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    if (socket.room && socket.username) {
      socket.to(socket.room).emit('system-message', `${socket.username} has left the room.`);
    }
  });
});

// Start server
server.listen(3000, () => {
  console.log('🚀 Server listening on http://localhost:3000');
});








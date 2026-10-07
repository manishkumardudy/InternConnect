const socketIo = require('socket.io');

let io = null;
const userSockets = new Map(); // maps userId -> array of socketIds

function initSocket(server) {
  io = socketIo(server, {
    cors: {
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
    }
  });

  io.on('connection', (socket) => {
    // Client authenticates by sending their userId
    socket.on('join_room', (userId) => {
      if (userId) {
        socket.join(userId);
        
        if (!userSockets.has(userId)) {
          userSockets.set(userId, []);
        }
        userSockets.get(userId).push(socket.id);
        
        console.log(`User ${userId} joined room. Socket ID: ${socket.id}`);
      }
    });

    socket.on('disconnect', () => {
      // Find and remove socketId from userSockets map
      for (const [userId, sockets] of userSockets.entries()) {
        const index = sockets.indexOf(socket.id);
        if (index !== -1) {
          sockets.splice(index, 1);
          if (sockets.length === 0) {
            userSockets.delete(userId);
          }
          console.log(`Socket disconnected: ${socket.id} for user ${userId}`);
          break;
        }
      }
    });
  });

  return io;
}

function sendNotification(userId, notification) {
  if (io) {
    // Emit to specific user room (userId string)
    io.to(String(userId)).emit('notification', notification);
    console.log(`Pushed real-time notification to user ${userId}:`, notification.message);
    return true;
  }
  return false;
}

module.exports = {
  initSocket,
  sendNotification,
  getIo: () => io
};

const Message = require('../models/Message');

const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join a chat room by matchId
    socket.on('joinRoom', (matchId) => {
      socket.join(matchId);
      console.log(`Socket ${socket.id} joined room: ${matchId}`);
    });

    // Listen for new messages
    socket.on('sendMessage', async ({ matchId, senderId, text }) => {
      try {
        if (!matchId || !senderId || !text || !text.trim()) return;

        // Persist the message to MongoDB
        const message = await Message.create({
          matchId,
          sender: senderId,
          text: text.trim(),
        });

        const populated = await message.populate('sender', 'name');

        // Broadcast the message to everyone in the room (including sender)
        io.to(matchId).emit('newMessage', {
          _id: populated._id,
          matchId: populated.matchId,
          sender: populated.sender,
          text: populated.text,
          createdAt: populated.createdAt,
        });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('leaveRoom', (matchId) => {
      socket.leave(matchId);
      console.log(`Socket ${socket.id} left room: ${matchId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = initSocket;

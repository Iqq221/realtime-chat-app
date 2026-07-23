const userSocketMap = {}; // { userId: socketId }

const getReceiverSocketId = (receiverId) => {
  if (!receiverId) return null;
  return userSocketMap[receiverId.toString()];
};

const setupSocket = (io) => {
  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId && userId !== "undefined" && userId !== "null") {
      const userIdStr = userId.toString();
      userSocketMap[userIdStr] = socket.id;

      // Join a socket room specific to this user ID
      socket.join(userIdStr);
      console.log(`🟢 User connected: ${userIdStr} | Socket ID: ${socket.id} | Joined room: ${userIdStr}`);
    } else {
      console.log(`⚠️ Socket connected without valid userId: ${socket.id}`);
    }

    // Broadcast online users to everyone
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // Room join for active conversation
    socket.on("joinChat", (conversationId) => {
      if (conversationId) {
        socket.join(conversationId.toString());
        console.log(`💬 Socket ${socket.id} joined conversation room: ${conversationId}`);
      }
    });

    socket.on("leaveChat", (conversationId) => {
      if (conversationId) {
        socket.leave(conversationId.toString());
        console.log(`🚪 Socket ${socket.id} left conversation room: ${conversationId}`);
      }
    });

    // Typing indicators
    socket.on("typing", ({ conversationId, receiverId, senderId }) => {
      if (conversationId) {
        socket.to(conversationId.toString()).emit("userTyping", { conversationId, senderId });
      }
      if (receiverId) {
        socket.to(receiverId.toString()).emit("userTyping", { conversationId, senderId });
      }
    });

    socket.on("stopTyping", ({ conversationId, receiverId, senderId }) => {
      if (conversationId) {
        socket.to(conversationId.toString()).emit("userStopTyping", { conversationId, senderId });
      }
      if (receiverId) {
        socket.to(receiverId.toString()).emit("userStopTyping", { conversationId, senderId });
      }
    });

    // Disconnect
    socket.on("disconnect", () => {
      if (userId && userId !== "undefined" && userId !== "null") {
        const userIdStr = userId.toString();
        // Only delete from userSocketMap if this socket is still the mapped one
        if (userSocketMap[userIdStr] === socket.id) {
          delete userSocketMap[userIdStr];
          console.log(`🔴 User disconnected: ${userIdStr} (Socket ID: ${socket.id})`);
        }
      }
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });
};

module.exports = { setupSocket, getReceiverSocketId, userSocketMap };

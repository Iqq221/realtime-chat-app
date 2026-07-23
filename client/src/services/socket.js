import { io } from "socket.io-client";

let socket = null;
let currentConnectedUserId = null;

export const initSocket = (userId) => {
  const userIdStr = userId?.toString();

  // If socket is already initialized and connected for this user, reuse it!
  if (socket && socket.connected && currentConnectedUserId === userIdStr) {
    return socket;
  }

  // If connected to a different user, disconnect first
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  currentConnectedUserId = userIdStr;

  socket = io("http://localhost:5000", {
    query: { userId: userIdStr },
    withCredentials: true,
    transports: ["websocket", "polling"],
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentConnectedUserId = null;
  }
};

export default socket;
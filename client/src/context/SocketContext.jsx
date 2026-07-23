import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { initSocket, disconnectSocket } from "../services/socket";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    const userId = user?._id || user?.id;

    if (user && userId) {
      console.log(`🔌 Initializing Socket connection for userId: ${userId}`);
      const socketInstance = initSocket(userId);
      setSocket(socketInstance);

      socketInstance.on("getOnlineUsers", (users) => {
        console.log("🟢 Online users list updated:", users);
        setOnlineUsers(users);
      });

      return () => {
        console.log(`🔌 Disconnecting socket for userId: ${userId}`);
        disconnectSocket();
        setSocket(null);
      };
    } else {
      disconnectSocket();
      setSocket(null);
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export default SocketContext;

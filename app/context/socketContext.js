"use client";

import React, { createContext, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const SOCKET_BASE_URL = `${BASE_URL}/dhwani-astro`;

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  const connectSocket = () => {
    if (socket && socket.connected) {
      console.log("Socket already connected");
      return socket;
    }

    const socketInstance = io(SOCKET_BASE_URL, {
      path: "/user-socket-service-v2/socket.io",
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    socketInstance.on("connect", () => {
      console.log("Socket connected:", socketInstance.id);
    });

    socketInstance.on("connect_error", (err) => {
      console.error("Socket error:", err.message);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    setSocket(socketInstance);

    return socketInstance;
  };

  return (
    <SocketContext.Provider value={{ socket, connectSocket }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
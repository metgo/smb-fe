import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const SocketContext = createContext<Socket | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  const accessToken = sessionStorage.getItem("access_token");

  useEffect(() => {
    if (!accessToken) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setSocket(null);
      return;
    }

    if (!socketRef.current) {
      const s = io("http://192.168.18.17:4000", {
        transports: ["websocket"],
        auth: { token: accessToken },
      });
      socketRef.current = s;
      setSocket(s);
      return;
    }

    socketRef.current.auth = { token: accessToken };
    socketRef.current.disconnect();
    socketRef.current.connect();
  }, [accessToken]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

import { io, Socket } from "socket.io-client";
import { createContext, useContext, useEffect, useRef, useState } from "react";

const SocketContext = createContext<Socket | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(
    () => sessionStorage.getItem("access_token"), // ✅ lazy init for first render
  );

  // 👇 Watch sessionStorage for token changes (login/logout)
  useEffect(() => {
    const handleStorageChange = () => {
      const token = sessionStorage.getItem("access_token");
      setAccessToken(token);
    };

    // sessionStorage doesn't fire "storage" event in the same tab,
    // so we use a custom event dispatched from your login/logout logic
    window.addEventListener("session:updated", handleStorageChange);

    return () => {
      window.removeEventListener("session:updated", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    // 🚫 No token → disconnect and clear
    if (!accessToken) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
      return;
    }

    // ✅ Token exists and no socket yet → create new
    if (!socketRef.current) {
      const s = io("http://localhost:4000", {
        transports: ["websocket"],
        auth: { token: accessToken },
      });
      socketRef.current = s;
      setSocket(s);
      return;
    }

    // 🔄 Token changed → reconnect with new token
    socketRef.current.auth = { token: accessToken };
    socketRef.current.disconnect();
    socketRef.current.connect();
  }, [accessToken]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

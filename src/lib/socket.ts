import { io, Socket } from "socket.io-client";

// Cookie-based auth — no token needed in socket handshake
// The browser sends the httpOnly cookie automatically with withCredentials: true
// The backend verifies the cookie on connection

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

const socket: Socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true, // sends httpOnly cookie automatically
});

// Called from AuthProvider after login/refresh succeeds
// Since auth is cookie-based, we just reconnect — no token to pass
export function reconnectSocket() {
  if (socket.connected) {
    socket.disconnect();
  }
  socket.connect();
}

if (import.meta.env.DEV) {
  socket.on("connect", () => console.log("[Socket] Connected:", socket.id));
  socket.on("disconnect", (reason) =>
    console.log("[Socket] Disconnected:", reason),
  );
  socket.on("connect_error", (err) =>
    console.error("[Socket] Error:", err.message),
  );
}

export default socket;

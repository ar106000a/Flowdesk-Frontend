import { createContext } from "react";
import type { Socket } from "socket.io-client";

// ─── Context ──────────────────────────────────────────────────────────────────
export interface SocketContextValue {
  socket: Socket;
  joinProject: (projectId: string) => void;
  leaveProject: (projectId: string) => void;
}

export const SocketContext = createContext<SocketContextValue | null>(null);

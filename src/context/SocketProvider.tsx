import { useEffect } from "react";
import type { ReactNode } from "react";
import socket from "../lib/socket";
import { SocketContext } from "./SocketContext";

// ─── Provider ─────────────────────────────────────────────────────────────────
interface SocketProviderProps {
  children: ReactNode;
  // isAuthenticated comes from AuthContext
  // We only connect the socket once the user has a valid token
  isAuthenticated: boolean;
}

export function SocketProvider({
  children,
  isAuthenticated,
}: SocketProviderProps) {
  useEffect(() => {
    if (isAuthenticated) {
      // Connect the socket when the user logs in
      socket.connect();
    } else {
      // Disconnect when they log out — don't leave orphaned connections
      socket.disconnect();
    }

    // Cleanup: disconnect if this component unmounts (shouldn't happen often
    // since SocketProvider wraps the whole app, but good practice)
    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated]);

  function joinProject(projectId: string) {
    if (socket.connected) {
      socket.emit("join_project", projectId);
    }
  }

  function leaveProject(projectId: string) {
    if (socket.connected) {
      socket.emit("leave_project", projectId);
    }
  }

  return (
    <SocketContext.Provider value={{ socket, joinProject, leaveProject }}>
      {children}
    </SocketContext.Provider>
  );
}

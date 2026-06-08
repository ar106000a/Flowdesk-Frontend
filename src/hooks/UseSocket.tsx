// ─── Hook ─────────────────────────────────────────────────────────────────────
// Components use this instead of importing socket directly

import { useContext } from "react";
import {
  SocketContext,
  type SocketContextValue,
} from "../context/SocketContext.ts";

// It also throws early if someone forgets to wrap their tree in SocketProvider
export function useSocket(): SocketContextValue {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}

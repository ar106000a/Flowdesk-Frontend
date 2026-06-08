import { useState, useEffect, useCallback, type ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import type { User } from "../types";
import { authApi, setAccessToken } from "../lib/api";
import { reconnectSocket } from "../lib/socket";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = useCallback((userData: User, token?: string) => {
    setUser(userData);
    if (token) setAccessToken(token);
    reconnectSocket();
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.post("/api/auth/logout");
    } catch {
      // Clear state regardless
    } finally {
      setUser(null);
      setAccessToken(null);
    }
  }, []);

  // On page load — try to restore session via refresh cookie
  useEffect(() => {
    async function restoreSession() {
      try {
        const response = await authApi.post("/api/auth/refresh");
        const userData = response.data.user as User;
        const token = response.data.accessToken as string | undefined;
        setUser(userData);
        if (token) setAccessToken(token);
        reconnectSocket();
      } catch {
        setUser(null);
        setAccessToken(null);
      } finally {
        setIsLoading(false);
      }
    }
    restoreSession();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

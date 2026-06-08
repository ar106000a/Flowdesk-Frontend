import axios from "axios";
import type { AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";

// Both instances use relative URLs
// Vite proxy (dev) and Vercel rewrites (prod) route by path prefix:
//   /api/auth/* → auth wrapper (port 5001 / Railway)
//   /api/*      → our backend  (port 5000 / Render)

// ─── Auth instance ────────────────────────────────────────────────────────────
// Used by auth forms and AuthProvider only
// NO response interceptor — errors go straight to catch blocks
export const authApi = axios.create({
  baseURL: "",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// ─── Main API instance ────────────────────────────────────────────────────────
// Used for all app requests (projects, tasks, invoices etc.)
const api = axios.create({
  baseURL: "",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// ─── Token storage (in-memory) ────────────────────────────────────────────────
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

// ─── Refresh state ────────────────────────────────────────────────────────────
let isRefreshing = false;
type QueueItem = {
  resolve: (value?: unknown) => void;
  reject: (error?: unknown) => void;
};
let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve();
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => api(originalRequest))
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshRes = await authApi.post("/api/auth/refresh");
      const newToken = refreshRes.data.accessToken as string; // ADD
      setAccessToken(newToken);
      processQueue(null);
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);

      // ── Only redirect if not already on the auth page ──────────────────────
      // Prevents redirect loops and page reloads during login attempts
      const isOnAuthPage = window.location.pathname.startsWith("/auth");
      if (!isOnAuthPage) {
        window.location.href = "/auth";
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;

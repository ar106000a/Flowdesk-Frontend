import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    proxy: {
      // Auth wrapper — MUST be before /api
      "/api/auth": {
        target: "https://flowdesk-auth.onrender.com",
        changeOrigin: true,
      },
      // Our backend
      "/api": {
        target: "https://flowdesk-backend-ji60.onrender.com",
        changeOrigin: true,
      },
      "/app": {
        target: "https://flowdesk-backend-ji60.onrender.com",
        changeOrigin: true,
      },
    },
  },
});

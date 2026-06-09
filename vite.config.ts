import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // Auth wrapper — MUST be before /api
      "/api/auth": { target: "http://localhost:5001", changeOrigin: true },
      // Our backend
      "/api": { target: "http://localhost:5000", changeOrigin: true },
      "/app": { target: "http://localhost:5000", changeOrigin: true },
    },
  },
});

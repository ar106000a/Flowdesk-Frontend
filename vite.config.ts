import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // ── Auth wrapper (port 5001) — MUST be before /api ──────────────────────
      // More specific path first, otherwise /api catches it first
      "/api/auth": {
        target: "http://localhost:5001",
        changeOrigin: true,
      },

      // ── Our own backend (port 5000) ──────────────────────────────────────────
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/app": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});

import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: Number(process.env.FRONTEND_PORT || 5077),
    proxy: {
      "/api": {
        target: process.env.BACKEND_URL || "http://127.0.0.1:4005",
        changeOrigin: true,
      },
    },
  },
})

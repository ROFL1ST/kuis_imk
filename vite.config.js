import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), tailwindcss()],

    resolve: {
      alias: { "@": "/src" },
    },

    server: {
      proxy: {
        /**
         * All /api requests in development are proxied to the backend.
         * This prevents CORS issues and keeps URLs clean.
         * NEVER put secret API keys in .env with VITE_ prefix.
         */
        "/api": {
          target: env.VITE_API_URL || "http://localhost:8080",
          changeOrigin: true,
          secure: false,
          // Uncomment below if your backend does NOT have an /api prefix:
          // rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
  };
});

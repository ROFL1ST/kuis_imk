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
         * Local dev proxy: /api/* → backend
         *
         * X-API-KEY di-inject di sini (server-side, tidak ke bundle).
         * Nilai diambil dari .env.local → VITE_API_KEY.
         *
         * Di production (Vercel), api/proxy.js yang handle ini.
         * VITE_API_KEY hanya dipakai lokal, tidak perlu di-set di Vercel.
         */
        "/api": {
          target: env.VITE_API_URL || "http://localhost:8080",
          changeOrigin: true,
          secure: false,
          headers: {
            "X-API-KEY": env.VITE_API_KEY || "",
          },
          // Uncomment jika backend tidak pakai prefix /api:
          // rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
  };
});

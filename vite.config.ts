import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  base: "/admin/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    //  allowedHosts is what stops a hostile page from driving this dev server
    //  through DNS rebinding, so tunnel providers are not wildcarded in the
    //  repo. Point DEV_ALLOWED_HOSTS at your own tunnel while you use it:
    //    DEV_ALLOWED_HOSTS=quiet-fox-1234.ngrok-free.dev npm run dev
    allowedHosts: [
      "localhost",
      "127.0.0.1",
      "huff-nape-expiring.ngrok-free.dev",
      ".ngrok-free.dev",
      ".ngrok.io",
      ".loca.lt",
      ...(process.env.DEV_ALLOWED_HOSTS?.split(",")
        .map((host) => host.trim())
        .filter(Boolean) ?? []),
    ],
    proxy: {
      "/admin/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router"],
          "vendor-motion": ["motion"],
          "vendor-icons": ["lucide-react"],
          "vendor-virtual": ["@tanstack/react-virtual"],
          "vendor-charts": ["recharts"],
        },
      },
    },
  },
});

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
          "vendor-charts": ["chart.js", "react-chartjs-2"],
        },
      },
    },
  },
});

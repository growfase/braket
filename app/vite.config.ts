import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@assets": fileURLToPath(new URL("./assets", import.meta.url)),
      // Some Solana deps expect Node's Buffer global.
      buffer: "buffer",
    },
  },
  define: {
    // Solana web3.js / wallet-adapter touch these Node globals in the browser.
    global: "globalThis",
    "process.env": {},
  },
  optimizeDeps: {
    include: ["buffer"],
  },
  server: {
    // Honor the port assigned by the preview harness (PORT env), fall back to 5173.
    port: Number(process.env.PORT) || 5173,
  },
});

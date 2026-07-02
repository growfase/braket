import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

// Note: `test` is read by Vitest at runtime. We import defineConfig from "vite"
// (not "vitest/config") so the config loads even when Vitest is run via npx.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  // @ts-expect-error - Vitest-only option, consumed at runtime.
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});

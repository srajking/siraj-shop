import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// unit tests: functions, stores and actions — fast, no server, no browser
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": new URL("./", import.meta.url).pathname } },
  test: { environment: "jsdom", include: ["tests/**/*.test.{ts,tsx}"] },
});

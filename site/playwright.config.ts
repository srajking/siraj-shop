import { defineConfig } from "@playwright/test";

// e2e: the built shop, started, with the API running on :4000
export default defineConfig({
  testDir: "e2e",
  use: { baseURL: "http://localhost:3000" },
  webServer: { command: "npm run start", url: "http://localhost:3000", reuseExistingServer: true },
});

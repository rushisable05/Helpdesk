import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

// Load test environment variables so they are available to Playwright config and tests
dotenv.config({ path: path.resolve(__dirname, "server/.env.test"), override: true });

export default defineConfig({
  testDir: "./e2e/tests",
  globalSetup: "./e2e/global-setup.ts",
  globalTeardown: "./e2e/global-teardown.ts",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  outputDir: "./e2e/test-results",
  reporter: [
    ["list"],
    ["html", { outputFolder: "./e2e/playwright-report" }],
  ],
  use: {
    baseURL: "http://localhost:5174",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: "bun start-test-db.ts",
      cwd: __dirname,
      url: "http://127.0.0.1:5434/health",
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "bun run --cwd server --env-file=.env.test src/index.ts",
      cwd: __dirname,
      url: "http://localhost:3001/api/health",
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "bun run --cwd client vite --port 5174",
      cwd: __dirname,
      url: "http://localhost:5174",
      reuseExistingServer: !process.env.CI,
      env: {
        VITE_API_URL: "http://localhost:3001",
      },
    },
  ],
});

import path from "path";
import dotenv from "dotenv";

export default function globalSetup() {
  const rootDir = path.resolve(__dirname, "..");
  const envPath = path.resolve(rootDir, "server/.env.test");
  dotenv.config({ path: envPath });

  console.log("✅ Playwright test runner initialized with isolated test database.");
}

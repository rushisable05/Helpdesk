import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";

async function main() {
  const dbPath = path.resolve(import.meta.dirname, ".pgdata");
  const pidFile = path.join(dbPath, "postmaster.pid");
  if (fs.existsSync(pidFile)) {
    try { fs.unlinkSync(pidFile); } catch {}
  }

  console.log("⚡ [1/3] Starting Embedded PostgreSQL (Port 5432)...");
  const db = await PGlite.create(dbPath);
  const dbServer = new PGLiteSocketServer({ db, port: 5432, host: "127.0.0.1" });
  await dbServer.start();
  console.log("✅ [DB] Database listening on 127.0.0.1:5432");

  console.log("⚡ [2/3] Starting Backend API (Port 3000)...");
  const serverProc = spawn("bun", ["run", "dev"], {
    cwd: path.resolve(import.meta.dirname, "server"),
    stdio: "inherit",
    shell: true,
  });

  console.log("⚡ [3/3] Starting Frontend Client (Port 5173)...");
  const clientProc = spawn("bun", ["run", "dev"], {
    cwd: path.resolve(import.meta.dirname, "client"),
    stdio: "inherit",
    shell: true,
  });

  const cleanup = async () => {
    console.log("\n🛑 Stopping all services...");
    try { serverProc.kill(); } catch {}
    try { clientProc.kill(); } catch {}
    try { await dbServer.stop(); } catch {}
    try { await db.close(); } catch {}
    const finalPid = path.join(dbPath, "postmaster.pid");
    if (fs.existsSync(finalPid)) {
      try { fs.unlinkSync(finalPid); } catch {}
    }
    process.exit(0);
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
}

main().catch((err) => {
  console.error("Error in dev orchestrator:", err);
  process.exit(1);
});

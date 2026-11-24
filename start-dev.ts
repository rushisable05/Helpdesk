import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import net from "net";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";

function isPortInUse(port: number, host = "127.0.0.1"): Promise<boolean> {
  return new Promise((resolve) => {
    const client = new net.Socket();
    client.setTimeout(800);
    client.once("connect", () => {
      client.destroy();
      resolve(true);
    });
    client.once("timeout", () => {
      client.destroy();
      resolve(false);
    });
    client.once("error", () => {
      client.destroy();
      resolve(false);
    });
    client.connect(port, host);
  });
}

async function main() {
  const dbPath = path.resolve(import.meta.dirname, ".pgdata");
  let dbServer: any = null;
  let db: any = null;

  console.log("⚡ [1/3] Checking Database (Port 5432)...");
  const alreadyRunning = await isPortInUse(5432);

  if (alreadyRunning) {
    console.log("✅ [DB] Database is already running on 127.0.0.1:5432. Reusing existing instance.");
  } else {
    const pidFile = path.join(dbPath, "postmaster.pid");
    if (fs.existsSync(pidFile)) {
      try { fs.unlinkSync(pidFile); } catch {}
    }

    console.log("⚡ Starting Embedded PostgreSQL (Port 5432)...");
    try {
      db = await PGlite.create(dbPath);
      dbServer = new PGLiteSocketServer({ db, port: 5432, host: "127.0.0.1" });
      await dbServer.start();
      console.log("✅ [DB] Database listening on 127.0.0.1:5432");
    } catch (err: any) {
      if (err?.code === "EADDRINUSE" || String(err).includes("EADDRINUSE")) {
        console.log("ℹ️ [DB] Port 5432 is already active. Continuing with existing database...");
      } else {
        throw err;
      }
    }
  }

  const bunPath = process.env.PATH || "";
  const extraPath = path.join(process.env.USERPROFILE || "", ".bun", "bin");
  const env = {
    ...process.env,
    PATH: `${extraPath};${bunPath}`,
  };

  console.log("⚡ [2/3] Starting Backend API (Port 3000)...");
  const serverProc = spawn("bun", ["run", "dev"], {
    cwd: path.resolve(import.meta.dirname, "server"),
    stdio: "inherit",
    shell: true,
    env,
  });

  console.log("⚡ [3/3] Starting Frontend Client (Port 5173)...");
  const clientProc = spawn("bun", ["run", "dev"], {
    cwd: path.resolve(import.meta.dirname, "client"),
    stdio: "inherit",
    shell: true,
    env,
  });

  const cleanup = async () => {
    console.log("\n🛑 Stopping all services...");
    try { serverProc.kill(); } catch {}
    try { clientProc.kill(); } catch {}
    if (dbServer) {
      try { await dbServer.stop(); } catch {}
    }
    if (db) {
      try { await db.close(); } catch {}
    }
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

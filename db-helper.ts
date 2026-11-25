import { PGlite } from "@electric-sql/pglite";
import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";

/**
 * Opens the embedded PGlite database, automatically recovering from WAL
 * corruption if a previous run was terminated abruptly.
 */
export async function openOrRecoverPGlite(dbPath: string): Promise<PGlite> {
  const pidFile = path.join(dbPath, "postmaster.pid");
  if (fs.existsSync(pidFile)) {
    try {
      fs.unlinkSync(pidFile);
    } catch {}
  }

  try {
    return await PGlite.create(dbPath, { relaxedDurability: true });
  } catch (err) {
    console.warn(
      "⚠️ [DB] Database WAL corrupted from previous unclean shutdown. Auto-recovering..."
    );
    try {
      fs.rmSync(dbPath, { recursive: true, force: true });
    } catch {}

    const rootDir = import.meta.dirname;
    execFileSync("bun", ["init-db.ts"], { cwd: rootDir, stdio: "inherit" });
    execFileSync("bun", ["seed-100-tickets.ts"], {
      cwd: rootDir,
      stdio: "inherit",
    });

    return await PGlite.create(dbPath, { relaxedDurability: true });
  }
}
